'use client';

import React, { useEffect, useState } from 'react';

type FeedEvent = {
  id: string;
  type: string;
  message: string;
  time: string;
  icon: string;
};

export function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    const mockEvents: FeedEvent[] = [
      { id: '1', type: 'race:start', message: 'Race R001 launched NYC→BOS', time: '14:32:15', icon: '🚀' },
      { id: '2', type: 'checkpoint', message: 'Checkpoint 2/5 reached', time: '14:31:42', icon: '📍' },
      { id: '3', type: 'weather', message: 'Wind advisory: 18 km/h gusts', time: '14:30:08', icon: '💨' },
      { id: '4', type: 'handler', message: 'FALCON88 joined network', time: '14:28:56', icon: '👤' },
    ];
    setEvents(mockEvents);
  }, []);

  return (
    <div className="panel feed-card">
      <div className="panel-header">
        <span className="panel-label">▶ LIVE FEED</span>
      </div>
      <div className="feed-events">
        {events.map((event) => (
          <div key={event.id} className="feed-item">
            <span className="feed-icon">{event.icon}</span>
            <div className="feed-text">
              <strong>{event.message}</strong>
              <small>{event.time}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

