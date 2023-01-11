import type { AnchorTypes } from '@saberhq/anchor-contrib';
import type { Frex } from '../../target/types/frex';

export type FrexTypes = AnchorTypes<
Frex,
    {
        // Accounts
        controller: Controller;
        domain: Domain;
    },
    {
        // Types
    }
>;

type Accounts = FrexTypes['Accounts'];
type Types = FrexTypes['Defined'];

export type Controller = Accounts['controller'];
export type Domain = Accounts['domain'];

export type FrexError = FrexTypes['Error'];
export type FrexProgram = FrexTypes['Program'];