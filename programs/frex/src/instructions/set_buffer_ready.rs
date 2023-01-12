use crate::error::FrexError;
use crate::state::Controller;
use crate::state::Domain;
use crate::state::Buffer;
use crate::CONTROLLER_NAMESPACE;
use crate::DOMAIN_NAMESPACE;
use anchor_lang::prelude::*;
use anchor_spl::token::Token;

#[derive(Accounts)]
#[instruction(
    version: u64,
)]
pub struct SetBufferReady<'info> {
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
            version.to_le_bytes().as_ref(),
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

pub fn handler(ctx: Context<SetBufferReady>, version: u64) -> Result<()> {
    msg!(
        "Set buffer {} as ready. Buffer version {} in domain {:?}",
        ctx.accounts.buffer.key(),
        version,
        ctx.accounts.domain.load()?.name,
    );

    let buffer = &mut ctx.accounts.buffer.load_mut()?;

    buffer.ready = true;

    Ok(())
}

// Validate
impl<'info> SetBufferReady<'info> {
    pub fn validate(&self, _version: u64) -> Result<()> {
        require!(self.buffer.load()?.ready == false, FrexError::BufferAlreadyReady);
        Ok(())
    }
}