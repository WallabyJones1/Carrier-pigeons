const apiUrl = (process.env.API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const secret = process.env.WORKER_SECRET ?? 'dev-worker-secret';

async function post(path, body) {
  const response = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-worker-secret': secret },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`API ${response.status}: ${await response.text()}`);
  return response.json();
}

export const publishEvent = (event) => post('/internal/events', event);
export const publishRace = (race) => post('/internal/races', race);
