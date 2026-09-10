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
          <span className="status-label">UPTIME</span>
          <strong className="status-value">99.8%</strong>
        </div>
        <div className="status-item">
          <span className="status-label">LATENCY</span>
          <strong className="status-value">24ms</strong>
        </div>
        <div className="status-item">
          <span className="status-label">THROUGHPUT</span>
          <strong className="status-value">2.1K/s</strong>
        </div>
        <div className="status-item">
          <span className="status-label">ACTIVE NODES</span>
          <strong className="status-value">48</strong>
        </div>
        <div className="status-item">
          <span className="status-label">QUEUED</span>
          <strong className="status-value">3</strong>
        </div>
        <div className="status-item">
          <span className="status-label">ERRORS</span>
          <strong className="status-value">0</strong>
        </div>
      </div>
    </div>
  );
}

