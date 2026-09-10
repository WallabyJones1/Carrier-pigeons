# Uploading this project from an iPhone

## What you downloaded

The archive contains one folder named `carrier-pigeons`. That folder is the repository root.

## Recommended iPhone workflow

1. Save `carrier-pigeons-github-iphone.zip` to the Files app.
2. Tap the ZIP once in Files to extract it.
3. Open the extracted `carrier-pigeons` folder.
4. Create an empty GitHub repository named `carrier-pigeons`.
5. Upload the contents of the extracted folder to the repository root.

Important: do not upload only the ZIP as the project source. GitHub will store a ZIP as one file; it does not automatically turn the contents into a repository tree.

The repository root should show files/folders such as:

- `.github/`
- `apps/`
- `packages/`
- `programs/`
- `scripts/`
- `nft-metadata/`
- `README.md`
- `package.json`
- `Anchor.toml`

## Metadata later

Put the 3,333 original JSON files under `nft-metadata/input/`. Keep a backup of the originals. The stat-generation step will write new files to `nft-metadata/output/` instead of modifying the originals in place.
