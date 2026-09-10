const memory = {
  races: new Map(),
  events: [],
};

function normalizeLimit(value, fallback = 20, max = 100) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(parsed)));
}

export async function createRepository() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return createMemoryRepository();

  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: databaseUrl, ssl: process.env.PGSSL === 'disable' ? false : undefined });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS race_results (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      course_name TEXT NOT NULL,
      winner_id TEXT,
      winner_owner TEXT,
      payload JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS race_events (
      seq BIGSERIAL PRIMARY KEY,
      race_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL
    );
    CREATE INDEX IF NOT EXISTS race_results_created_idx ON race_results(created_at DESC);
    CREATE INDEX IF NOT EXISTS race_events_created_idx ON race_events(created_at DESC);
  `);

  return {
    mode: 'postgres',
    async saveRace(race) {
      await pool.query(
        `INSERT INTO race_results(id, course_name, winner_id, winner_owner, payload)
         VALUES($1,$2,$3,$4,$5::jsonb)
         ON CONFLICT(id) DO UPDATE SET payload=EXCLUDED.payload, winner_id=EXCLUDED.winner_id, winner_owner=EXCLUDED.winner_owner`,
        [race.id, race.course?.name ?? 'Unknown', race.winner?.id ?? null, race.winner?.owner ?? null, JSON.stringify(race)]
      );
    },
    async listRaces(limit) {
      const result = await pool.query(
        'SELECT payload FROM race_results ORDER BY created_at DESC LIMIT $1',
        [normalizeLimit(limit)]
      );
      return result.rows.map((row) => row.payload);
    },
    async getRace(id) {
      const result = await pool.query('SELECT payload FROM race_results WHERE id=$1 LIMIT 1', [id]);
      return result.rows[0]?.payload ?? null;
    },
    async saveEvent(event) {
      await pool.query(
        'INSERT INTO race_events(race_id,event_type,payload) VALUES($1,$2,$3::jsonb)',
        [event.raceId ?? null, event.type ?? 'unknown', JSON.stringify(event)]
      );
    },
    async leaderboard(limit = 25) {
      const rows = await pool.query(`
        SELECT winner_id AS pigeon_id, winner_owner AS owner, COUNT(*)::int AS wins
        FROM race_results
        WHERE winner_id IS NOT NULL
        GROUP BY winner_id, winner_owner
        ORDER BY wins DESC, pigeon_id ASC
        LIMIT $1
      `, [normalizeLimit(limit, 25, 100)]);
      return rows.rows.map((row, index) => ({ rank: index + 1, pigeonId: row.pigeon_id, owner: row.owner, wins: row.wins }));
    },
    async close() { await pool.end(); },
  };
}

function createMemoryRepository() {
  return {
    mode: 'memory',
    async saveRace(race) { memory.races.set(race.id, structuredClone(race)); },
    async listRaces(limit) {
      return [...memory.races.values()].slice(-normalizeLimit(limit)).reverse();
    },
    async getRace(id) { return memory.races.get(id) ?? null; },
    async saveEvent(event) {
      memory.events.push(structuredClone(event));
      if (memory.events.length > 2000) memory.events.splice(0, memory.events.length - 2000);
    },
    async leaderboard(limit = 25) {
      const wins = new Map();
      for (const race of memory.races.values()) {
        const key = race.winner?.id;
        if (!key) continue;
        const current = wins.get(key) ?? { pigeonId: key, owner: race.winner.owner, wins: 0 };
        current.wins += 1;
        wins.set(key, current);
      }
      return [...wins.values()]
        .sort((a, b) => b.wins - a.wins || a.pigeonId.localeCompare(b.pigeonId))
        .slice(0, normalizeLimit(limit, 25, 100))
        .map((item, index) => ({ rank: index + 1, ...item }));
    },
    async close() {},
  };
}
