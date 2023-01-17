import * as anchor from "@project-serum/anchor";
import { BN, Program, Wallet } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { CHUNK_BYTE_SIZE, Frex } from "../client/src/Frex";
import { Controller, Domain, Buffer as BufferFrexType } from "../client/src/types";
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

  try {
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
  } catch (e) {
    displayTransactionInBase64(await frex.frexProgram.methods.createController().accounts({
      authority: authorityKeypair.publicKey,
      payer: payerKeypair.publicKey,
      controller: controllerAddress,
      collateralMint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    }).transaction());

    throw e;
  }

  return {
    controllerAddress,
    controller: await frex.frexProgram.account.controller.fetchNullable(controllerAddress),
  };
}

async function registerDomain(domainName: string): Promise<{
  domainAddress: PublicKey;
  domain: Domain;
}> {
  const controllerAddress = frex.findControllerAddress();
  const domainAddress = frex.findDomainAddress(domainName);
  const vaultAddress = frex.findVaultAddress(domainAddress);

  const domain = await frex.frexProgram.account.domain.fetchNullable(domainAddress)

  if (domain) {
    console.log(`domain ${domainAddress.toBase58()} already initialized`);

    return {
      domainAddress,
      domain,
    };
  }

  try {
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
    })
      .signers([payerKeypair, authorityKeypair])
      .rpc();

    console.log(`Register domain "${domainName}" tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`)
  } catch (e) {
    displayTransactionInBase64(await frex.frexProgram.methods.registerDomain(domainName).accounts({
      authority: authorityKeypair.publicKey,
      payer: payerKeypair.publicKey,
      controller: controllerAddress,
      domain: domainAddress,
      vault: vaultAddress,
      collateralMint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    }).transaction());

    throw e;
  }

  return {
    domainAddress,
    domain: await frex.frexProgram.account.domain.fetchNullable(domainAddress),
  };
}

async function createBuffer({
  domainName,
  version,
  chunkNumber,
}: {
  domainName: string,
  version: number,
  chunkNumber: number,
}): Promise<{
  bufferAddress: PublicKey;
  buffer: BufferFrexType;
}> {
  const controllerAddress = frex.findControllerAddress();
  const domainAddress = frex.findDomainAddress(domainName);
  const bufferAddress = frex.findBufferAddress(domainAddress, version);

  const buffer = await frex.frexProgram.account.buffer.fetchNullable(bufferAddress)

  if (buffer) {
    console.log(`buffer ${bufferAddress.toBase58()} already initialized`);

    return {
      bufferAddress,
      buffer,
    };
  }

  try {
    const tx = await frex.frexProgram.methods.createBuffer(new BN(version), new BN(chunkNumber)).accounts({
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
  } catch (e) {
    displayTransactionInBase64(await frex.frexProgram.methods.createBuffer(new BN(version), new BN(chunkNumber)).accounts({
      authority: authorityKeypair.publicKey,
      payer: payerKeypair.publicKey,
      controller: controllerAddress,
      domain: domainAddress,
      buffer: bufferAddress,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    }).transaction());

    throw e;
  }

  return {
    bufferAddress,
    buffer: await frex.frexProgram.account.buffer.fetchNullable(bufferAddress),
  };
}

async function createBufferChunk({
  domainName,
  bufferVersion,
  chunkNumber,
}: {
  domainName: string;
  bufferVersion: number;
  chunkNumber: number;
}) {
  const controllerAddress = frex.findControllerAddress();
  const domainAddress = frex.findDomainAddress(domainName);
  const bufferAddress = frex.findBufferAddress(domainAddress, bufferVersion);
  const bufferChunkAddress = frex.findBufferChunkAddress(bufferAddress, chunkNumber);

  const bufferChunk = await frex.frexProgram.account.bufferChunk.fetchNullable(bufferChunkAddress)

  if (bufferChunk) {
    console.log(`bufferChunk ${bufferChunkAddress.toBase58()} already initialized`);

    return {
      bufferChunkAddress,
      bufferChunk,
    };
  }

  const buffer = Buffer.alloc(CHUNK_BYTE_SIZE, 0);
  buffer[0] = 1;
  buffer[1] = 2;
  buffer[2] = 3;
  buffer[3] = 4;
  buffer[4] = 5;

  try {
    const tx = await frex.frexProgram.methods.createBufferChunk(
      // buffer version
      new BN(bufferVersion),
      // chunk number
      new BN(chunkNumber),
      // data size
      5,
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
      .rpc();

    console.log(`Create buffer chunk tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  } catch (e) {
    displayTransactionInBase64(await frex.frexProgram.methods.createBufferChunk(
      // buffer version
      new BN(bufferVersion),
      // chunk number
      new BN(chunkNumber),
      // data size
      5,
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
    }).transaction());

    throw e;
  }

  return {
    bufferChunkAddress,
    bufferChunk: await frex.frexProgram.account.bufferChunk.fetchNullable(bufferChunkAddress),
  };
}

async function setBufferReady({
  domainName,
  bufferVersion,
}: {
  domainName: string;
  bufferVersion: number;
}): Promise<string> {
  const controllerAddress = frex.findControllerAddress();
  const domainAddress = frex.findDomainAddress(domainName);
  const bufferAddress = frex.findBufferAddress(domainAddress, bufferVersion);

  try {
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

    return tx;
  } catch (e) {
    displayTransactionInBase64(await frex.frexProgram.methods.setBufferReady(new BN(bufferVersion)).accounts({
      authority: authorityKeypair.publicKey,
      payer: payerKeypair.publicKey,
      controller: controllerAddress,
      domain: domainAddress,
      buffer: bufferAddress,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    }).transaction());

    throw e;
  }
}

async function setDomainActiveBufferVersion({
  domainName,
  bufferVersion,
}: {
  domainName: string;
  bufferVersion: number;
}): Promise<string> {
  const controllerAddress = frex.findControllerAddress();
  const domainAddress = frex.findDomainAddress(domainName);
  const bufferAddress = frex.findBufferAddress(domainAddress, bufferVersion);

  try {
    const tx = await frex.frexProgram.methods.setDomainActiveBufferVersion(new BN(bufferVersion)).accounts({
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

    console.log(`Set domain active buffer version tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`)

    return tx;
  } catch (e) {
    displayTransactionInBase64(await frex.frexProgram.methods.setDomainActiveBufferVersion(new BN(bufferVersion)).accounts({
      authority: authorityKeypair.publicKey,
      payer: payerKeypair.publicKey,
      controller: controllerAddress,
      domain: domainAddress,
      buffer: bufferAddress,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    }).transaction());

    throw e;
  }
}

describe("frex", () => {
  it("Initialize controller", async () => {

    const {
      controllerAddress,
      controller,
    } = await createController();

    const domainName = 'C';

    const {
      domainAddress,
      domain,
    } = await registerDomain(domainName);

    const {
      bufferAddress,
      buffer,
    } = await createBuffer({
      domainName,
      version: 1,
      chunkNumber: 3,
    });

    // Setup all buffer chunks for test
    const infos = await Promise.all([
      createBufferChunk({
        domainName,
        bufferVersion: 1,
        chunkNumber: 1,
      }),
      createBufferChunk({
        domainName,
        bufferVersion: 1,
        chunkNumber: 2,
      }),
      createBufferChunk({
        domainName,
        bufferVersion: 1,
        chunkNumber: 3,
      }),
    ]);

    await setBufferReady({
      domainName,
      bufferVersion: 1,
    });

    await setDomainActiveBufferVersion({
      domainName,
      bufferVersion: 1,
    });
  });
});