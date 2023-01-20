import { Keypair, PublicKey, Signer } from "@solana/web3.js";
import authorityKeypairArray from "./authorityKeypairArray";
import payerKeypairArray from "./payerKeypairArray";

export const authorityKeypair: Signer = Keypair.fromSecretKey(Uint8Array.from(authorityKeypairArray));
export const payerKeypair: Signer = Keypair.fromSecretKey(Uint8Array.from(payerKeypairArray));

export const PROGRAM_ID: PublicKey = new PublicKey('DerEBo7cfrBda9n3s2Cd7ZY3PkE8TLkfr1rLk6rFGNdC');

/*
    random> spl-token create-token
    Creating token AEyXZEKMbUW2RzVgqKDzoY6YdLYhXPKvM17SpnWhRcBz
    Address:  AEyXZEKMbUW2RzVgqKDzoY6YdLYhXPKvM17SpnWhRcBz
    Decimals:  9
    Signature: 65UsgC7uRWZydy7JzrNtajrrMZxEhmNizhM35yqp3zhh3FsjU52PRVyBkpibH6XAaVJQVsiHh1iGUhcGTMh92WE
*/

export const collateralMint = new PublicKey('AEyXZEKMbUW2RzVgqKDzoY6YdLYhXPKvM17SpnWhRcBz');

export const collateralMintDecimals = 9;