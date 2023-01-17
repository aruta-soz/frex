import fs from 'fs'
import BN from 'bn.js';
import util from 'util';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { CHUNK_BYTE_SIZE, Frex } from "../../client/src/Frex";
import { authorityKeypair, payerKeypair } from "../../tests/constant";

async function initializeBuffer({
    bufferVersion,
    requiredNumberOfChunks,
    frex,
    controllerAddress,
    domainAddress,
    bufferAddress,
    checksum,
}: {
    bufferVersion: number;
    requiredNumberOfChunks: number;
    frex: Frex;
    controllerAddress: PublicKey;
    domainAddress: PublicKey;
    bufferAddress: PublicKey;
    checksum: Buffer;
}) {
    const tx = await frex.frexProgram.methods.createBuffer(new BN(bufferVersion), new BN(requiredNumberOfChunks), checksum).accounts({
        authority: authorityKeypair.publicKey,
        payer: payerKeypair.publicKey,
        controller: controllerAddress,
        domain: domainAddress,
        buffer: bufferAddress,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
    })
        .signers([payerKeypair, authorityKeypair])
        .rpc();

    console.log(`Create buffer tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    return tx;
}

async function setBufferReady({
    bufferVersion,
    frex,
    controllerAddress,
    domainAddress,
    bufferAddress,
}: {
    bufferVersion: number;
    frex: Frex;
    controllerAddress: PublicKey;
    domainAddress: PublicKey;
    bufferAddress: PublicKey;
}) {
    const tx = await frex.frexProgram.methods.setBufferReady(new BN(bufferVersion)).accounts({
        authority: authorityKeypair.publicKey,
        payer: payerKeypair.publicKey,
        controller: controllerAddress,
        domain: domainAddress,
        buffer: bufferAddress,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
    })
        .signers([payerKeypair, authorityKeypair])
        .rpc();

    console.log(`Set buffer as ready tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
}

class ChunkUpload {
    protected uploadedChunks = 0;

    // -1 means not initialized
    protected totalChunkToUpload = -1;

    protected chunkUploadInProgress = 0;

    // 50 by 50
    protected maxSimultaneousChunkUpload = 30;

    protected constructor(
        public readonly fileDescriptor: number,
        public readonly controllerAddress: PublicKey,
        public readonly domainAddress: PublicKey,
        public readonly bufferAddress: PublicKey,
        public readonly frex: Frex,
        public readonly bufferVersion: number,
    ) { }

    public static init({
        fileDescriptor,
        controllerAddress,
        domainAddress,
        bufferAddress,
        frex,
        bufferVersion,
    }: {
        fileDescriptor: number,
        controllerAddress: PublicKey,
        domainAddress: PublicKey,
        bufferAddress: PublicKey,
        frex: Frex,
        bufferVersion: number,
    }): ChunkUpload {
        return new ChunkUpload(
            fileDescriptor,
            controllerAddress,
            domainAddress,
            bufferAddress,
            frex,
            bufferVersion,
        );
    }

    protected uploadSucceeded(chunkIndex: number, tx: string, callbackAllChunkGotUploaded: () => void) {
        console.log(`Chunk n°${chunkIndex} have been sucessfully uploaded, tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

        this.uploadedChunks += 1;
        this.chunkUploadInProgress -= 1;

        if (this.totalChunkToUpload === this.uploadedChunks) {
            // Upload is over
            callbackAllChunkGotUploaded();
        }
    }

    protected uploadFailed(chunkIndex: number, error: Error, callbackAllChunkGotUploaded: () => void) {
        console.log(`Chunk n°${chunkIndex} failed to be uploaded due to ${error}, retry ...`);

        this.uploadChunk(chunkIndex, callbackAllChunkGotUploaded);

        this.chunkUploadInProgress -= 1;
    }

    // return true if there are data for the given chunkIndex
    protected uploadChunk(chunkIndex: number, callbackAllChunkGotUploaded: () => void): boolean {
        const bufferChunkAddress = this.frex.findBufferChunkAddress(this.bufferAddress, chunkIndex);

        const buffer = Buffer.alloc(CHUNK_BYTE_SIZE, 0);
        const nbBytes = fs.readSync(this.fileDescriptor, buffer, 0, CHUNK_BYTE_SIZE, chunkIndex * CHUNK_BYTE_SIZE);

        // nothing to upload
        if (nbBytes === 0) {
            return false;
        }

        this.chunkUploadInProgress += 1;

        this.frex.frexProgram.methods.createBufferChunk(
            // buffer version
            new BN(this.bufferVersion),
            // chunk number
            new BN(chunkIndex),
            // data size
            nbBytes,
            // data
            buffer,
        ).accounts({
            authority: authorityKeypair.publicKey,
            payer: payerKeypair.publicKey,
            controller: this.controllerAddress,
            domain: this.domainAddress,
            buffer: this.bufferAddress,
            bufferChunk: bufferChunkAddress,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
        })
            .signers([payerKeypair, authorityKeypair])
            .rpc()
            .then((tx: string) => {
                this.uploadSucceeded(chunkIndex, tx, callbackAllChunkGotUploaded);
            })
            .catch((e: Error) => {
                this.uploadFailed(chunkIndex, e, callbackAllChunkGotUploaded);
            });

        return true;
    }

    public uploadAllChunks(): Promise<void> {
        return new Promise((resolve) => {
            this.uploadAllChunksWithCallback(() => resolve());
        });
    }

    // Check that the amount
    protected waitForRoomInQueueWithCallback(callback: () => void) {
        if (this.chunkUploadInProgress < this.maxSimultaneousChunkUpload) {
            callback();
            return;
        }

        // Needs to wait
        setTimeout(() => {
            this.waitForRoomInQueueWithCallback(callback);
        }, 500);
    }

    protected waitForRoomInQueue(): Promise<void> {
        return new Promise((resolve) => {
            this.waitForRoomInQueueWithCallback(() => resolve());
        });
    }

    protected async uploadAllChunksWithCallback(callback: () => void) {
        let chunkIndex = 0;

        while (true) {
            const bufferChunkAddress = this.frex.findBufferChunkAddress(this.bufferAddress, chunkIndex);

            const bufferChunk = await this.frex.frexProgram.account.bufferChunk.fetchNullable(bufferChunkAddress);

            if (!bufferChunk) {
                await this.waitForRoomInQueue();

                if (!this.uploadChunk(chunkIndex, callback)) {
                    this.totalChunkToUpload = chunkIndex;
                    return;
                }
            } else {
                this.uploadedChunks += 1;

                console.log(`Chunk n°${chunkIndex} already initialized`);
            }

            chunkIndex += 1;
        }
    }
}

// TODO === Handle case when chunk upload tx fails
//
// Open the given file and upload it in an onchain buffer
export default async function uploadFile({
    filePath,
    bufferVersion,
    domainName,
    frex,
}: {
    filePath: string;
    bufferVersion: number;
    domainName: string;
    frex: Frex;
}) {
    const controllerAddress = frex.findControllerAddress();
    const domainAddress = frex.findDomainAddress(domainName);
    const bufferAddress = frex.findBufferAddress(domainAddress, bufferVersion);

    // Open the file
    const fd = fs.openSync(filePath, 'r');

    const stats = fs.statSync(filePath);

    console.log('FILE IS', stats.size, 'BYTES');

    // Check how many chunks will be required to upload the file
    const requiredNumberOfChunks = Math.ceil(stats.size / CHUNK_BYTE_SIZE);

    console.log(`FILE REQUIRES ${requiredNumberOfChunks} chunks`);

    // Initialize the buffer where to upload the file

    // Check for the buffer version to not be already in use
    const buffer = await frex.frexProgram.account.buffer.fetchNullable(bufferAddress);

    if (buffer === null) {
        const fileContent = await util.promisify(fs.readFile)(filePath);
        const checksum = frex.generateChecksum(fileContent);

        await initializeBuffer({
            bufferVersion,
            requiredNumberOfChunks,
            frex,
            controllerAddress,
            domainAddress,
            bufferAddress,
            checksum,
        });
    } else if (buffer.ready === true) {
        throw new Error(`Buffer version ${bufferVersion} is already initialized. Abort file upload. Buffer address: ${bufferAddress.toBase58()}`);
    }

    const chunkUpload = ChunkUpload.init({
        fileDescriptor: fd,
        controllerAddress,
        domainAddress,
        bufferAddress,
        frex,
        bufferVersion,
    });

    await chunkUpload.uploadAllChunks();

    // Set the buffer as ready
    {
        const tx = await frex.frexProgram.methods.setBufferReady(new BN(bufferVersion)).accounts({
            authority: authorityKeypair.publicKey,
            payer: payerKeypair.publicKey,
            controller: controllerAddress,
            domain: domainAddress,
            buffer: bufferAddress,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
        })
            .signers([payerKeypair, authorityKeypair])
            .rpc();

        console.log(`Set buffer as ready tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    }
}