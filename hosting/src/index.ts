import { Wallet } from "@project-serum/anchor";
import {
    Connection,
    PublicKey,
} from "@solana/web3.js";
import { SignerWallet } from '@saberhq/solana-contrib';
import { authorityKeypair, PROGRAM_ID } from "../../tests/constant";
import { Frex } from '../../client/src/Frex';
import { Domain } from '../../client/src/types';
import reconstituteFileFromOnChainBuffer from './reconstitureFileFromOnChainBuffer';
import FrexServer from './FrexServer';

const connection = new Connection("https://api.devnet.solana.com", 'processed');

// <====================================
// <=========== CHANGE HERE ============
// <====================================

// on EC2 requests from 80 are redirected to port 3000
const PORT = 3_000;

// on EC2 use the public ip address for now
// http://44.205.216.27
const SERVER_DOMAIN = 'http://localhost';

// Do not end with '/' it's added inside of the function
// /home/ec2-user/websites on EC2
const DIRECTORY = '/tmp';

// <====================================
// <====================================
// <====================================

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

const server = new FrexServer();

function getActiveDomains(domains: { [domainAddress: string]: Domain }): { [domainAddress: string]: Domain } {
    return Object.entries(domains).reduce((activeDomains, [domainAddress, domain]) => {
        if (domain.activeBufferVersion.toNumber() === 0) {
            return activeDomains;
        }

        activeDomains[domainAddress] = domain;
        return activeDomains;
    }, {} as { [key: string]: Domain });
}

async function loadDomainActiveBufferVersionFileAndServe({
    domainAddress,
    domain,
}: {
    domainAddress: PublicKey;
    domain: Domain;
}) {
    const domainName = Frex.getDomainName(domain);
    const bufferVersion = domain.activeBufferVersion.toNumber();

    try {
        await reconstituteFileFromOnChainBuffer({
            directory: DIRECTORY,
            bufferVersion,
            domainName,
            domainAddress,
            frex,
        });

        // Serve the file
        server.declareDomainBufferVersionFile({
            directory: DIRECTORY,
            domainName,
            bufferVersion,
            serverDomain: SERVER_DOMAIN,
        })
    } catch (e) {
        // Ignore error -- means corrupted buffer or something else, will retry next loop
        console.log(`Loading domain: ${domainName}, buffer version: ${bufferVersion}, failed`);
        return;
    }
}

function sleep(timeInMs: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), timeInMs);
    });
}

(async () => {
    await server.start(PORT);

    // Bruteforce loop
    // TODO: use events
    while (true) {
        // Load all domains
        const domains = await frex.getOnChainDomainList();
        const activeDomains = getActiveDomains(domains);

        // Load all active buffers
        const activeDomainsArray = Object.entries(activeDomains);

        // For each active domain, load the underlying file and serve it
        //
        // Do not handle unserving old buffer, serve everything for now.
        await Promise.all(activeDomainsArray.map(([domainAddress, domain]) => loadDomainActiveBufferVersionFileAndServe({
            domainAddress: new PublicKey(domainAddress),
            domain,
        })));

        console.log('Waiting 30 seconds ...');
        console.log('');
        await sleep(30_000);
    }
})();
