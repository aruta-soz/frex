use crate::*;
use std::mem;

// Max size is 32 because 32 is the max seed size when generating PDA
// and we use the name as a seed for the realm
pub const DOMAIN_NAME_MAX_CHARACTERS: usize = 32;

// Extra space used for further needs
// When adding an info in Domain structure, remove according bytes from here
pub const EXTRA_SPACE: usize = 900;

pub const DOMAIN_SPACE: usize = ANCHOR_DISCRIMINATOR_SIZE + mem::size_of::<Domain>() + EXTRA_SPACE;

#[account(zero_copy)]
#[repr(packed)]
pub struct Domain {
    pub bump: u8,
    pub name: [u8; DOMAIN_NAME_MAX_CHARACTERS],
    pub authority: Pubkey,

    pub controller: Pubkey,
    pub controller_bump: u8,

    // Store domain registry and rent fees
    pub vault: Pubkey,
    pub vault_bump: u8,

    // Buffer version in production
    // 0 means no version is active
    pub active_buffer_version: u64,
}

impl Domain {
    // TODO -- create a utility function to do that -- with unit tests
    // Idea here is to extract the name from the byte array having potential leading zeros, cannot just cast to string
    pub fn get_name(&self) -> String {
        let mut extracted_name: String = String::new();
        let mut i = 0;

        // Look for the last 0 in the array
        let mut j = self.name.len() - 1;
        loop {
            if self.name[j] != 0 {
                break;
            }

            if j == 0 {
                break;
            }

            j -= 1;
        }

        j += 1;

        while i < j {
            extracted_name.push(char::from(self.name[i]));
            i += 1;
        }

        msg!("True bytes used as seed for name {:?}", extracted_name.as_bytes());
     
        return extracted_name;
    }
}