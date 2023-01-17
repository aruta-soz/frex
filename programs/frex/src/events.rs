use anchor_lang::prelude::*;

#[event]
pub struct EventSetDomainActiveBufferVersion {
    #[index]
    pub domain: Pubkey,
    pub buffer: PubKey,
    pub buffer_version: u64,
}