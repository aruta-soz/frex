import fs from 'fs'
import util from 'util';
import { authorityKeypair, collateralMint, payerKeypair, PROGRAM_ID } from "../../tests/constant";
import { CHUNK_BYTE_SIZE, Frex } from '../../client/src/Frex';
import { BN, Wallet } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { SignerWallet } from '@saberhq/solana-contrib';

const connection = new Connection("https://api.devnet.solana.com", 'processed');

// Forces the type here - it's enough for Frex needs
const wallet = (new SignerWallet(authorityKeypair)) as unknown as Wallet;

// TODO -- Take given wallet instead of hardcoded one
const frex = Frex.init({
    address: PROGRAM_ID,
    connection,
    wallet,
    opts: {
        commitment: 'confirmed',
    },
});

(async () => {
    // Setup the minimum controller/domain
    const controllerAddress = frex.findControllerAddress();

    // Check/Setup controller
    if ((await frex.frexProgram.account.controller.fetchNullable(controllerAddress)) === null) {
        console.log(`> Controller at address ${controllerAddress} is not initialized. Start initialization ...`);

        const tx = await frex.frexProgram.methods.createController().accounts({
            authority: authorityKeypair.publicKey,
            payer: payerKeypair.publicKey,
            controller: controllerAddress,
            collateralMint,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
        }).signers([payerKeypair, authorityKeypair]).rpc();

        console.log(`Create controller tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    }

    const domainName = 'D';

    const domainAddress = frex.findDomainAddress(domainName);
    const vaultAddress = frex.findVaultAddress(domainAddress);

    // Check/Setup domain
    if ((await frex.frexProgram.account.domain.fetchNullable(domainAddress)) === null) {
        console.log(`> Domain "${domainName}" at address ${domainAddress} is not initialized. Start initialization ...`);

        const tx = await frex.frexProgram.methods.registerDomain(domainName).accounts({
            authority: authorityKeypair.publicKey,
            payer: payerKeypair.publicKey,
            controller: controllerAddress,
            domain: domainAddress,
            vault: vaultAddress,
            collateralMint,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
        }).signers([payerKeypair, authorityKeypair]).rpc();

        console.log(`Register domain "${domainName}" tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    }

    // Create a new buffer to initialize to upload a new file
    const bufferVersion = 1;

    // TODO === Handle case when chunk upload tx fails
    //
    // Open the given file and upload it in an onchain buffer
    async function uploadFile({
        filePath,
        bufferVersion,
        domainAddress,
    }: {
        filePath: string;
        bufferVersion: number;
        domainAddress: PublicKey;
    })/*: Promise<{
        buffer: PublicKey;
        tx: string; 
    }>*/ {
        const bufferAddress = frex.findBufferAddress(domainAddress, bufferVersion);

        // Check for the buffer version to not be already in use
        if ((await frex.frexProgram.account.buffer.fetchNullable(bufferAddress)) !== null) {
            throw new Error(`Buffer version ${bufferVersion} is already initialized. Abort file upload.`);
        }

        // Open the file
        const fd = fs.openSync(filePath, 'r');

        const stats = fs.statSync(filePath);

        console.log('FILE IS', stats.size, 'BYTES');

        // Check how many chunks will be required to upload the file
        const requiredNumberOfChunks = Math.ceil(stats.size / CHUNK_BYTE_SIZE);

        console.log(`FILE REQUIRES ${requiredNumberOfChunks} chunks`);

        // Initialize the buffer where to upload the file
        {
            const tx = await frex.frexProgram.methods.createBuffer(new BN(bufferVersion), new BN(requiredNumberOfChunks)).accounts({
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
        }

        // Upload every chunks
        const promises: Promise<string>[] = [];

        for (let chunkNumber = 0; chunkNumber < requiredNumberOfChunks; chunkNumber++) {
            //
            // Read a part of the file and create a chunk with it
            //

            const bufferChunkAddress = frex.findBufferChunkAddress(bufferAddress, chunkNumber);

            const buffer = Buffer.alloc(CHUNK_BYTE_SIZE, 0);

            const nbBytes = fs.readSync(fd, buffer, 0, CHUNK_BYTE_SIZE, null);

            promises.push(frex.frexProgram.methods.createBufferChunk(
                // buffer version
                new BN(bufferVersion),
                // chunk number
                new BN(chunkNumber),
                // data size
                nbBytes,
                // data
                buffer,
            ).accounts({
                authority: authorityKeypair.publicKey,
                payer: payerKeypair.publicKey,
                controller: controllerAddress,
                domain: domainAddress,
                buffer: bufferAddress,
                bufferChunk: bufferChunkAddress,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                rent: SYSVAR_RENT_PUBKEY,
            })
                .signers([payerKeypair, authorityKeypair])
                .rpc());
        }

        // Resolves all chunk upload now
        let chunkNumber = 0;
        for (let p of promises) {
            const tx = await p;
            console.log(`Create buffer chunk n°${chunkNumber++} tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
        }

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

    // Manual Test
   /* await uploadFile({
        filePath: '/Users/random/work/frex/fileToUpload.txt',
        bufferVersion: 3,
        domainAddress,
    }); */

    // Look onchain for buffer and bufferChunk and reconstitute the file
    async function reconstituteFileFromOnChainBuffer({
        newFilePath,
        bufferVersion,
        domainAddress,
    }: {
        newFilePath: string;
        bufferVersion: number;
        domainAddress: PublicKey;
    }) {
        if (fs.existsSync(newFilePath)) {
            throw new Error(`File already exists at path ${newFilePath}, abort file reconstitution.`);
        }

        const bufferAddress = frex.findBufferAddress(domainAddress, bufferVersion);

        const buffer = await frex.frexProgram.account.buffer.fetchNullable(bufferAddress);

        if (!buffer) {
            throw new Error(`Buffer ${bufferAddress.toBase58()} does not exists.`);
        }

        // Create the new file
        /*const writeStream = fs.createWriteStream(newFilePath, {
            flags: 'w+',
        });*/

        const fd = fs.openSync(newFilePath, 'w+');

        for (let chunkNumber = 0; chunkNumber < buffer.chunkNumber.toNumber(); chunkNumber++) {
            console.log(`Load chunk n°${chunkNumber} informations onchain`);

            const bufferChunkAddress = frex.findBufferChunkAddress(bufferAddress, chunkNumber);

            const chunk = await frex.frexProgram.account.bufferChunk.fetchNullable(bufferChunkAddress);

            if (!chunk) {
                throw new Error(`Chunk n°${chunkNumber} is not initialized onchain.`);
            }

            await util.promisify(fs.writeFile)(fd, Buffer.from(chunk.data.slice(0, chunk.dataSize)));
        }

        fs.closeSync(fd);
    }

    reconstituteFileFromOnChainBuffer({
        newFilePath: '/Users/random/work/frex/loaded-fileToUpload.txt',
        bufferVersion: 3,
        domainAddress,
    });
})();