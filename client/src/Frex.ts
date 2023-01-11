import { SolanaProvider } from "@saberhq/solana-contrib";
import { newProgram } from '@saberhq/anchor-contrib';
import { ConfirmOptions, Connection, PublicKey } from '@solana/web3.js';
import { IDL } from '../../target/types/frex';
import { FrexProgram } from './types';
import { BN, Wallet } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";

export class Frex {
    // Disallow new Frex()
    protected constructor(
        public readonly frexProgram: FrexProgram,
    ) { }

    protected static loadFrexProgram({
        address,
        connection,
        wallet,
        opts,
    }: {
        address: PublicKey,
        connection: Connection,
        wallet: Wallet,
        opts: ConfirmOptions,
    }): FrexProgram {
        const provider = SolanaProvider.init({
            connection,
            wallet,
            opts,
        });

        return newProgram(IDL, address, provider);
    }

    public static init({
        address,
        connection,
        wallet,
        opts,
    }: {
        address: PublicKey,
        connection: Connection,
        wallet: Wallet,
        opts: ConfirmOptions,
    }): Frex {
        return new Frex(
            Frex.loadFrexProgram({
                address,
                connection,
                wallet,
                opts,
            }),
        )
    }

    public findControllerAddress(): PublicKey {
        return findProgramAddressSync([
            Buffer.from('CONTROLLER'),
        ], this.frexProgram.programId)[0];
    }
}