'use client';

import React from 'react';

type Hub = {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  active: boolean;
};

const HUBS: Hub[] = [
  { id: 'NYC', name: 'NEW YORK', x: 85, y: 35, size: 5, active: true },
  { id: 'LON', name: 'LONDON', x: 140, y: 25, size: 4, active: true },
  { id: 'PAR', name: 'PARIS', x: 145, y: 30, size: 3, active: false },
  { id: 'DUB', name: 'DUBAI', x: 190, y: 45, size: 4, active: true },
  { id: 'TYO', name: 'TOKYO', x: 280, y: 25, size: 5, active: true },
  { id: 'SIN', name: 'SINGAPORE', x: 260, y: 65, size: 3, active: true },
  { id: 'SYD', name: 'SYDNEY', x: 300, y: 85, size: 3, active: false },
  { id: 'RIO', name: 'RIO', x: 110, y: 80, size: 2, active: true },
];

const ROUTES = [
  { from: 'NYC', to: 'LON', active: true },
  { from: 'LON', to: 'DUB', active: true },
  { from: 'DUB', to: 'TYO', active: false },
  { from: 'TYO', to: 'SIN', active: true },
  { from: 'SIN', to: 'SYD', active: false },
  { from: 'NYC', to: 'RIO', active: true },
];

export function WorldMap() {
  return (
    <div className="panel mission-panel map-panel">
      <div className="panel-header">
        <span className="panel-label">▶ WORLD ROUTES / MISSION MAP</span>
        <div className="map-controls">
          <button className="control-btn">+</button>
          <button className="control-btn">−</button>
        </div>
      </div>
      
      <div className="map-container">
        <svg
          className="world-map"
          viewBox="0 0 360 120"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Subtle grid background */}
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="rgba(101,214,255,0.08)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="360" height="120" fill="url(#grid)" />

          {/* Route lines */}
          {ROUTES.map((route, idx) => {
            const from = HUBS.find(h => h.id === route.from);
            const to = HUBS.find(h => h.id === route.to);
            if (!from || !to) return null;
            return (
              <g key={idx}>
                {/* Dashed line */}
                <path
                  d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 + 15} ${to.x} ${to.y}`}
                  stroke={route.active ? '#65d6ff' : 'rgba(101,214,255,0.2)'}
                  strokeWidth="1"
                  fill="none"
                  strokeDasharray="2,2"
                  opacity={route.active ? 1 : 0.4}
                />
                {/* Endpoint markers */}
                <circle cx={from.x} cy={from.y} r="0.8" fill={route.active ? '#65d6ff' : 'rgba(101,214,255,0.3)'} />
                <circle cx={to.x} cy={to.y} r="0.8" fill={route.active ? '#65d6ff' : 'rgba(101,214,255,0.3)'} />
              </g>
            );
          })}

          {/* Hub nodes */}
          {HUBS.map((hub) => (
            <g key={hub.id}>
              {/* Outer ring for active hubs */}
              {hub.active && (
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r={hub.size + 1.5}
                  fill="none"
                  stroke="#b9ff45"
                  strokeWidth="0.8"
                  opacity="0.5"
                />
              )}
              {/* Main hub circle */}
              <circle
                cx={hub.x}
                cy={hub.y}
                r={hub.size}
                fill={hub.active ? '#65d6ff' : 'rgba(101,214,255,0.3)'}
                stroke={hub.active ? '#b9ff45' : 'rgba(185,255,69,0.3)'}
                strokeWidth="0.5"
              />
              {/* Glow for active */}
              {hub.active && (
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r={hub.size}
                  fill="none"
                  stroke="#65d6ff"
                  strokeWidth="0.3"
                  opacity="0.3"
                >
                  <animate attributeName="r" values={`${hub.size};${hub.size + 2}`} dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="map-legend">
          <div className="legend-item">
            <span className="legend-dot active"></span>
            <span>Active Hub</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot"></span>
            <span>Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
}

