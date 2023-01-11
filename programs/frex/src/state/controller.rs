use crate::*;
use std::mem;

// Extra space used for further needs
// When adding an info in Controller structure, remove according bytes from here
pub const EXTRA_SPACE: usize = 900;

pub const CONTROLLER_SPACE: usize =
    ANCHOR_DISCRIMINATOR_SIZE + mem::size_of::<Controller>() + EXTRA_SPACE;

// There is only one controller account. It stores global program configuration

#[account(zero_copy)]
#[repr(packed)]
pub struct Controller {
    pub bump: u8,

    pub authority: Pubkey,

    // mint used to pay for rent
    pub collateral_mint: Pubkey,
    pub collateral_mint_decimals: u8,
}