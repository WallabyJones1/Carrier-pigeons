import fs from 'node:fs/promises';
import path from 'node:path';
import {
  COURSE_PRESETS,
  createRng,
  generateFakeRoster,
  simulateRace,
} from '../packages/race-engine/src/index.mjs';

const raceCount = Math.max(1, Number(process.argv[2] ?? 5000));
const fieldSize = Math.max(2, Math.min(20, Number(process.argv[3] ?? 12)));
const roster = generateFakeRoster(5000, 'season-zero-balance');
const rng = createRng('season-zero-season');
const courses = Object.values(COURSE_PRESETS);
const starts = new Map();
const wins = new Map();
const courseWins = new Map();

for (let raceIndex = 1; raceIndex <= raceCount; raceIndex += 1) {
  const chosen = new Set();
  while (chosen.size < fieldSize) chosen.add(rng.int(0, roster.length - 1));
  const entrants = [...chosen].map((index) => roster[index]);
  const course = rng.pick(courses);
  const race = simulateRace({ id: `sim-${raceIndex}`, seed: `sim-seed:${raceIndex}`, course, entrants });
  for (const pigeon of entrants) starts.set(pigeon.id, (starts.get(pigeon.id) ?? 0) + 1);
  wins.set(race.winner.id, (wins.get(race.winner.id) ?? 0) + 1);
  const key = `${course.type}:${race.winner.id}`;
  courseWins.set(key, (courseWins.get(key) ?? 0) + 1);
}

const racers = roster
  .map((pigeon) => {
    const startCount = starts.get(pigeon.id) ?? 0;
    const winCount = wins.get(pigeon.id) ?? 0;
    return {
      id: pigeon.id,
      archetype: pigeon.archetype,
      starts: startCount,
      wins: winCount,
      winRate: startCount ? winCount / startCount : 0,
    };
  })
  .filter((p) => p.starts >= Math.max(20, Math.floor((raceCount * fieldSize / roster.length) * 0.65)))
  .sort((a, b) => b.winRate - a.winRate);

const expected = 1 / fieldSize;
const weightedWins = racers.reduce((sum, p) => sum + p.wins, 0);
const weightedStarts = racers.reduce((sum, p) => sum + p.starts, 0);
const archetypeSummary = Object.values(roster.reduce((acc, pigeon) => {
  const current = acc[pigeon.archetype] ?? { archetype: pigeon.archetype, starts: 0, wins: 0 };
  current.starts += starts.get(pigeon.id) ?? 0;
  current.wins += wins.get(pigeon.id) ?? 0;
  acc[pigeon.archetype] = current;
  return acc;
}, {})).map((item) => ({ ...item, winRate: item.starts ? item.wins / item.starts : 0 }));

const report = {
  generatedAt: new Date().toISOString(),
  raceCount,
  fieldSize,
  rosterSize: roster.length,
  expectedWinRate: expected,
  observedWeightedWinRate: weightedStarts ? weightedWins / weightedStarts : 0,
  topWinRates: racers.slice(0, 25),
  bottomWinRates: racers.slice(-25).reverse(),
  archetypeSummary,
};

await fs.mkdir(path.resolve('reports'), { recursive: true });
await fs.writeFile(path.resolve('reports/season-balance.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  races: raceCount,
  fieldSize,
  expectedWinRate: `${(expected * 100).toFixed(2)}%`,
  observedWeightedWinRate: `${(report.observedWeightedWinRate * 100).toFixed(2)}%`,
  highestEstablishedWinRate: racers[0] ? `${(racers[0].winRate * 100).toFixed(2)}%` : 'n/a',
  report: 'reports/season-balance.json',
}, null, 2));
