# NFT Metadata Workspace

This folder is reserved for the 3,333 Carrier Pigeons metadata files.

- `input/` — put the original 3,333 JSON metadata files here.
- `output/` — generated metadata with racing stats will be written here.
- `reports/` — collection balance and validation reports will be written here.

The original metadata should remain untouched. The racing metadata transformer will preserve the existing artwork traits and add the Carrier Pigeons racing attributes.

Planned permanent race attributes:

- Speed
- Stamina
- Navigation
- Agility
- Recovery
- Burst
- Weather Resistance
- Instinct
- Focus
- Experience Potential
- Racing Class
- Stat Version (`CP-RACE-V1`)

Do not add dynamic career values such as wins, XP, fatigue, rating, injuries, or CRUMBS earned to the permanent mint metadata. Those belong in the game/backend state.
