use crate::error::FrexError;
use crate::state::BufferChunk;
use crate::state::Controller;
use crate::state::Domain;
use crate::state::BUFFER_CHUNK_DATA_SIZE;
use crate::state::BUFFER_CHUNK_SPACE;
use crate::state::Buffer;
use crate::CONTROLLER_NAMESPACE;
use crate::DOMAIN_NAMESPACE;
use anchor_lang::prelude::*;
use anchor_spl::token::Token;

#[derive(Accounts)]
#[instruction(
    buffer_version: u64,
    chunk_number: u64,
    data_size: u32,
)]
pub struct CreateBufferChunk<'info> {
    /// #1
    pub authority: Signer<'info>,

    /// #2
    #[account(mut)]
    pub payer: Signer<'info>,

    /// #3
    #[account(
        mut,
        seeds = [
            CONTROLLER_NAMESPACE,
        ],
        bump = controller.load()?.bump
    )]
    pub controller: AccountLoader<'info, Controller>,

    /// #4
    #[account(
        mut,
        seeds = [
            DOMAIN_NAMESPACE,
            domain.load()?.get_name().as_bytes(),
        ],
        bump = domain.load()?.bump,
        has_one = controller @FrexError::InvalidController,
    )]
    pub domain: AccountLoader<'info, Domain>,

    /// #5
    #[account(
        mut,
        seeds = [
            domain.key().as_ref(),
            buffer_version.to_le_bytes().as_ref(),
        ],
        bump = buffer.load()?.bump,
    )]
    pub buffer: AccountLoader<'info, Buffer>,

    /// #6
    #[account(
        init,
        seeds = [
            buffer.key().as_ref(),
            chunk_number.to_le_bytes().as_ref(),
        ],
        bump,
        payer = payer,
        space = BUFFER_CHUNK_SPACE,
    )]
    pub buffer_chunk: AccountLoader<'info, BufferChunk>,

    /// #7
    pub system_program: Program<'info, System>,

    /// #8
    pub token_program: Program<'info, Token>,

    /// #9
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<CreateBufferChunk>,
    _buffer_version: u64,
    chunk_number: u64,
    data_size: u32,
    data: [u8; BUFFER_CHUNK_DATA_SIZE],
) -> Result<()> {
    msg!(
        "Create buffer chunk n°{} for buffer {} in domain {}",
        chunk_number,
        ctx.accounts.buffer.key(),
        ctx.accounts.domain.load()?.get_name(),
    );

    let mut buffer_chunk = ctx.accounts.buffer_chunk.load_init()?;

    buffer_chunk.bump = *ctx
        .bumps
        .get("buffer_chunk")
        .ok_or_else(|| error!(FrexError::BumpError))?;

    buffer_chunk.chunk_number = chunk_number;

    buffer_chunk.data_size = data_size;

    buffer_chunk.data = data;

    Ok(())
}

// Validate
impl<'info> CreateBufferChunk<'info> {
    pub fn validate(
        &self,
        _buffer_version: u64,
        _chunk_number: u64,
        _data_size: u32,
        _data: [u8; BUFFER_CHUNK_DATA_SIZE],
    ) -> Result<()> {
        Ok(())
    }
}