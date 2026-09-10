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
  { id: 'R001', from: 'NYC', to: 'BOS', pigeons: 8, status: 'LIVE' },
  { id: 'R002', from: 'LAX', to: 'SFO', pigeons: 12, status: 'LIVE' },
  { id: 'R003', from: 'DEN', to: 'CHI', pigeons: 6, status: 'STARTS IN', eta: '2min' },
  { id: 'R004', from: 'MIA', to: 'ATL', pigeons: 10, status: 'STARTS IN', eta: '5min' },
  { id: 'R005', from: 'SEA', to: 'PDX', pigeons: 4, status: 'STARTS IN', eta: '12min' },
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
              <span className="route-city">{race.from}</span>
              <span className="route-arrow">→</span>
              <span className="route-city">{race.to}</span>
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

