import { SolanaProvider } from "@saberhq/solana-contrib";
import { newProgram } from '@saberhq/anchor-contrib';
import crypto from 'crypto';
import { Buffer } from 'buffer';
import { ConfirmOptions, Connection, PublicKey } from '@solana/web3.js';
import { BN, Wallet } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { IDL } from '../../target/types/frex';
import { Domain, FrexProgram, Buffer as BufferAccount } from './types';

export const CHUNK_BYTE_SIZE = 512;

export class Frex {
    // Disallow new Frex()
    protected constructor(
        public readonly frexProgram: FrexProgram,
        public readonly connection: Connection,
        public readonly wallet: Wallet,
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
            connection,
            wallet,
        )
    }

    public findControllerAddress(): PublicKey {
        return findProgramAddressSync([
            Buffer.from('CONTROLLER'),
        ], this.frexProgram.programId)[0];
    }

    public findDomainAddress(domainName: string): PublicKey {
        return findProgramAddressSync([
            Buffer.from('DOMAIN'),
            Buffer.from(domainName),
        ], this.frexProgram.programId)[0];
    }

    public findVaultAddress(domain: PublicKey): PublicKey {
        return findProgramAddressSync([
            domain.toBuffer(),
        ], this.frexProgram.programId)[0];
    }

    public findBufferAddress(domain: PublicKey, version: number): PublicKey {
        return findProgramAddressSync([
            domain.toBuffer(),
            new BN(version).toArrayLike(Buffer, "le", 8),
        ], this.frexProgram.programId)[0];
    }

    public findBufferChunkAddress(buffer: PublicKey, chunk_number: number): PublicKey {
        return findProgramAddressSync([
            buffer.toBuffer(),
            new BN(chunk_number).toArrayLike(Buffer, "le", 8),
        ], this.frexProgram.programId)[0];
    }

    public generateChecksum(buffer: Buffer): Buffer {
        return Buffer.from(crypto.createHash('sha256')
            .update(buffer.toString())
            .digest('hex'));
    }

    public async getOnChainDomainList(): Promise<{
        [key: string]: Domain;
    }> {
        // Get every Domains
        const encodedDomains = await this.connection.getProgramAccounts(this.frexProgram.programId, {
            filters: [
                {
                    // Domain account have specific size
                    dataSize: 1047,
                },
            ],
        });

        const domains: Domain[] = encodedDomains.map((encodedDomain) => this.frexProgram.coder.accounts.decode('domain', encodedDomain.account.data));

        return domains.reduce((domainList, domain, index) => {
            domainList[encodedDomains[index].pubkey.toBase58()] = domain;

            return domainList;
        }, {} as { [key: string]: Domain });
    }

    public async getOnChainBufferList(): Promise<{
        [key: string]: BufferAccount;
    }> {
        // Get every Buffer
        const encodedBuffers = await this.connection.getProgramAccounts(this.frexProgram.programId, {
            filters: [
                {
                    // Buffer account have specific size
                    dataSize: 1023,
                },
            ],
        });

        const buffers: BufferAccount[] = encodedBuffers.map((encodedBuffer) => this.frexProgram.coder.accounts.decode('buffer', encodedBuffer.account.data));

        return buffers.reduce((bufferList, buffer, index) => {
            bufferList[encodedBuffers[index].pubkey.toBase58()] = buffer;

            return bufferList;
        }, {} as { [key: string]: BufferAccount });
    }

    public static getDomainName(domain: Domain) {
        let i = 0;

        // Remove leading 0 in the buffer to avoid polluting .toString()
        while (domain.name[domain.name.length - 1 - i] == 0) {
            i += 1;
        }

        return Buffer.from(domain.name.slice(0, i)).toString();
    }
} 