'use client';

import React from 'react';

type Handler = {
  rank: number;
  name: string;
  wins: number;
  rating: number;
};

const MOCK_HANDLERS: Handler[] = [
  { rank: 1, name: 'HAWK_01', wins: 24, rating: 2850 },
  { rank: 2, name: 'FALCON88', wins: 21, rating: 2720 },
  { rank: 3, name: 'SWIFT_HND', wins: 19, rating: 2640 },
  { rank: 4, name: 'ARROW_NET', wins: 17, rating: 2510 },
  { rank: 5, name: 'DIVE_BIRD', wins: 15, rating: 2380 },
];

export function TopHandlers() {
  return (
    <div className="panel mission-panel">
      <div className="panel-header">
        <span className="panel-label">▶ TOP HANDLERS (ALL TIME)</span>
      </div>
      <div className="handlers-list">
        {MOCK_HANDLERS.map((handler) => (
          <div key={handler.rank} className="handler-row">
            <span className="rank-badge">#{handler.rank}</span>
            <div className="handler-info">
              <strong>{handler.name}</strong>
              <small>{handler.rating} ⭐</small>
            </div>
            <span className="wins-count">{handler.wins}W</span>
          </div>
        ))}
      </div>
    </div>
  );
}

