import type { AnchorTypes } from '@saberhq/anchor-contrib';
import type { Frex } from '../../target/types/frex';

export type FrexTypes = AnchorTypes<
Frex,
    {
        // Accounts
        controller: Controller;
        domain: Domain;
        buffer: Buffer;
    },
    {
        // Types
    }
>;

type Accounts = FrexTypes['Accounts'];
type Types = FrexTypes['Defined'];

export type Controller = Accounts['controller'];
export type Domain = Accounts['domain'];
export type Buffer = Accounts['buffer'];

export type FrexError = FrexTypes['Error'];
export type FrexProgram = FrexTypes['Program'];