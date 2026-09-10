# Solana Minting

The starter targets Metaplex **Core Assets + Core Candy Machine**.

## Why Core

Core NFTs use a single-account asset model and support collection-level plugins. For a 5,000-item game collection this gives a simpler ownership primitive than the older Token Metadata account layout.

## Drop flow

1. Upload the collection JSON/image and all 5,000 image + metadata JSON files to permanent/public storage.
2. Copy `config/drop.devnet.example.json` to a real devnet config and set the URI prefix, treasury and start date.
3. Fund a throwaway devnet deployer wallet.
4. Set `SOLANA_DEPLOYER_KEYPAIR` and run `npm run mint:setup`.
5. Run `npm run mint:load` until all 5,000 config lines are loaded.
6. Copy the generated collection and Candy Machine addresses into the web/API environment variables. For a paid SOL mint, also set `NEXT_PUBLIC_MINT_PAYMENT_DESTINATION` to the same treasury used by the `solPayment` guard.
7. Test the page mint repeatedly on devnet with multiple wallets and failure cases.
8. Only after the race program, drop config and metadata are frozen/audited should you repeat the process on mainnet.

The sample Candy Machine uses a start-date guard and per-wallet mint-limit guard. A SOL payment guard is added when `mintPriceSol > 0`; the mint page supplies that guard's required destination when `NEXT_PUBLIC_MINT_PAYMENT_DESTINATION` is configured.

## Important

`isSequential=false` produces pseudo-random config-line selection but it is not cryptographically unpredictable. If collection reveal order is economically important, use a proper hidden/reveal design rather than relying on the Candy Machine shuffle.
