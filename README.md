# FREX

## Description

FREX is a decentralized frontend hosting solution. Anyone with a solana wallet can upload a website onchain that will be hosted by 3rd party.

## Requirement

### Program

- Solana 1.14.x
- Anchor 0.26.x
- Node v16

### CLI

- Node v16
- ts-node package, to install: `npm i -g ts-node`

## Installation

- Create the file `tests/authorityKeypairArray.ts` containing the keypair to use for authority in the tests/cli
- Create the file `tests/payerKeypairArray.ts` containing the keypair to use for payer in the tests/cli

Example of file:

```
// 8jn21TKa...7wxJeXVRm
export default [
    55, 55, 207, 55, 97, 71, 55, 43, 55, 224, 21,
    126, 55, 73, 4, 55, 43, 55, 84, 55, 55, 134,
    18, 29, 55, 50, 55, 189, 22, 55, 169, 100, 55,
    55, 26, 55, 3, 55, 156, 46, 55, 140, 71, 55,
    55, 163, 55, 55, 82, 55, 117, 49, 234, 55, 204,
    55, 55, 42, 55, 96, 70, 55, 231, 55
]
```

- Execute the command `npm i` in the root of the project

## Create new domain onchain / Upload new website version

- Modify the file `./cli/index.ts` and adapt the values:
   - `domainName`: is the domain name as a string.
   - `bufferVersion`: is the version of the website, starts at 1.
   - `filePath`: is where to find the file to upload.

/!\ Tar the file in `.tgz` before upload /!\

i.e: `tar -czf CompressedDirectory.tgz directory`

- Execute the script:

```
  ts-node ./cli/index.ts
```

## Upload new onchain program

- Execute the script  `./script/change_program_id.sh` to change the program ID
- Be sure you are on devnet using `solana config get`
- Execute the command `anchor deploy`

## Disclaimer

The program is a POC (Proof of Concept) created for the sandstorm hackathon. It is not optimized, nor clean.

### Technical TODO/ideas
- Increases the number of bytes stored in a single BufferChunk account
- Use multiple RPC to upload/reconstitute files.