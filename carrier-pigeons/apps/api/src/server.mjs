import http from 'node:http';
import { URL } from 'node:url';
import { createRepository } from './repository.mjs';
import { createLiveHub } from './live.mjs';

const port = Number(process.env.PORT ?? 8080);
const repository = await createRepository();
const live = createLiveHub();
const workerSecret = process.env.WORKER_SECRET ?? 'dev-worker-secret';
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '*').split(',').map((v) => v.trim());

function setCors(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes('*')) res.setHeader('Access-Control-Allow-Origin', '*');
  else if (origin && allowedOrigins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'content-type,x-worker-secret');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

function json(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 2_000_000) throw new Error('Payload too large');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function authorizedWorker(req) {
  return req.headers['x-worker-secret'] === workerSecret;
}

const server = http.createServer(async (req, res) => {
  try {
    setCors(req, res);
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/health') {
      json(res, 200, { ok: true, service: 'carrier-pigeons-api', storage: repository.mode, liveClients: live.clientCount() });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/config') {
      json(res, 200, {
        cluster: process.env.SOLANA_CLUSTER ?? 'devnet',
        rpcConfigured: Boolean(process.env.SOLANA_RPC_URL),
        programId: process.env.SOLANA_PROGRAM_ID ?? null,
        collection: process.env.CORE_COLLECTION_ADDRESS ?? null,
        candyMachine: process.env.CORE_CANDY_MACHINE_ADDRESS ?? null,
        simulationMode: (process.env.SIMULATION_MODE ?? 'true') === 'true',
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/races') {
      json(res, 200, { races: await repository.listRaces(url.searchParams.get('limit') ?? 20) });
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/races/')) {
      const id = decodeURIComponent(url.pathname.slice('/api/races/'.length));
      const race = await repository.getRace(id);
      if (!race) { json(res, 404, { error: 'Race not found' }); return; }
      json(res, 200, race);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/leaderboard') {
      json(res, 200, { leaderboard: await repository.leaderboard(url.searchParams.get('limit') ?? 25) });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/live') {
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
      });
      const disconnect = live.connect(res);
      const heartbeat = setInterval(() => res.write(`: heartbeat ${Date.now()}\n\n`), 15_000);
      req.on('close', () => { clearInterval(heartbeat); disconnect(); });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/internal/races') {
      if (!authorizedWorker(req)) { json(res, 401, { error: 'Unauthorized' }); return; }
      const race = await readJson(req);
      if (!race?.id || !race?.results?.length) { json(res, 400, { error: 'Invalid race payload' }); return; }
      await repository.saveRace(race);
      const event = live.broadcast({ type: 'race:complete', raceId: race.id, winner: race.winner, course: race.course, podium: race.results.slice(0, 3) });
      await repository.saveEvent(event);
      json(res, 201, { ok: true, id: race.id });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/internal/events') {
      if (!authorizedWorker(req)) { json(res, 401, { error: 'Unauthorized' }); return; }
      const body = await readJson(req);
      if (!body?.type) { json(res, 400, { error: 'Event type required' }); return; }
      const event = live.broadcast(body);
      await repository.saveEvent(event);
      json(res, 202, { ok: true, sequence: event.sequence });
      return;
    }

    json(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) json(res, 500, { error: 'Internal server error' });
    else res.end();
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[api] listening on :${port} using ${repository.mode} storage`);
});

async function shutdown() {
  server.close();
  await repository.close();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
