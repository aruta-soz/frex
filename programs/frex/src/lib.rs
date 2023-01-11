use anchor_lang::prelude::*;
use crate::instructions::*;

declare_id!("8rWa9BXJ2X34LhR3Xb9PS3Cxnuq5VS5LGXTThnckUNCY");

#[macro_use]
pub mod error;
pub mod instructions;
pub mod state;

// Amount of byte added by anchor as prefix when calling instruction
pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

pub const CONTROLLER_NAMESPACE: &[u8] = b"CONTROLLER";

#[program]
pub mod frex {
    use super::*;

    pub fn create_controller(ctx: Context<CreateController>) -> Result<()> {
        instructions::create_controller::handler(ctx)
    }
}
