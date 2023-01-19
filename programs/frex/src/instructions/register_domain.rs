use crate::error::FrexError;
use crate::events::EventRegisterDomain;
use crate::state::{Controller, DOMAIN_NAME_MAX_CHARACTERS};
use crate::state::{Domain, DOMAIN_SPACE};
use crate::CONTROLLER_NAMESPACE;
use crate::DOMAIN_NAMESPACE;
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use anchor_spl::token::{Token, TokenAccount};

#[derive(Accounts)]
#[instruction(
    name: String
)]
pub struct RegisterDomain<'info> {
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
        has_one = collateral_mint @FrexError::InvalidCollateralMint,
        has_one = authority @FrexError::InvalidAuthority,
    )]
    pub controller: AccountLoader<'info, Controller>,

    /// #4
    #[account(
        init,
        seeds = [
            DOMAIN_NAMESPACE,
            name.as_bytes(),
        ],
        bump,
        payer = payer,
        space = DOMAIN_SPACE,
    )]
    pub domain: AccountLoader<'info, Domain>,

    /// #5
    #[account(
        init,
        seeds = [
            domain.key().as_ref(),
        ],
        token::authority = domain,
        token::mint = collateral_mint,
        bump,
        payer = payer
    )]
    pub vault: Box<Account<'info, TokenAccount>>,

    /// #6
    pub collateral_mint: Box<Account<'info, Mint>>,

    /// #7
    pub system_program: Program<'info, System>,

    /// #8
    pub token_program: Program<'info, Token>,

    /// #9
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<RegisterDomain>, name: String) -> Result<()> {
    msg!(
        "Register domain {} for name {:?}",
        ctx.accounts.domain.key(),
        name,
    );

    msg!("True bytes used as seed for name {:?}", name.as_bytes());

    let domain = &mut ctx.accounts.domain.load_init()?;

    domain.bump = *ctx
        .bumps
        .get("domain")
        .ok_or_else(|| error!(FrexError::BumpError))?;

    /* Copy name from string to u8 sized array */
    let mut name_bytes: [u8; DOMAIN_NAME_MAX_CHARACTERS] = [0; DOMAIN_NAME_MAX_CHARACTERS];

    let mut i = 0;
    for byte in name.as_bytes() {
        name_bytes[i] = *byte;
        i += 1;
    }

    domain.name = name_bytes;

    domain.authority = ctx.accounts.authority.key();

    domain.controller = ctx.accounts.controller.key();
    domain.controller_bump = ctx.accounts.controller.load()?.bump;

    domain.vault_bump = *ctx
        .bumps
        .get("vault")
        .ok_or_else(|| error!(FrexError::BumpError))?;

    domain.vault = ctx.accounts.vault.key();

    domain.active_buffer_version = 0;

    emit!(EventRegisterDomain {
        domain: ctx.accounts.domain.key(),
    });

    Ok(())
}

// Validate
impl<'info> RegisterDomain<'info> {
    pub fn validate(&self, _name: &str) -> Result<()> {
        //
        // TODO, check that the name is a valid subdomain name, probably accept only a-zA-Z0-9.-_
        //

        Ok(())
    }
}
