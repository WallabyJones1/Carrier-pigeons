'use client';

import React from 'react';

export function PageHeader() {
  return (
    <header className="mission-header">
      <div className="header-left">
        <div className="logo-block">
          <div className="logo-mark">✉️</div>
          <div className="logo-text">
            <h1>CARRIER PIGEONS</h1>
            <p>GLOBAL DELIVERY NETWORK</p>
          </div>
        </div>
        
        <div className="kpi-stack">
          <div className="kpi-item">
            <span className="kpi-label">PIGEONS AIRBORNE</span>
            <strong className="kpi-value">12</strong>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">HANDLERS ONLINE</span>
            <strong className="kpi-value">8</strong>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">ACTIVE RACES</span>
            <strong className="kpi-value">3</strong>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">BOUNTY TOTAL</span>
            <strong className="kpi-value">2.4K</strong>
          </div>
        </div>
      </div>

      <div className="header-right">
        <svg className="skyline-graphic" viewBox="0 0 200 120" preserveAspectRatio="none">
          {/* Moon */}
          <circle cx="160" cy="20" r="12" fill="none" stroke="rgba(101,214,255,0.6)" strokeWidth="1" />
          {/* Stylized city buildings */}
          <rect x="10" y="60" width="15" height="60" fill="rgba(185,255,69,0.2)" stroke="rgba(101,214,255,0.4)" strokeWidth="0.5" />
          <rect x="30" y="50" width="20" height="70" fill="rgba(185,255,69,0.15)" stroke="rgba(101,214,255,0.4)" strokeWidth="0.5" />
          <rect x="55" y="70" width="12" height="50" fill="rgba(185,255,69,0.2)" stroke="rgba(101,214,255,0.4)" strokeWidth="0.5" />
          <rect x="75" y="55" width="18" height="65" fill="rgba(185,255,69,0.15)" stroke="rgba(101,214,255,0.4)" strokeWidth="0.5" />
          <rect x="100" y="65" width="14" height="55" fill="rgba(185,255,69,0.2)" stroke="rgba(101,214,255,0.4)" strokeWidth="0.5" />
          <rect x="120" y="50" width="16" height="70" fill="rgba(185,255,69,0.15)" stroke="rgba(101,214,255,0.4)" strokeWidth="0.5" />
          <rect x="143" y="60" width="12" height="60" fill="rgba(185,255,69,0.2)" stroke="rgba(101,214,255,0.4)" strokeWidth="0.5" />
          <rect x="162" y="55" width="14" height="65" fill="rgba(185,255,69,0.15)" stroke="rgba(101,214,255,0.4)" strokeWidth="0.5" />
          <rect x="182" y="70" width="12" height="50" fill="rgba(185,255,69,0.2)" stroke="rgba(101,214,255,0.4)" strokeWidth="0.5" />
          {/* Pigeon silhouette flying */}
          <g transform="translate(180, 30)">
            <ellipse cx="0" cy="0" rx="3" ry="2" fill="rgba(255,255,255,0.4)" />
            <path d="M -3 0 Q -5 -1 -6 -0.5 M 3 0 Q 5 -1 6 -0.5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none" />
          </g>
        </svg>
        <div className="tagline">
          <p>SMALL BIRDS</p>
          <p className="tagline-accent">BIG DELIVERIES</p>
        </div>
      </div>
    </header>
  );
}

