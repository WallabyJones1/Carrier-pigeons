# Race Model V1.5

## Pigeon stats

Every fake or real racer resolves to a stat snapshot containing: speed, stamina, navigation, agility, instinct, recovery, focus, burst, weather resistance and experience.

The fake roster is normalized to a fixed 700-point budget. This prevents random "god-roll" bots from dominating balance tests while still allowing archetypes such as sprinter, endurance, navigator, stormer and trickster.

## Trait layer

Traits modify a small number of stats rather than acting as guaranteed wins. Starter modifiers include aero feathers, courier bag, mechanical wing, stormproof, night vision, veteran band, lightweight harness, rooftop scout, lucky charm and reinforced pack.

Production NFT metadata should map visual traits to race modifiers through a versioned server/on-chain registry. Never silently alter historical race modifiers.

## Course variables

A course snapshot can include:

- distance and checkpoint count
- route complexity and urban density
- wind speed and direction
- temperature and rain intensity
- visibility and turbulence
- predator risk and interference/noise
- altitude and time of day

Starter presets are Rooftop Rush, Long Haul Relay, Stormfront Dash, Midnight Courier and High Country Crossing.

## Per-checkpoint simulation

At each checkpoint the engine calculates weighted stat score, fatigue, environmental penalty, consistency, drafting and event adjustments. Possible starter events include wrong turns, crosswind knock, gust surfing, predator avoidance, interference and final burst.

The complete telemetry contains rank, elapsed time, speed, fatigue and events for every pigeon at every checkpoint. The viewer can use this to animate overtakes instead of inventing visuals unrelated to the actual result.

## Determinism

The engine derives a separate pseudorandom stream from `race seed + pigeon id + checkpoint`. Identical inputs produce identical results. This is required for replay and post-race auditing.

Do not treat the local PRNG as the source of blockchain unpredictability. The production race seed must come from a verifiable or otherwise trust-minimized on-chain randomness process.
