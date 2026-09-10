# Carrier Pigeons — Solana Race Network

GitHub/Railway-ready rewrite of the Carrier Pigeons racing starter.

## Included

- **Solana / Anchor race program** with entry escrow, seed commit/reveal, settlement hashes, podium claims and cancellation refunds.
- **Metaplex Core Candy Machine mint page** using Solana Wallet Adapter and Umi.
- **Detailed deterministic race engine** with 10 stats, trait modifiers, five course presets, weather/environment variables, fatigue, drafting and checkpoint events.
- **5,000 fake-pigeon Season Zero roster** with normalized stat budgets.
- **Railway API service** with REST, Postgres persistence and SSE live race feed.
- **Railway worker** that either runs fake live races or tracks Solana program logs.
- **Next.js race dashboard** with mint terminal, live standings, environmental telemetry, event feed and leaderboard.
- GitHub Actions starter CI and deployment/security docs.

## Repository layout

```text
apps/web                 Next.js mint + live race UI
apps/api                 REST/SSE backend + Postgres adapter
apps/worker              Season Zero simulator / Solana log tracker
packages/race-engine     deterministic race simulation
programs/carrier_races   Anchor program
scripts/collection       Core Collection + Candy Machine setup/load
config                   drop configuration examples
docs                     architecture, races, Railway, minting, security
```

## Quick local run

Requires Node 22+.

```bash
cp .env.example .env
npm install
npm test
```

Terminal 1:

```bash
npm run dev:api
```

Terminal 2:

```bash
SIMULATION_MODE=true npm run dev:worker
```

Terminal 3:

```bash
npm run dev:web
```

Open `http://localhost:3000`. Without Candy Machine addresses, the mint button stays disabled but the live fake-race stack can run.

For Postgres locally:

```bash
docker compose up -d postgres
export DATABASE_URL=postgres://pigeons:pigeons@localhost:5432/pigeons
npm run dev:api
```

## Balance simulation

The engine does not need any external packages:

```bash
node scripts/simulate-season.mjs 5000 12
```

The report is written to `reports/season-balance.json`.

## Solana program

The repository pins Anchor `1.2.0`. Install the Solana/Anchor toolchain, then replace the sample program ID with your generated keypair using the normal Anchor key sync/deploy workflow.

The current on-chain V1 intentionally uses a `verifier` co-signer for race entry/stat registration and an authority-set settlement hash. This is acceptable for devnet/Season Zero but is **not the final trust model**. Read `docs/SECURITY.md` before enabling real-value races.

## Collection mint

See `docs/MINTING.md`. The page uses Metaplex Core Candy Machine. The setup scripts create a Core Collection, create the 5,000-item Candy Machine with configurable guards, then batch-load config lines.

## Railway

See `docs/RAILWAY.md`. Push this folder to a GitHub repo first. Once the repo exists, connect the same monorepo to separate `web`, `api` and `worker` Railway services and add Postgres.

## Development order

1. Run Season Zero locally and tune race weights.
2. Compile/test the Anchor program locally.
3. Deploy race program + Core Candy Machine on **devnet**.
4. Run fake-wallet/devnet load tests and live tracking.
5. Replace dev verifier/randomness trust points.
6. Add final NFT art/metadata and richer race animation assets.
7. Security review/audit.
8. Mainnet deployment and on-page mint.
