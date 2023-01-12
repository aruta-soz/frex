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
pub const DOMAIN_NAMESPACE: &[u8] = b"DOMAIN";

#[program]
pub mod frex {
    use super::*;

    pub fn create_controller(ctx: Context<CreateController>) -> Result<()> {
        instructions::create_controller::handler(ctx)
    }

    #[access_control(
        ctx.accounts.validate(&name)
    )]
    pub fn register_domain(ctx: Context<RegisterDomain>, name: String) -> Result<()> {
        instructions::register_domain::handler(ctx, name)
    }

    #[access_control(
        ctx.accounts.validate(version, chunk_number)
    )]
    pub fn create_buffer(
        ctx: Context<CreateBuffer>,
        version: u64,
        chunk_number: u64,
    ) -> Result<()> {
        instructions::create_buffer::handler(ctx, version, chunk_number)
    } 
}
