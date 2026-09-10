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

          {/* Stylized continent silhouettes */}
          <g opacity="0.15" stroke="rgba(101,214,255,0.3)" fill="rgba(101,214,255,0.05)" strokeWidth="0.3">
            {/* North America */}
            <path d="M 60 20 L 80 15 L 85 25 L 78 40 L 65 38 Z" />
            {/* South America */}
            <path d="M 90 65 L 100 70 L 105 85 L 95 90 L 88 80 Z" />
            {/* Europe */}
            <path d="M 130 15 L 155 12 L 158 30 L 145 35 L 130 28 Z" />
            {/* Africa */}
            <path d="M 155 30 L 180 25 L 185 65 L 175 75 L 160 70 Z" />
            {/* Asia */}
            <path d="M 180 20 L 250 10 L 265 35 L 240 50 L 190 45 Z" />
            {/* East Asia */}
            <path d="M 250 15 L 290 18 L 295 40 L 270 45 Z" />
            {/* Australia */}
            <path d="M 290 75 L 310 78 L 315 95 L 295 100 Z" />
          </g>

          {/* Route lines with glow effect */}
          {ROUTES.map((route, idx) => {
            const from = HUBS.find(h => h.id === route.from);
            const to = HUBS.find(h => h.id === route.to);
            if (!from || !to) return null;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2 + 12;
            return (
              <g key={idx}>
                {/* Glow layer for active routes */}
                {route.active && (
                  <path
                    d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
                    stroke="#65d6ff"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.2"
                    filter="blur(1px)"
                  />
                )}
                {/* Main dashed line */}
                <path
                  d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
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

          {/* Hub nodes with enhanced visuals */}
          {HUBS.map((hub) => (
            <g key={hub.id}>
              {/* Outer pulsing ring for active hubs */}
              {hub.active && (
                <circle
                  cx={hub.x}
                  cy={hub.y}
                  r={hub.size + 1.8}
                  fill="none"
                  stroke="#b9ff45"
                  strokeWidth="0.9"
                  opacity="0.6"
                />
              )}
              {/* Main hub circle */}
              <circle
                cx={hub.x}
                cy={hub.y}
                r={hub.size}
                fill={hub.active ? '#65d6ff' : 'rgba(101,214,255,0.25)'}
                stroke={hub.active ? '#b9ff45' : 'rgba(185,255,69,0.2)'}
                strokeWidth="0.6"
              />
              {/* Animated glow for active hubs */}
              {hub.active && (
                <>
                  <circle
                    cx={hub.x}
                    cy={hub.y}
                    r={hub.size}
                    fill="none"
                    stroke="#65d6ff"
                    strokeWidth="0.4"
                    opacity="0.4"
                  >
                    <animate attributeName="r" values={`${hub.size};${hub.size + 2.2}`} dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle
                    cx={hub.x}
                    cy={hub.y}
                    r={hub.size}
                    fill="none"
                    stroke="#65d6ff"
                    strokeWidth="0.2"
                    opacity="0.2"
                  >
                    <animate attributeName="r" values={`${hub.size};${hub.size + 3}`} dur="2s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              {/* Label background */}
              <rect
                x={hub.x - (hub.name.length * 1.2)}
                y={hub.y - hub.size - 6}
                width={hub.name.length * 2.4}
                height="4"
                fill="rgba(10, 14, 25, 0.9)"
                stroke="rgba(101,214,255,0.3)"
                strokeWidth="0.3"
              />
              {/* City label */}
              <text
                x={hub.x}
                y={hub.y - hub.size - 3}
                textAnchor="middle"
                fontSize="2"
                fill={hub.active ? '#65d6ff' : '#7a8fa3'}
                fontWeight="bold"
                letterSpacing="0.1"
              >
                {hub.id}
              </text>
            </g>
          ))}

          {/* Equator reference line */}
          <line
            x1="0"
            y1="60"
            x2="360"
            y2="60"
            stroke="rgba(101,214,255,0.05)"
            strokeWidth="0.3"
            strokeDasharray="4,4"
          />
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
          <div className="legend-divider">|</div>
          <div className="legend-item">
            <span className="legend-status active"></span>
            <span>Live Route</span>
          </div>
        </div>
      </div>
    </div>
  );
}

