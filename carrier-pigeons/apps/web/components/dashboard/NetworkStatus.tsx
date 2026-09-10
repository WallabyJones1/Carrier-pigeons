'use client';

import React from 'react';

export function NetworkStatus() {
  return (
    <div className="panel status-panel">
      <div className="panel-header">
        <span className="panel-label">▶ NETWORK STATUS</span>
      </div>
      <div className="status-items">
        <div className="status-item">
          <span className="status-label">AIRBORNE</span>
          <strong className="status-value">4,832</strong>
        </div>
        <div className="status-item">
          <span className="status-label">HANDLERS</span>
          <strong className="status-value">1,276</strong>
        </div>
        <div className="status-item">
          <span className="status-label">ACTIVE RACES</span>
          <strong className="status-value">56</strong>
        </div>
        <div className="status-item">
          <span className="status-label">BOUNTIES</span>
          <strong className="status-value">$247K</strong>
        </div>
        <div className="status-item">
          <span className="status-label">UPTIME</span>
          <strong className="status-value">99.9%</strong>
        </div>
        <div className="status-item">
          <span className="status-label">LATENCY</span>
          <strong className="status-value">12ms</strong>
        </div>
      </div>
    </div>
  );
}

