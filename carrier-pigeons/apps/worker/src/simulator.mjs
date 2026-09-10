import {
  COURSE_PRESETS,
  createRng,
  generateFakeRoster,
  simulateRace,
} from '@carrier-pigeons/race-engine';
import { publishEvent, publishRace } from './api-client.mjs';

const rosterSize = Number(process.env.FAKE_ROSTER_SIZE ?? 5000);
const fieldSize = Math.max(2, Math.min(20, Number(process.env.RACE_FIELD_SIZE ?? 12)));
const checkpointDelayMs = Math.max(0, Number(process.env.CHECKPOINT_DELAY_MS ?? 700));
const intervalMs = Math.max(2_000, Number(process.env.RACE_INTERVAL_MS ?? 15_000));
const roster = generateFakeRoster(rosterSize, process.env.FAKE_ROSTER_SEED ?? 'carrier-pigeons-season-zero');
const courses = Object.values(COURSE_PRESETS);
let raceNumber = Number(process.env.RACE_START_NUMBER ?? 1);

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function sampleEntrants(rng) {
  const selected = new Set();
  while (selected.size < fieldSize) selected.add(rng.int(0, roster.length - 1));
  return [...selected].map((index) => roster[index]);
}

export async function runSimulationLoop() {
  console.log(`[worker] simulation mode: ${roster.length} fake pigeons, ${fieldSize} per race`);
  for (;;) {
    const raceId = `season-zero-${String(raceNumber).padStart(6, '0')}`;
    const seed = `${process.env.SEASON_SEED ?? 'season-zero'}:${raceId}`;
    const rng = createRng(seed);
    const baseCourse = rng.pick(courses);
    const course = {
      ...baseCourse,
      windKph: Math.max(0, Number((baseCourse.windKph * rng.range(0.75, 1.3)).toFixed(1))),
      windAngleDeg: rng.int(0, 359),
      temperatureC: Number((baseCourse.temperatureC + rng.range(-4, 4)).toFixed(1)),
      rainMmPh: Math.max(0, Number((baseCourse.rainMmPh + rng.range(-0.7, 2.2)).toFixed(1))),
      visibilityKm: Math.max(0.5, Number((baseCourse.visibilityKm * rng.range(0.7, 1.2)).toFixed(1))),
    };
    const entrants = sampleEntrants(rng);
    const race = simulateRace({ id: raceId, seed, course, entrants });

    try {
      await publishEvent({
        type: 'race:start',
        raceId,
        course,
        entrants: entrants.map(({ id, name, owner, archetype, traits }) => ({ id, name, owner, archetype, traits })),
      });

      for (let index = 0; index < race.snapshots.length; index += 1) {
        await publishEvent({
          type: 'race:checkpoint',
          raceId,
          checkpoint: index + 1,
          totalCheckpoints: race.snapshots.length,
          standings: race.snapshots[index],
          course,
        });
        if (checkpointDelayMs) await sleep(checkpointDelayMs);
      }
      await publishRace(race);
      console.log(`[worker] ${raceId}: ${race.winner.id} won ${course.name}`);
      raceNumber += 1;
    } catch (error) {
      console.error('[worker] simulation publish failed', error);
    }

    await sleep(intervalMs);
  }
}
