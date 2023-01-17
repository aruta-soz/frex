import fs from 'fs'
import util from 'util';
import { PublicKey } from "@solana/web3.js";
import { Frex } from '../../client/src/Frex';

// Look onchain for buffer and bufferChunk and reconstitute the file
export default async function reconstituteFileFromOnChainBuffer({
    newFilePath,
    bufferVersion,
    domainName,
    frex,
}: {
    newFilePath: string;
    bufferVersion: number;
    domainName: string;
    frex: Frex;
}) {
    if (fs.existsSync(newFilePath)) {
        throw new Error(`File already exists at path ${newFilePath}, abort file reconstitution.`);
    }

    const domainAddress = frex.findDomainAddress(domainName);
    const bufferAddress = frex.findBufferAddress(domainAddress, bufferVersion);

    const buffer = await frex.frexProgram.account.buffer.fetchNullable(bufferAddress);

    if (!buffer) {
        throw new Error(`Buffer ${bufferAddress.toBase58()} does not exists.`);
    }

    // Create the new file
    const writeStream = fs.createWriteStream(newFilePath, {
        flags: 'w+',
    });

    const fd = fs.openSync(newFilePath, 'w+');

    for (let chunkNumber = 0; chunkNumber < buffer.chunkNumber.toNumber(); chunkNumber++) {
        console.log(`Load chunk n°${chunkNumber} informations onchain`);

        const bufferChunkAddress = frex.findBufferChunkAddress(bufferAddress, chunkNumber);

        const chunk = await frex.frexProgram.account.bufferChunk.fetchNullable(bufferChunkAddress);

        if (!chunk) {
            throw new Error(`Chunk n°${chunkNumber} is not initialized onchain.`);
        }

        writeStream.write(chunk.data.slice(0, chunk.dataSize));

        // await util.promisify(fs.writeFile)(fd, Buffer.from(chunk.data.slice(0, chunk.dataSize)));
    }

    writeStream.end();

    fs.closeSync(fd);
}
