use anchor_lang::prelude::*;

#[error_code]
pub enum FrexError {
    #[msg("Bump error.")]
    BumpError,

    #[msg("Invalid controller.")]
    InvalidController,

    #[msg("Collateral mint does not match the controller's.")]
    InvalidCollateralMint,

    #[msg("Authority does not match the controller's.")]
    InvalidAuthority,

    #[msg("Buffer must be constituted of at least one chunk.")]
    BufferMinChunkNumber,

    #[msg("Buffer is already ready.")]
    BufferAlreadyReady,

    #[msg("Buffer version is already active for given domain.")]
    BufferVersionAlreadyActiveForDomain,

    #[msg("Buffer version is not ready.")]
    BufferIsNotReady,

    #[msg("Default - Check the source code for more info.")]
    Default,
}