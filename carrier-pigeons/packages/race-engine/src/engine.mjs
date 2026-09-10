import { createRng } from './rng.mjs';
import { STAT_KEYS, TRAIT_MODIFIERS } from './catalog.mjs';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function effectiveStats(pigeon) {
  const stats = Object.fromEntries(STAT_KEYS.map((key) => [key, Number(pigeon.stats?.[key] ?? 50)]));
  for (const trait of pigeon.traits ?? []) {
    const modifier = TRAIT_MODIFIERS[trait] ?? {};
    for (const [key, value] of Object.entries(modifier)) {
      stats[key] = clamp((stats[key] ?? 50) + value, 1, 110);
    }
  }
  return stats;
}

function courseWeights(course) {
  const distanceFactor = clamp(course.distanceKm / 60, 0, 1);
  const badWeather = clamp((course.windKph / 60 + course.rainMmPh / 12 + course.turbulence / 100) / 3, 0, 1);
  const darkness = course.timeOfDay === 'night' ? 1 : 0;
  return {
    speed: 0.12 + (1 - distanceFactor) * 0.10,
    stamina: 0.10 + distanceFactor * 0.12,
    navigation: 0.10 + (course.routeComplexity / 100) * 0.10 + darkness * 0.04,
    agility: 0.09 + (course.urbanDensity / 100) * 0.10 + (course.turbulence / 100) * 0.03,
    instinct: 0.08 + (course.predatorRisk / 100) * 0.08,
    recovery: 0.07 + distanceFactor * 0.07,
    focus: 0.08 + (course.interference / 100) * 0.07 + darkness * 0.03,
    burst: 0.08 + (1 - distanceFactor) * 0.08,
    weatherResistance: 0.07 + badWeather * 0.12,
    experience: 0.05,
  };
}

function environmentPenalty(stats, course) {
  const wind = (course.windKph / 65) * (1 - stats.weatherResistance / 150);
  const rain = (course.rainMmPh / 15) * (1 - stats.weatherResistance / 140);
  const visibility = clamp((8 - course.visibilityKm) / 8, 0, 1) * (1 - stats.navigation / 140);
  const altitude = clamp(course.altitudeM / 1800, 0, 1) * (1 - stats.stamina / 145);
  return clamp(wind * 0.10 + rain * 0.09 + visibility * 0.08 + altitude * 0.06, 0, 0.28);
}

function eventForSegment(rng, stats, course, fatigue, segmentIndex) {
  const events = [];
  let seconds = 0;
  let speedMultiplier = 1;

  const navRisk = clamp((course.routeComplexity - stats.navigation - stats.focus * 0.25 + 35) / 420, 0.002, 0.12);
  if (rng.chance(navRisk)) {
    const penalty = rng.range(1.5, 7.5) * (1 + fatigue * 0.4);
    seconds += penalty;
    events.push({ type: 'wrong_turn', label: 'Wrong turn', seconds: penalty });
  }

  const gustRisk = clamp((course.windKph + course.turbulence * 0.45 - stats.agility * 0.35) / 500, 0.005, 0.12);
  if (rng.chance(gustRisk)) {
    if (rng.chance(clamp((stats.agility + stats.instinct) / 220, 0.2, 0.9))) {
      speedMultiplier *= 1.03;
      events.push({ type: 'gust_surf', label: 'Surfaced a gust', seconds: -0.5 });
      seconds -= 0.5;
    } else {
      const penalty = rng.range(0.8, 4.8);
      seconds += penalty;
      events.push({ type: 'crosswind', label: 'Crosswind knock', seconds: penalty });
    }
  }

  const predatorRisk = clamp((course.predatorRisk - stats.instinct * 0.22 - stats.agility * 0.18 + 20) / 620, 0, 0.07);
  if (rng.chance(predatorRisk)) {
    const penalty = rng.range(1.2, 6.2);
    seconds += penalty;
    events.push({ type: 'predator', label: 'Predator avoidance', seconds: penalty });
  }

  const interferenceRisk = clamp((course.interference - stats.focus * 0.3 + 10) / 650, 0, 0.06);
  if (rng.chance(interferenceRisk)) {
    const penalty = rng.range(0.7, 3.8);
    seconds += penalty;
    events.push({ type: 'interference', label: 'Signal/noise distraction', seconds: penalty });
  }

  if (segmentIndex > Math.max(1, course.checkpoints - 3) && rng.chance(clamp(stats.burst / 170, 0.2, 0.62))) {
    speedMultiplier *= 1 + stats.burst / 2500;
    events.push({ type: 'final_burst', label: 'Final burst', seconds: -0.3 });
    seconds -= 0.3;
  }

  return { seconds, speedMultiplier, events };
}

