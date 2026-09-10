# Railway Deployment

This repository is a **shared JavaScript monorepo**. Keep the service source at the repository root so npm workspaces and the shared race-engine package are available.

## Recommended Railway canvas

Create one Railway project with four resources:

- `web` — GitHub repo, start `npm run start -w @carrier-pigeons/web`
- `api` — same GitHub repo, start `npm run start -w @carrier-pigeons/api`, healthcheck `/health`
- `worker` — same GitHub repo, start `npm run start -w @carrier-pigeons/worker`
- `Postgres` — Railway database plugin/resource

Railway supports shared JS monorepos and can automatically stage deployable workspace packages. If configuring manually, keep root directory `/` and use workspace-specific build/start commands. Use watch paths so web-only changes do not rebuild the worker unnecessarily.

## API variables

`DATABASE_URL` should reference the Railway Postgres connection. Set `WORKER_SECRET`, `ALLOWED_ORIGINS`, Solana cluster/RPC values and the deployed program/collection addresses.

## Worker variables

Set `API_URL` to the API service URL and use the same `WORKER_SECRET`. During Season Zero set `SIMULATION_MODE=true`. For real chain tracking set it to `false` and configure `SOLANA_RPC_URL` plus `SOLANA_PROGRAM_ID`.

## Web variables

Set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOLANA_RPC_URL`, `NEXT_PUBLIC_CORE_COLLECTION_ADDRESS`, `NEXT_PUBLIC_CORE_CANDY_MACHINE_ADDRESS`, `NEXT_PUBLIC_MINT_LIMIT_ID` and, for paid SOL mints, `NEXT_PUBLIC_MINT_PAYMENT_DESTINATION`.

## Scaling note

The starter SSE broker lives inside one API process. Keep API replicas at one during Season Zero. Before horizontal scaling, move fan-out to Redis/Valkey pub-sub or another shared event bus.
