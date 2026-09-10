'use client';

import { useEffect, useMemo, useState } from 'react';

type Standing = {
  pigeonId: string;
  owner: string;
  rank: number;
  elapsedSeconds: number;
  speedMps: number;
  fatigue: number;
  events: Array<{ type: string; label: string; seconds: number }>;
};

type LiveEvent = {
  type: string;
  sequence?: number;
  raceId?: string;
  checkpoint?: number;
  totalCheckpoints?: number;
  standings?: Standing[];
  course?: Record<string, unknown>;
  winner?: { id: string; name: string; owner: string };
  at?: string;
};

type Leader = { rank: number; pigeonId: string; owner: string; wins: number };

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export function RaceDashboard() {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [active, setActive] = useState<LiveEvent | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);

  useEffect(() => {
    let source: EventSource | undefined;
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`${apiUrl}/api/leaderboard?limit=8`, { cache: 'no-store' });
        const body = await response.json();
        if (!cancelled) setLeaders(body.leaderboard || []);
      } catch {}
    }
    load();

    source = new EventSource(`${apiUrl}/api/live`);
    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    const handler = (message: MessageEvent) => {
      try {
        const event = JSON.parse(message.data) as LiveEvent;
        setEvents((current) => [event, ...current].slice(0, 20));
        if (event.type === 'race:start' || event.type === 'race:checkpoint') setActive(event);
        if (event.type === 'race:complete') {
          setActive(event);
          load();
        }
      } catch {}
    };
    ['race:start', 'race:checkpoint', 'race:complete', 'chain:heartbeat', 'chain:program-log'].forEach((name) => source?.addEventListener(name, handler));
    return () => {
      cancelled = true;
      source?.close();
    };
  }, []);

  const standings = active?.standings || [];
  const progress = active?.checkpoint && active?.totalCheckpoints
    ? Math.round((active.checkpoint / active.totalCheckpoints) * 100)
    : active?.type === 'race:complete' ? 100 : 0;
  const course = active?.course as any;
  const winner = active?.winner;
  const raceTitle = course?.name || 'Waiting for next dispatch';

  const eventLabel = useMemo(() => {
    if (!active) return 'Season Zero feed idle';
    if (active.type === 'race:complete') return `Finished — ${winner?.id || 'winner confirmed'}`;
    if (active.type === 'race:checkpoint') return `Checkpoint ${active.checkpoint}/${active.totalCheckpoints}`;
    return 'Racers launched';
  }, [active, winner]);

  return (
    <section className="race-layout">
      <div className="panel race-stage">
        <div className="stage-header">
          <div>
            <div className="eyebrow">LIVE RACE NETWORK</div>
            <h2>{raceTitle}</h2>
          </div>
          <div className={`live-pill ${connected ? 'online' : ''}`}><span />{connected ? 'LIVE' : 'RECONNECTING'}</div>
        </div>

        <div className="weather-strip">
          <span>Route <strong>{course?.distanceKm ?? '—'} km</strong></span>
          <span>Wind <strong>{course?.windKph ?? '—'} km/h</strong></span>
          <span>Rain <strong>{course?.rainMmPh ?? '—'} mm/h</strong></span>
          <span>Visibility <strong>{course?.visibilityKm ?? '—'} km</strong></span>
          <span>Altitude <strong>{course?.altitudeM ?? '—'} m</strong></span>
        </div>

        <div className="track-shell">
          <div className="track-skyline" aria-hidden="true" />
          <div className="progress-rail"><div style={{ width: `${progress}%` }} /></div>
          <div className="checkpoint-label">{eventLabel}</div>
          <div className="racers">
            {standings.length ? standings.slice(0, 12).map((standing) => (
              <div className="racer-row" key={standing.pigeonId}>
                <div className="rank">{standing.rank}</div>
                <div className="pigeon-token">🐦</div>
                <div className="racer-copy">
                  <strong>{standing.pigeonId}</strong>
                  <small>{standing.speedMps.toFixed(1)} m/s · fatigue {Math.round(standing.fatigue * 100)}%</small>
                </div>
                <div className="racer-line"><i style={{ width: `${Math.max(8, 102 - standing.rank * 6)}%` }} /></div>
                <div className="race-time">{standing.elapsedSeconds.toFixed(1)}s</div>
              </div>
            )) : (
              <div className="empty-track">
                <div className="radar" />
                <p>The worker will stream fake racers here as soon as Season Zero starts.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="side-stack">
        <div className="panel leaderboard">
          <div className="eyebrow">TOP COURIERS</div>
          <h3>Season leaderboard</h3>
          <div className="leader-list">
            {leaders.length ? leaders.map((leader) => (
              <div className="leader" key={leader.pigeonId}>
                <span className="leader-rank">#{leader.rank}</span>
                <span><strong>{leader.pigeonId}</strong><small>{leader.owner}</small></span>
                <b>{leader.wins}W</b>
              </div>
            )) : <p className="muted">Wins will populate from the simulation worker.</p>}
          </div>
        </div>

        <div className="panel feed-panel">
          <div className="eyebrow">NETWORK TELEMETRY</div>
          <h3>Live event feed</h3>
          <div className="event-feed">
            {events.length ? events.slice(0, 9).map((event, index) => (
              <div className="feed-event" key={`${event.sequence ?? index}-${index}`}>
                <i />
                <div><strong>{event.type}</strong><small>{event.raceId || event.at || 'network'}</small></div>
              </div>
            )) : <p className="muted">No events received yet.</p>}
          </div>
        </div>
      </aside>
    </section>
  );
}