export function simulateRace({ id, seed, course, entrants }) {
  if (!course || !Array.isArray(entrants) || entrants.length < 2) {
    throw new Error('simulateRace requires a course and at least two entrants');
  }
  const checkpoints = clamp(Math.round(course.checkpoints ?? 10), 4, 24);
  const segmentKm = course.distanceKm / checkpoints;
  const weights = courseWeights(course);
  const weightTotal = Object.values(weights).reduce((sum, value) => sum + value, 0);
  const racers = entrants.map((pigeon) => {
    const stats = effectiveStats(pigeon);
    const formRng = createRng(`${seed}:${pigeon.id}:race-form`);
    const formSwing = clamp(0.115 - stats.experience / 1800, 0.045, 0.085);
    return {
      pigeon,
      stats,
      raceForm: 1 + formRng.range(-formSwing, formSwing),
      elapsedSeconds: 0,
    fatigue: 0,
    telemetry: [],
    events: [],
      previousRank: null,
    };
  });

  for (let segment = 0; segment < checkpoints; segment += 1) {
    for (const racer of racers) {
      const rng = createRng(`${seed}:${racer.pigeon.id}:${segment}`);
      const weightedAverage = STAT_KEYS.reduce((sum, key) => sum + racer.stats[key] * weights[key], 0) / weightTotal;
      // Shrink raw stat gaps so specialization matters without making high-roll pigeons deterministic winners.
      const statScore = 70 + (weightedAverage - 70) * 0.58;
      const fatigueGain = clamp(
        (segmentKm / 8) * (1.02 - racer.stats.stamina / 220) *
          (1 + course.windKph / 150 + course.rainMmPh / 35 + course.altitudeM / 7000),
        0.006,
        0.22
      );
      racer.fatigue = clamp(racer.fatigue + fatigueGain, 0, 0.78);
      const envPenalty = environmentPenalty(racer.stats, course);
      const segmentForm = rng.range(0.955, 1.045);
      const randomForm = racer.raceForm * segmentForm;
      const drafting = racer.previousRank && racer.previousRank > 1 && racer.previousRank <= Math.ceil(racers.length / 2)
        ? 1 + clamp((racer.stats.focus + racer.stats.instinct) / 9000, 0.005, 0.022)
        : 1;
      const event = eventForSegment(rng, racer.stats, course, racer.fatigue, segment);
      const effectiveScore = statScore * (1 - racer.fatigue * 0.24) * (1 - envPenalty) * randomForm * drafting;
      const metersPerSecond = clamp((11.5 + effectiveScore * 0.105) * event.speedMultiplier, 10, 30);
      const segmentSeconds = (segmentKm * 1000) / metersPerSecond + Math.max(-1, event.seconds);
      racer.elapsedSeconds += segmentSeconds;
      racer.events.push(...event.events.map((item) => ({ ...item, checkpoint: segment + 1 })));
      racer.telemetry.push({
        checkpoint: segment + 1,
        progress: (segment + 1) / checkpoints,
        elapsedSeconds: Number(racer.elapsedSeconds.toFixed(3)),
        fatigue: Number(racer.fatigue.toFixed(4)),
        speedMps: Number(metersPerSecond.toFixed(3)),
        events: event.events,
      });
    }

    const ranked = [...racers].sort((a, b) => a.elapsedSeconds - b.elapsedSeconds);
    ranked.forEach((racer, index) => {
      racer.previousRank = index + 1;
      racer.telemetry[racer.telemetry.length - 1].rank = index + 1;
    });
  }

  const results = racers
    .sort((a, b) => a.elapsedSeconds - b.elapsedSeconds)
    .map((racer, index) => ({
      rank: index + 1,
      pigeon: racer.pigeon,
      timeSeconds: Number(racer.elapsedSeconds.toFixed(3)),
      gapSeconds: 0,
      events: racer.events,
      telemetry: racer.telemetry,
    }));
  const winningTime = results[0].timeSeconds;
  for (const result of results) result.gapSeconds = Number((result.timeSeconds - winningTime).toFixed(3));

  const snapshots = Array.from({ length: checkpoints }, (_, index) =>
    results
      .map((result) => ({
        pigeonId: result.pigeon.id,
        owner: result.pigeon.owner,
        rank: result.telemetry[index].rank,
        elapsedSeconds: result.telemetry[index].elapsedSeconds,
        speedMps: result.telemetry[index].speedMps,
        fatigue: result.telemetry[index].fatigue,
        events: result.telemetry[index].events,
      }))
      .sort((a, b) => a.rank - b.rank)
  );

  return {
    id: id ?? `race-${Date.now()}`,
    seed: String(seed),
    course,
    entrantCount: entrants.length,
    createdAt: new Date().toISOString(),
    results,
    snapshots,
    winner: results[0].pigeon,
  };
}
