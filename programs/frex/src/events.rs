use anchor_lang::prelude::*;

#[event]
pub struct EventRegisterDomain {
    #[index]
    pub domain: Pubkey,
}

#[event]
pub struct EventSetDomainActiveBufferVersion {
    #[index]
    pub domain: Pubkey,
    pub buffer: Pubkey,
    pub buffer_version: u64,
}

#[event]
pub struct EventCreateBuffer {
    #[index]
    pub domain: Pubkey,
    pub buffer: Pubkey,
}

#[event]
pub struct EventSetBufferReady {
    #[index]
    pub domain: Pubkey,
    pub buffer: Pubkey,
}