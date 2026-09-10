'use client';

import { MissionControl } from '../components/MissionControl';
import { PageHeader } from '../components/PageHeader';
import { Navigation } from '../components/Navigation';

export default function Home() {
  return (
    <div className="mission-app">
      <PageHeader />
      <Navigation />
      <MissionControl />
    </div>
  );
}

