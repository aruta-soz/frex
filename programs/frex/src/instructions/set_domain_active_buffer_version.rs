use crate::error::FrexError;
use crate::state::{Controller, Buffer};
use crate::state::Domain;
use crate::CONTROLLER_NAMESPACE;
use crate::DOMAIN_NAMESPACE;
use anchor_lang::prelude::*;
use anchor_spl::token::Token;

#[derive(Accounts)]
#[instruction(
    buffer_version: u64
)]
pub struct SetDomainActiveBufferVersion<'info> {
    /// #1
    pub authority: Signer<'info>,

    /// #2
    #[account(mut)]
    pub payer: Signer<'info>,

    /// #3
    #[account(
        seeds = [
            CONTROLLER_NAMESPACE,
        ],
        bump = controller.load()?.bump,
        has_one = authority @FrexError::InvalidAuthority,
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
    )]
    pub domain: AccountLoader<'info, Domain>,

    /// #5
    #[account(
        seeds = [
            domain.key().as_ref(),
            buffer_version.to_le_bytes().as_ref(),
        ],
        bump = buffer.load()?.bump,
    )]
    pub buffer: AccountLoader<'info, Buffer>,

    /// #6
    pub system_program: Program<'info, System>,

    /// #7
    pub token_program: Program<'info, Token>,

    /// #8
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<SetDomainActiveBufferVersion>, buffer_version: u64) -> Result<()> {
    msg!(
        "Set domain {} active buffer version as {}",
        ctx.accounts.domain.key(),
        buffer_version,
    );

    let domain = &mut ctx.accounts.domain.load_mut()?;

    domain.active_buffer_version = buffer_version;

    Ok(())
}

// Validate
impl<'info> SetDomainActiveBufferVersion<'info> {
    pub fn validate(&self, buffer_version: u64) -> Result<()> {
        require!(self.domain.load()?.active_buffer_version != buffer_version, FrexError::BufferVersionAlreadyActiveForDomain);

        require!(self.buffer.load()?.ready == true, FrexError::BufferIsNotReady);

        Ok(())
    }
}