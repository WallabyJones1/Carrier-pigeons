'use client';

import React, { useEffect, useState } from 'react';

type Activity = {
  id: string;
  label: string;
  time: string;
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const mockActivities: Activity[] = [
      { id: '1', label: 'CP-1043 claimed race $5,240 bounty', time: '14:32' },
      { id: '2', label: 'New handler "SWIFT_HAWK" joined network', time: '14:28' },
      { id: '3', label: 'CP-892 entered TOKYO→SINGAPORE race', time: '14:25' },
      { id: '4', label: 'CP-447 finished race, earned $1,820', time: '14:22' },
      { id: '5', label: 'Race PARIS→DUBAI started (673 pigeons)', time: '14:18' },
      { id: '6', label: 'Network sync: 4,832 birds airborne', time: '14:15' },
    ];
    setActivities(mockActivities);
  }, []);

  return (
    <div className="panel activity-panel">
      <div className="panel-header">
        <span className="panel-label">▶ RECENT ACTIVITY</span>
      </div>
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <span className="activity-dot">●</span>
            <span className="activity-label">{activity.label}</span>
            <span className="activity-time">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

