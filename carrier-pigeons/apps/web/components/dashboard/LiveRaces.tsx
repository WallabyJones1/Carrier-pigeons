'use client';

import React from 'react';

type Race = {
  id: string;
  from: string;
  to: string;
  pigeons: number;
  status: 'LIVE' | 'STARTS IN';
  eta?: string;
};

const MOCK_RACES: Race[] = [
  { id: 'R001', from: 'LONDON', to: 'NEW YORK', pigeons: 241, status: 'LIVE' },
  { id: 'R002', from: 'TOKYO', to: 'SINGAPORE', pigeons: 1842, status: 'LIVE' },
  { id: 'R003', from: 'SYDNEY', to: 'LOS ANGELES', pigeons: 892, status: 'STARTS IN', eta: '02:14' },
  { id: 'R004', from: 'PARIS', to: 'DUBAI', pigeons: 673, status: 'STARTS IN', eta: '01:02' },
  { id: 'R005', from: 'RIO', to: 'LONDON', pigeons: 512, status: 'STARTS IN', eta: '05:47' },
];

export function LiveRaces() {
  return (
    <div className="panel mission-panel">
      <div className="panel-header">
        <span className="panel-label">▶ LIVE RACES</span>
      </div>
      <div className="race-cards">
        {MOCK_RACES.map((race) => (
          <div key={race.id} className="race-card">
            <div className="race-route">
              <span className="route-city">{race.from.substring(0, 3)}</span>
              <span className="route-arrow">→</span>
              <span className="route-city">{race.to.substring(0, 3)}</span>
            </div>
            <div className="race-meta">
              <span className="race-pigeons">🐦 {race.pigeons}</span>
              <span className={`race-badge ${race.status === 'LIVE' ? 'live' : 'upcoming'}`}>
                {race.status === 'LIVE' ? '● LIVE' : `${race.eta}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

