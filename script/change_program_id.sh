#!/bin/sh

# Get current keypair's Pubkey
OLD_PUBKEY=`solana-keygen pubkey ./target/deploy/frex-keypair.json`
echo "Previous public key" $OLD_PUBKEY

# Reset the keypair
solana-keygen new -o ./target/deploy/frex-keypair.json --force --no-bip39-passphrase

# Get the new keypair's Pubkey
NEW_PUBKEY=`solana-keygen pubkey ./target/deploy/frex-keypair.json`
echo "New public key" $NEW_PUBKEY

# Replace
sed -i.bak "s/$OLD_PUBKEY/$NEW_PUBKEY/g" ./Anchor.toml
sed -i.bak "s/$OLD_PUBKEY/$NEW_PUBKEY/g" ./programs/frex/src/lib.rs
sed -i.bak "s/$OLD_PUBKEY/$NEW_PUBKEY/g" ./tests/constant.ts