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
      { id: '1', label: 'Race R002 complete', time: '14:31' },
      { id: '2', label: 'New handler joined', time: '14:28' },
      { id: '3', label: 'Route MIA→ATL open', time: '14:25' },
      { id: '4', label: 'Weather update received', time: '14:22' },
      { id: '5', label: 'Leaderboard updated', time: '14:18' },
      { id: '6', label: 'Network sync OK', time: '14:15' },
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

