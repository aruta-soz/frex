import fs from 'fs'
import util from 'util';
import stream from 'stream';
import {authorityKeypair, collateralMint, payerKeypair, PROGRAM_ID} from "../../tests/constant";
import {CHUNK_BYTE_SIZE, Frex} from '../../client/src/Frex';
import {BN, Wallet} from "@project-serum/anchor";
import {TOKEN_PROGRAM_ID} from "@project-serum/anchor/dist/cjs/utils/token";
import {
    Connection,
    DataSlice,
    GetProgramAccountsFilter,
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";
import {SignerWallet} from '@saberhq/solana-contrib';
import * as crypto from "crypto";
import {Buffer, BufferChunk, Domain} from '../../client/src/types';
import * as domain from "domain";

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
    const out = fs.createWriteStream('/tmp/testFile.txt');

    out.write(bufferChunk.data.toString());
    out.end();

    const newFile = fs.readFileSync('/tmp/testFile.txt')

    const checksumNewFile = Buffer.from(crypto.createHash('sha256')
        .update(newFile.toString())
        .digest('hex').toString());

    const checksumAsHex = Array.from(checksum, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')

    //compare checksum
    console.log("checksum = " + checksumAsHex)
    console.log("checksumNewFile = " + checksumNewFile)

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