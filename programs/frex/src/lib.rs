use anchor_lang::prelude::*;
use crate::instructions::*;
use crate::state::buffer_chunk::BUFFER_CHUNK_DATA_SIZE;

declare_id!("EVMEkyWDRvDedeiPjaXXMoRJh6u8r2cC1JamTihdaSip");

#[macro_use]
pub mod error;
pub mod instructions;
pub mod state;
pub mod events;

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
        ctx.accounts.validate(version, chunk_number, checksum)
    )]
    pub fn create_buffer(
        ctx: Context<CreateBuffer>,
        version: u64,
        chunk_number: u64,
        checksum: [u8;64],
    ) -> Result<()> {
        instructions::create_buffer::handler(ctx, version, chunk_number, checksum)
    }

    #[access_control(
        ctx.accounts.validate(
            buffer_version,
            chunk_number,
            data_size,
            data,
        )
    )]
    pub fn create_buffer_chunk(
        ctx: Context<CreateBufferChunk>,
        buffer_version: u64,
        chunk_number: u64,
        data_size: u32,
        data: [u8; BUFFER_CHUNK_DATA_SIZE],
    ) -> Result<()> {
        instructions::create_buffer_chunk::handler(
            ctx,
            buffer_version,
            chunk_number,
            data_size,
            data,
        )
    }

    #[access_control(
        ctx.accounts.validate(
            buffer_version,
        )
    )]
    pub fn set_buffer_ready(
        ctx: Context<SetBufferReady>,
        buffer_version: u64,
    ) -> Result<()> {
        instructions::set_buffer_ready::handler(
            ctx,
            buffer_version,
        )
    } 

    #[access_control(
        ctx.accounts.validate(
            buffer_version,
        )
    )]
    pub fn set_domain_active_buffer_version(
        ctx: Context<SetDomainActiveBufferVersion>,
        buffer_version: u64,
    ) -> Result<()> {
        instructions::set_domain_active_buffer_version::handler(
            ctx,
            buffer_version,
        )
    }  
}
