import test from 'node:test';
import assert from 'node:assert/strict';
import { COURSE_PRESETS, generateFakeRoster, simulateRace } from '../src/index.mjs';

test('race is deterministic for same seed and entrants', () => {
  const entrants = generateFakeRoster(12, 'test-roster');
  const first = simulateRace({ id: 'r1', seed: 'same-seed', course: COURSE_PRESETS.citySprint, entrants });
  const second = simulateRace({ id: 'r1', seed: 'same-seed', course: COURSE_PRESETS.citySprint, entrants });
  assert.deepEqual(
    first.results.map((r) => [r.pigeon.id, r.timeSeconds]),
    second.results.map((r) => [r.pigeon.id, r.timeSeconds])
  );
});

test('different seeds can change the finishing order', () => {
  const entrants = generateFakeRoster(12, 'test-roster-two');
  const first = simulateRace({ seed: 'seed-a', course: COURSE_PRESETS.stormRun, entrants });
  const second = simulateRace({ seed: 'seed-b', course: COURSE_PRESETS.stormRun, entrants });
  assert.notDeepEqual(first.results.map((r) => r.pigeon.id), second.results.map((r) => r.pigeon.id));
});

test('telemetry contains one snapshot per checkpoint', () => {
  const entrants = generateFakeRoster(12, 'telemetry');
  const race = simulateRace({ seed: 'telemetry-seed', course: COURSE_PRESETS.nightFlight, entrants });
  assert.equal(race.snapshots.length, COURSE_PRESETS.nightFlight.checkpoints);
  assert.equal(race.snapshots[0].length, 12);
  assert.equal(race.results[0].rank, 1);
});
