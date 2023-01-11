use anchor_lang::prelude::*;

#[error_code]
pub enum FrexError {
    #[msg("Bump error")]
    BumpError,

    #[msg("Invalid controller")]
    InvalidController,

    #[msg("Collateral mint does not match the controller's")]
    InvalidCollateralMint,

    #[msg("Authority does not match the controller's")]
    InvalidAuthority,

    #[msg("Default - Check the source code for more info")]
    Default,
}