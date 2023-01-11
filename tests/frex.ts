import * as anchor from "@project-serum/anchor";
import { BN, Program, Wallet } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { Frex } from "../client/src/Frex";
import { Controller } from "../client/src/types";
import { authorityKeypair, collateralMint, payerKeypair, PROGRAM_ID } from "./constant";

// Configure the client to use the local cluster.
anchor.setProvider(anchor.AnchorProvider.env());

const {
  connection,
  wallet,
} = anchor.AnchorProvider.env();

// Force adding payer, so it fits Serum Wallet type
(wallet as any).payer = payerKeypair;

const frex = Frex.init({
  address: PROGRAM_ID,
  connection,
  wallet: wallet as Wallet,
  opts: {
    commitment: 'confirmed',
  },
});

async function displayTransactionInBase64(transaction: Transaction) {
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  transaction.feePayer = payerKeypair.publicKey;
  transaction.sign(payerKeypair, authorityKeypair);

  console.log("base64 transaction", transaction.serialize().toString('base64'));
}

async function createController(): Promise<{
  controllerAddress: PublicKey;
  controller: Controller;
}> {
  const controllerAddress = frex.findControllerAddress();

  const controller = await frex.frexProgram.account.controller.fetchNullable(controllerAddress);

  if (controller) {
    console.log(`controller ${controllerAddress.toBase58()} already initialized`);

    return {
      controllerAddress,
      controller,
    }
  }

  /*
  displayTransactionInBase64(await frex.frexProgram.methods.createController().accounts({
    authority: authorityKeypair.publicKey,
    payer: payerKeypair.publicKey,
    controller: controllerAddress,
    collateralMint,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    rent: SYSVAR_RENT_PUBKEY,
  }).transaction());
  */

  const tx = await frex.frexProgram.methods.createController().accounts({
    authority: authorityKeypair.publicKey,
    payer: payerKeypair.publicKey,
    controller: controllerAddress,
    collateralMint,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    rent: SYSVAR_RENT_PUBKEY,
  })
    .signers([payerKeypair, authorityKeypair])
    .rpc();

  console.log(`Create controller tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`)

  return {
    controllerAddress,
    controller: await frex.frexProgram.account.controller.fetchNullable(controllerAddress),
  };
} 

describe("frex", () => {
  it("Initialize controller", async () => {

    const {
      controllerAddress,
      controller,
    } = await createController();
  });
});