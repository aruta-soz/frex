import fs from 'fs'
import util from 'util';
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
import {Buffer, Domain} from '../../client/src/types';
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
    const bufferAddress = frex.findBufferAddress(domainPubKey, bufferVersion)

    const buffer = await frex.frexProgram.account.buffer.fetchNullable(bufferAddress)
    if (buffer === null)
        throw new Error(`buffer at address ${bufferAddress} is missing, what is happening ?`)

    return buffer

}

(async () => {
    const domains = await connection.getProgramAccounts(PROGRAM_ID, {
        encoding: 'base64',
        dataSlice: {offset: 0, length: 0},
        filters: [{dataSize: 1047}]
    })
    const domainsData = await frex.frexProgram.account.domain.fetchMultiple(domains.map(domain => domain.pubkey)) as Domain[]
    console.log(domainsData)

    const activeDomains = domainsData.reduce((accActiveDomains: { [key: string]: Domain }, domain: Domain, i: number) => {
        if (domain.activeBufferVersion.toNumber() === 0)
            return accActiveDomains

        accActiveDomains[domains[i].pubkey.toBase58()] = domain
        return accActiveDomains
    }, {} as { [key: string]: Domain; })

    console.log(activeDomains)
    // generate buffer address
    const buffers = await Promise.all(
        Object.entries(activeDomains).map(([domainPubKey, domain]) => loadBuffer(new PublicKey(domainPubKey), domain.activeBufferVersion.toNumber()))
    )

    console.log(buffers)

    //download buffer chunk

    //open stream and put chunk inside during execution

    //compare checksum

    //dezip

    // add events in program (create instruction)

    // get events

})();