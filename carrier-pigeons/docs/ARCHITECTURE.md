# Carrier Pigeons Solana Architecture

## Rule: chain truth, deterministic presentation

The Solana program owns race registration, entry escrow, seed commitment/reveal, settlement hashes and prize claims. The detailed race simulation runs off-chain from a deterministic seed and immutable input snapshot. Anyone can replay the same race engine version and compare the result hash with the settlement.

This avoids putting dozens of checkpoint movements on Solana while preserving auditable results.

## Services

### `apps/web`
Next.js mint/racing page. Connects a Solana wallet, calls Metaplex Core Candy Machine for minting, consumes the API REST endpoints, and listens to `/api/live` with Server-Sent Events.

### `apps/api`
Node service. Provides `/health`, `/api/config`, `/api/races`, `/api/leaderboard`, and `/api/live`. It uses Postgres when `DATABASE_URL` is present and an in-memory repository otherwise.

### `apps/worker`
Two modes:

- `SIMULATION_MODE=true`: runs Season Zero fake races with the same shared race engine and streams checkpoints to the API.
- `SIMULATION_MODE=false`: subscribes to the configured Solana program logs and forwards chain activity/slot heartbeats to the same live feed.

### `packages/race-engine`
Zero-dependency deterministic engine. This is the authoritative V1 simulation code. Pin an engine version in every on-chain race record/result payload before launch.

### `programs/carrier_races`
Anchor program. V1 includes race creation, verified/co-signed entry, escrowed entry fees, seed commitment/reveal, result settlement hash, podium claims, cancellation and refunds.

## Production evolution

1. Replace the dev verifier co-signer with direct Metaplex Core collection ownership verification or a tightly scoped on-chain registrar design.
2. Replace single-authority result settlement with a verifiable randomness/oracle flow and enforce the randomness proof on-chain.
3. Store `engine_version`, route snapshot hash, NFT stat snapshot hash and result hash on-chain.
4. Add Redis/Valkey pub-sub if the API is scaled beyond one replica, because the starter SSE hub is process-local.
5. Add a dedicated indexer pipeline (RPC/WebSocket or provider webhooks) for account state and transaction history.
6. Run Anchor tests, fuzz/property tests and an external security audit before mainnet escrow holds meaningful value.
