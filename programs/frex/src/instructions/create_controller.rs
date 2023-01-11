use crate::error::FrexError;
use crate::state::{Controller, CONTROLLER_SPACE};
use crate::CONTROLLER_NAMESPACE;
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use anchor_spl::token::Token;

#[derive(Accounts)]
pub struct CreateController<'info> {
    /// #1
    pub authority: Signer<'info>,

    /// #2
    #[account(mut)]
    pub payer: Signer<'info>,

    /// #3
    #[account(
        init,
        seeds = [
            CONTROLLER_NAMESPACE,
        ],
        bump,
        payer = payer,
        space = CONTROLLER_SPACE,
    )]
    pub controller: AccountLoader<'info, Controller>,

    /// #4
    /// Mint used as currency within the program
    pub collateral_mint: Box<Account<'info, Mint>>,

    /// #5
    pub system_program: Program<'info, System>,

    /// #6
    pub token_program: Program<'info, Token>,

    /// #7
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<CreateController>) -> Result<()> {
    let controller = &mut ctx.accounts.controller.load_init()?;

    controller.bump = *ctx
        .bumps
        .get("controller")
        .ok_or_else(|| error!(FrexError::BumpError))?;

    controller.authority = ctx.accounts.authority.key();

    controller.collateral_mint = ctx.accounts.collateral_mint.key();
    controller.collateral_mint_decimals = ctx.accounts.collateral_mint.decimals;

    Ok(())
}