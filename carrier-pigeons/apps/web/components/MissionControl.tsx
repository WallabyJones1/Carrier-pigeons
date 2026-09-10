'use client';

import React from 'react';
import { LiveRaces } from './dashboard/LiveRaces';
import { TopHandlers } from './dashboard/TopHandlers';
import { WorldMap } from './dashboard/WorldMap';
import { SelectedPigeon } from './dashboard/SelectedPigeon';
import { LiveFeed } from './dashboard/LiveFeed';
import { NetworkStatus } from './dashboard/NetworkStatus';
import { RecentActivity } from './dashboard/RecentActivity';
import { PromoBanner } from './dashboard/PromoBanner';

export function MissionControl() {
  return (
    <div className="mission-grid">
      {/* LEFT COLUMN */}
      <div className="mission-column mission-left">
        <LiveRaces />
        <TopHandlers />
        <PromoBanner />
      </div>

      {/* CENTER COLUMN */}
      <div className="mission-column mission-center">
        <WorldMap />
        <div className="bottom-strip">
          <SelectedPigeon />
          <LiveFeed />
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="mission-column mission-right">
        <NetworkStatus />
        <RecentActivity />
      </div>
    </div>
  );
}

