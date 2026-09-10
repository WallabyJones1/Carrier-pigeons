'use client';

import React, { useState } from 'react';

export function Navigation() {
  const [active, setActive] = useState('mission-control');

  const tabs = [
    { id: 'mission-control', label: 'MISSION CONTROL' },
    { id: 'races', label: 'RACES' },
    { id: 'bounties', label: 'BOUNTIES' },
    { id: 'nest', label: 'THE NEST' },
    { id: 'roost', label: 'THE ROOST' },
    { id: 'leaderboards', label: 'LEADERBOARDS' },
    { id: 'about', label: 'ABOUT' },
  ];

  return (
    <nav className="mission-nav">
      <div className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${active === tab.id ? 'active' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

