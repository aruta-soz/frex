import { authorityKeypair, collateralMint, payerKeypair, PROGRAM_ID } from "../../tests/constant";
import { Frex } from '../../client/src/Frex';
import { Wallet } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { Connection, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { SignerWallet } from '@saberhq/solana-contrib';
import uploadFile from './uploadFile';
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

// <=================================
// <========== CHANGE HERE ==========
// <=================================
const domainName = 'solana-program-library-docs';

// Create a new buffer to initialize to upload a new file
const bufferVersion = 1;

const filePath = './projectsExampleToUpload/solanaProgramLibrary.tgz';
// <=================================
// <=================================
// <=================================

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

    // Manual Test
    await uploadFile({
        filePath,
        bufferVersion,
        domainName,
        frex,
    });

    /*
    await reconstituteFileFromOnChainBuffer({
        newFilePath: './reconstitutedcraProject.tgz',
        bufferVersion,
        domainName,
        frex,
    });
    */
})();