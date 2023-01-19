import fs from 'fs'
import { authorityKeypair, PROGRAM_ID } from "../../tests/constant";
import { Frex } from '../../client/src/Frex';
import { Wallet } from "@project-serum/anchor";
import {
    Connection,
    PublicKey,
} from "@solana/web3.js";
import { SignerWallet } from '@saberhq/solana-contrib';
import * as crypto from "crypto";
import { Buffer, BufferChunk, Domain } from '../../client/src/types';
import reconstituteFileFromOnChainBuffer from './reconstitureFileFromOnChainBuffer';

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

function getActiveDomains(domains: { [domainAddress: string]: Domain }): { [domainAddress: string]: Domain } {
    return Object.entries(domains).reduce((activeDomains, [domainAddress, domain]) => {
        if (domain.activeBufferVersion.toNumber() === 0) {
            return activeDomains;
        }

        activeDomains[domainAddress] = domain;
        return activeDomains;
    }, {} as { [key: string]: Domain });
}

(async () => {
    // Load all domains
    const domains = await frex.getOnChainDomainList();
    const activeDomains = getActiveDomains(domains);

    // Load all active buffers
    const activeDomainsArray = Object.entries(activeDomains);

    const bufferAddresses = activeDomainsArray.map(([domainAddress, domain]) => {
        return frex.findBufferAddress(new PublicKey(domainAddress), domain.activeBufferVersion.toNumber());
    });

    bufferAddresses.forEach((x, i) =>{
        console.log(i, 'Buffer addresses', x.toBase58());
    })

    // const buffers = (await frex.frexProgram.account.buffer.fetchMultiple(bufferAddresses)) as Buffer[];

    const downloadedWebsitesResult = await Promise.allSettled(activeDomainsArray.map(([domainAddress, domain]) => {
        const domainName = Frex.getDomainName(domain);
        const bufferVersion = domain.activeBufferVersion.toNumber();

        return reconstituteFileFromOnChainBuffer({
            newFilePath: `/tmp/${domainName}-${bufferVersion}.tgz`,
            bufferVersion,
            domainName,
            domainAddress: new PublicKey(domainAddress),
            frex,
        });
    }));

    downloadedWebsitesResult.forEach((r, i) => {
        if (r.status === 'rejected') {
            console.log(i, 'Rejected', r.reason);
        } else {
            console.log(i, 'Successfull', r.value)
        }
    });
})();

/*
async function loadBuffer(domainPubKey: PublicKey, bufferVersion: number) {
    const bufferAddress: PublicKey = frex.findBufferAddress(domainPubKey, bufferVersion)

    const buffer: Buffer = await frex.frexProgram.account.buffer.fetchNullable(bufferAddress)
    if (buffer === null)
        throw new Error(`buffer at address ${bufferAddress} is missing, what is happening ?`)

    console.log("buffer = " + buffer)

    const checksum = buffer.checksum
    const bufferChunkAddress: PublicKey = frex.findBufferChunkAddress(bufferAddress, buffer.chunkNumber.toNumber())
    //open stream and put chunk inside during execution

    console.log("bufferChunkAddress = " + bufferChunkAddress)

    const bufferChunk: BufferChunk = await frex.frexProgram.account.bufferChunk.fetchNullable(bufferChunkAddress)

    console.log("bufferChunk = " + bufferChunk)
    const out = fs.createWriteStream('./tmp/testFile.txt');

    out.write(Buffer.from(bufferChunk.data.slice(0, bufferChunk.dataSize)));
    out.end();

    const newFile = fs.readFileSync('./tmp/testFile.txt')

    const checksumBufferNewFile = Buffer.from(crypto.createHash('sha256')
        .update(newFile.toString())
        .digest('hex'));

    const checksumBuffer = Buffer.from(checksum)

    const resultBufferCompare = Buffer.compare(checksumBuffer, checksumBufferNewFile)
    console.log("resultBufferCompare : ", resultBufferCompare)

    //dezip
    return bufferChunk
}

async function loadBufferChunks(domainPubKey: PublicKey, chunk_number: number) {
    const bufferChunkAddress = frex.findBufferChunkAddress(domainPubKey, chunk_number)

    const bufferChunk = await frex.frexProgram.account.bufferChunk.fetchNullable(bufferChunkAddress)
    if (bufferChunk === null)
        throw new Error(`bufferChunk at address ${bufferChunkAddress} is missing, what is happening ?`)

    return bufferChunk
}

(async () => {
    const domains = await connection.getProgramAccounts(PROGRAM_ID, {
        encoding: 'base64',
        dataSlice: {offset: 0, length: 0},
        filters: [{dataSize: 1047}]
    })
    const domainsData: Domain[] = await frex.frexProgram.account.domain.fetchMultiple(domains.map(domain => domain.pubkey)) as Domain[]

    const activeDomains = domainsData.reduce((accActiveDomains: { [key: string]: Domain }, domain: Domain, i: number) => {
        if (domain.activeBufferVersion.toNumber() === 0)
            return accActiveDomains

        accActiveDomains[domains[i].pubkey.toBase58()] = domain
        return accActiveDomains
    }, {} as { [key: string]: Domain; })

    // generate buffer address
    const buffers = await Promise.all(Object.entries(activeDomains).map(([domainPubKey, domain]) => loadBuffer(new PublicKey(domainPubKey), domain.activeBufferVersion.toNumber())))

    console.log(buffers)




    // add events in program (create instruction)

    // get events

})();
*/