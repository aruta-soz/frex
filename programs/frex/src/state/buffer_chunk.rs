use crate::*;
use std::mem;

// Extra space used for further needs
// When adding an info in BufferChunk structure, remove according bytes from here
pub const EXTRA_SPACE: usize = 100;

pub const BUFFER_CHUNK_SPACE: usize =
    ANCHOR_DISCRIMINATOR_SIZE + mem::size_of::<BufferChunk>() + EXTRA_SPACE;

// @TODO, find a way to maximize the amount of data stored in a chunk
// 512 is supported natively by BorshSerialize/BorshDeserialize
pub const BUFFER_CHUNK_DATA_SIZE: usize = 512;

#[account(zero_copy)]
#[repr(packed)]
pub struct BufferChunk {
    pub bump: u8,

    pub chunk_number: u64,

    // How much data is used, max is BUFFER_CHUNK_DATA_SIZE
    pub data_size: u32,

    pub data: [u8; BUFFER_CHUNK_DATA_SIZE],
}