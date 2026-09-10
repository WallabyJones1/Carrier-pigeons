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
          <span className="pigeon-icon">🐦</span>
          <div>
            <strong>HAWK_001</strong>
            <small>Callsign ID</small>
          </div>
        </div>
        <div className="detail-row">
          <span className="label">ROUTE:</span>
          <span className="value">NYC → BOS</span>
        </div>
        <div className="detail-row">
          <span className="label">RANK:</span>
          <span className="value">1/12</span>
        </div>
        <div className="detail-row">
          <span className="label">PROGRESS:</span>
          <span className="value">65%</span>
        </div>
        <div className="detail-row">
          <span className="label">ETA:</span>
          <span className="value">2:14 remaining</span>
        </div>
        <div className="detail-row">
          <span className="label">STATUS:</span>
          <span className="value status-live">● AIRBORNE</span>
        </div>
      </div>
    </div>
  );
}

