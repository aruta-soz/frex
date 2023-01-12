import type { AnchorTypes } from '@saberhq/anchor-contrib';
import type { Frex } from '../../target/types/frex';

export type FrexTypes = AnchorTypes<
    Frex,
    {
        // Accounts
        controller: Controller;
        domain: Domain;
        buffer: Buffer;
        bufferChunk: BufferChunk;
    },
    {
        // Defined
    }
>;

type Accounts = FrexTypes['Accounts'];
type Defined = FrexTypes['Defined'];

export type Controller = Accounts['controller'];
export type Domain = Accounts['domain'];
export type Buffer = Accounts['buffer'];
export type BufferChunk = Accounts['bufferChunk'];

export type FrexError = FrexTypes['Error'];
export type FrexProgram = FrexTypes['Program'];