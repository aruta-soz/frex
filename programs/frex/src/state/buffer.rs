use crate::*;
use std::mem;

// Extra space used for further needs
// When adding an info in Buffer structure, remove according bytes from here
pub const EXTRA_SPACE: usize = 900;

pub const BUFFER_SPACE: usize = ANCHOR_DISCRIMINATOR_SIZE + mem::size_of::<Buffer>() + EXTRA_SPACE;

#[account(zero_copy)]
#[repr(packed)]
pub struct Buffer {
    pub bump: u8,

    pub domain: Pubkey,
    pub domain_bump: u8,

    pub version: u64,
    pub chunk_number: u64,

   pub checksum: [u8;64],

    // means all buffer chunks have been uploaded and the buffer can be used
    pub ready: bool,

    // TODO, add total byte size for stats
}