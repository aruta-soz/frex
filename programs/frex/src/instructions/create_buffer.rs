use crate::error::FrexError;
use crate::state::Controller;
use crate::state::Domain;
use crate::state::{Buffer, BUFFER_SPACE};
use crate::CONTROLLER_NAMESPACE;
use crate::DOMAIN_NAMESPACE;
use anchor_lang::prelude::*;
use anchor_spl::token::Token;

#[derive(Accounts)]
#[instruction(
    version: u64,
    chunk_number: u64,
)]
pub struct CreateBuffer<'info> {
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
        init,
        seeds = [
            domain.key().as_ref(),
            version.to_le_bytes().as_ref(),
        ],
        bump,
        payer = payer,
        space = BUFFER_SPACE,
    )]
    pub buffer: AccountLoader<'info, Buffer>,

    /// #6
    pub system_program: Program<'info, System>,

    /// #7
    pub token_program: Program<'info, Token>,

    /// #8
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<CreateBuffer>, version: u64, chunk_number: u64) -> Result<()> {
    msg!(
        "Create buffer {} with version {} in domain {}",
        ctx.accounts.buffer.key(),
        version,
        ctx.accounts.domain.load()?.get_name(),
    );

    let mut buffer = ctx.accounts.buffer.load_init()?;

    buffer.bump = *ctx
        .bumps
        .get("buffer")
        .ok_or_else(|| error!(FrexError::BumpError))?;

    let domain = ctx.accounts.domain.load()?;

    buffer.domain = ctx.accounts.domain.key();
    buffer.domain_bump = domain.bump;

    buffer.version = version;
    buffer.chunk_number = chunk_number;

    buffer.ready = false;

    Ok(())
}

// Validate
impl<'info> CreateBuffer<'info> {
    pub fn validate(&self, _version: u64, chunk_number: u64) -> Result<()> {
        require!(chunk_number > 0, FrexError::BufferMinChunkNumber);
        Ok(())
    }
}