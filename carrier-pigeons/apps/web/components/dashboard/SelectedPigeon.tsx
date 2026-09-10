'use client';

import React from 'react';

export function SelectedPigeon() {
  return (
    <div className="panel pigeon-card">
      <div className="panel-header">
        <span className="panel-label">▶ SELECT A PIGEON</span>
      </div>
      <div className="pigeon-detail">
        <div className="pigeon-id">
          <div className="pigeon-icon-box">🐦</div>
          <div>
            <strong>CP-1043</strong>
            <small>Callsign ID</small>
          </div>
        </div>
        <div className="detail-row">
          <span className="label">ROUTE:</span>
          <span className="value">LONDON → NEW YORK</span>
        </div>
        <div className="detail-row">
          <span className="label">RANK:</span>
          <span className="value">18 / 2,431</span>
        </div>
        <div className="detail-row">
          <span className="label">PROGRESS:</span>
          <span className="value">62.4%</span>
        </div>
        <div className="detail-row">
          <span className="label">SPEED:</span>
          <span className="value">742 km/h</span>
        </div>
        <div className="detail-row">
          <span className="label">ETA:</span>
          <span className="value">00:38:12</span>
        </div>
        <div className="detail-row">
          <span className="label">STATUS:</span>
          <span className="value status-live">● IN FLIGHT</span>
        </div>
      </div>
    </div>
  );
}

