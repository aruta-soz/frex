import fs from 'fs'
import util from 'util';
import { PublicKey } from "@solana/web3.js";
import { exec } from 'child_process';
import { Frex } from '../../client/src/Frex';

function writeStreamEnd(writeStream: fs.WriteStream): Promise<void> {
    return new Promise((resolve) => {
        writeStream.end(() => resolve());
    });
}

// Look onchain for buffer and bufferChunk and reconstitute the file
export default async function reconstituteFileFromOnChainBuffer({
    directory,
    bufferVersion,
    domainName,
    domainAddress,
    frex,
}: {
    directory: string;
    bufferVersion: number;
    domainName: string;
    domainAddress: PublicKey;
    frex: Frex;
}) {
    console.log(`Load file for DomainName: ${domainName} with BufferVersion: ${bufferVersion}`);

    const compressedFilePath = `${directory}/${domainName}-${bufferVersion}.tgz`;

    if (fs.existsSync(compressedFilePath)) {
        console.log(`Domain: ${domainName}, Buffer version: ${bufferVersion}, ${compressedFilePath} file is already downloaded`);
        return;
    }

    const bufferAddress = frex.findBufferAddress(domainAddress, bufferVersion);

    const buffer = await frex.frexProgram.account.buffer.fetchNullable(bufferAddress);
    if (!buffer) {
        throw new Error(`Buffer ${bufferAddress.toBase58()} does not exists.`);
    }

    // Create the new file
    const writeStream = fs.createWriteStream(compressedFilePath, {
        flags: 'w+',
    });

    const fd = fs.openSync(compressedFilePath, 'w+');

    for (let chunkNumber = 0; chunkNumber < buffer.chunkNumber.toNumber(); chunkNumber++) {
        console.log(`Load chunk n°${chunkNumber} informations onchain`);

        const bufferChunkAddress = frex.findBufferChunkAddress(bufferAddress, chunkNumber);

        const chunk = await frex.frexProgram.account.bufferChunk.fetchNullable(bufferChunkAddress);

        if (!chunk) {
            throw new Error(`Chunk n°${chunkNumber} is not initialized onchain.`);
        }

        writeStream.write(Buffer.from(chunk.data.slice(0, chunk.dataSize)));
    }

    await writeStreamEnd(writeStream);

    fs.closeSync(fd);

    const newFileChecksum = frex.generateChecksum(await util.promisify(fs.readFile)(compressedFilePath));

    console.log('Original buffer checksum', Buffer.from(buffer.checksum));
    console.log('New file checksum', newFileChecksum);

    const checksumCheck = Buffer.compare(Buffer.from(buffer.checksum), newFileChecksum);

    if (checksumCheck !== 0) {
        throw new Error('File checksum mismatch.');
    }

    console.log('File checksum matches.');

    // Decompress the file
    const decompressedFilePath = `${directory}/${domainName}-${bufferVersion}`;

    const stdout = await util.promisify(exec)(`tar -xvf ${compressedFilePath} -C ${decompressedFilePath}`);
    console.log('stdout', stdout);
}
