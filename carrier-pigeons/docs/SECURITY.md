# Security Gates Before Mainnet

This repository is a development starter, not an audited production protocol.

Required gates before mainnet:

- compile and test the Anchor program with the pinned toolchain
- property/fuzz test escrow conservation, duplicate entries, claim idempotence, cancellations and time windows
- verify Core NFT ownership/collection membership on-chain instead of relying on the V1 verifier signer
- use production-grade randomness and verify its proof in the program
- ensure the race seed cannot be selected after entrants are known
- commit the race engine version and all input/stat hashes so settlements are independently replayable
- audit admin/upgrade authorities and use a multisig where appropriate
- run thousands of devnet races with fake wallets and forced failures
- external smart-contract security review before valuable entry fees or prizes are enabled
- never place mint authority, treasury or deployer private keys in Railway web variables or GitHub
