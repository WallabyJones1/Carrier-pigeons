import { createRng } from './rng.mjs';
import { STAT_KEYS, TRAIT_MODIFIERS } from './catalog.mjs';

const ARCHETYPES = {
  sprinter: { speed: 1.48, burst: 1.42, agility: 1.18, stamina: 0.64, recovery: 0.74, weatherResistance: 0.76, navigation: 0.92 },
  endurance: { stamina: 1.45, recovery: 1.34, weatherResistance: 1.10, speed: 0.74, burst: 0.60, agility: 0.90, navigation: 0.95 },
  navigator: { navigation: 1.48, focus: 1.30, instinct: 1.16, speed: 0.84, stamina: 0.90, burst: 0.88, weatherResistance: 0.95 },
  allRounder: {},
  stormer: { weatherResistance: 1.52, stamina: 1.18, recovery: 1.14, instinct: 1.06, speed: 0.72, burst: 0.80, agility: 0.90 },
  trickster: { agility: 1.48, instinct: 1.36, burst: 1.20, navigation: 1.05, stamina: 0.82, weatherResistance: 0.82, recovery: 0.90 },
};

function normalizeBudget(raw, budget = 700) {
  const total = STAT_KEYS.reduce((sum, key) => sum + raw[key], 0);
  const scaled = Object.fromEntries(
    STAT_KEYS.map((key) => [key, Math.max(25, Math.min(95, Math.round((raw[key] / total) * budget)))])
  );

  let diff = budget - STAT_KEYS.reduce((sum, key) => sum + scaled[key], 0);
  let cursor = 0;
  while (diff !== 0 && cursor < 2000) {
    const key = STAT_KEYS[cursor % STAT_KEYS.length];
    if (diff > 0 && scaled[key] < 95) {
      scaled[key] += 1;
      diff -= 1;
    } else if (diff < 0 && scaled[key] > 25) {
      scaled[key] -= 1;
      diff += 1;
    }
    cursor += 1;
  }
  return scaled;
}

export function generateFakeRoster(count = 5000, seed = 'carrier-pigeons-season-zero') {
  const rng = createRng(seed);
  const archetypeNames = Object.keys(ARCHETYPES);
  const traitNames = Object.keys(TRAIT_MODIFIERS);
  const roster = [];

  for (let i = 1; i <= count; i += 1) {
    const archetype = rng.pick(archetypeNames);
    const weights = ARCHETYPES[archetype];
    const raw = {};
    for (const key of STAT_KEYS) {
      raw[key] = rng.range(55, 85) * (weights[key] ?? 1);
    }
    const stats = normalizeBudget(raw, 700);
    const traitCount = rng.chance(0.18) ? 2 : 1;
    const traits = [];
    while (traits.length < traitCount) {
      const trait = rng.pick(traitNames);
      if (!traits.includes(trait)) traits.push(trait);
    }

    roster.push({
      id: `CP-${String(i).padStart(4, '0')}`,
      asset: `FAKE_ASSET_${String(i).padStart(4, '0')}`,
      name: `Carrier Pigeon #${i}`,
      owner: `BOT_${String(((i - 1) % Math.max(50, Math.ceil(count / 5))) + 1).padStart(4, '0')}`,
      archetype,
      stats,
      traits,
    });
  }
  return roster;
}
