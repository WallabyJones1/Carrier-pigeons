# GitHub Handoff

This directory is intended to be the repository root.

## First push

```bash
git init
git add .
git commit -m "Carrier Pigeons Solana race network starter"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPO.git
git push -u origin main
```

After the first successful `npm install`, commit the generated `package-lock.json` so CI and Railway resolve the same dependency graph.

Do **not** commit wallet keypair JSON files, `.env`, `.env.local`, `.generated/`, or production metadata secrets. The existing `.gitignore` already excludes the normal generated/runtime paths, but keep signer files outside the repository entirely.

## After pushing

Share the GitHub repository as `owner/repo`. The Railway deployment can then use the same repository for three services (`web`, `api`, `worker`) plus Postgres. Keep the repository root as the shared monorepo root and assign workspace-specific build/start commands per service.
