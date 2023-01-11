import type { AnchorTypes } from '@saberhq/anchor-contrib';
import type { Frex } from '../../target/types/frex';

export type FrexTypes = AnchorTypes<
Frex,
    {
        // Accounts
        controller: Controller;
    },
    {
        // Types
    }
>;

type Accounts = FrexTypes['Accounts'];
type Types = FrexTypes['Defined'];

export type Controller = Accounts['controller'];

export type FrexError = FrexTypes['Error'];
export type FrexProgram = FrexTypes['Program'];