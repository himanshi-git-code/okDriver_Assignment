'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { VideoClip, secondsToHMS } from '@/lib/clips';

interface TimelineSegment {
  filename: string;
  dayStartSecond: number;
  durationSec: number;
  cameraType: 'ForwardCam' | 'InwardCam';
  channel: number;
  timeLabel: string;
}

interface DVRTimelineProps {
  segments: TimelineSegment[];
  currentSecond: number;
  onSeek: (second: number) => void;
  cameraFilter: 'ForwardCam' | 'InwardCam' | 'Both';
  date: string | null;
}

const TOTAL_DAY = 86400; // 24h in seconds

export default function DVRTimeline({
  segments,
  currentSecond,
  onSeek,
  cameraFilter,
  date,
}: DVRTimelineProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [hoveredSecond, setHoveredSecond] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const filtered = segments.filter(
    (s) =>
      cameraFilter === 'Both' ||
      s.cameraType === cameraFilter
  );

  const getSecondFromX = useCallback((clientX: number) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * TOTAL_DAY);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    const sec = getSecondFromX(e.clientX);
    onSeek(sec);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setHoveredSecond(getSecondFromX(e.clientX));
    if (isDragging) onSeek(getSecondFromX(e.clientX));
  };

  const currentPct = (currentSecond / TOTAL_DAY) * 100;
  const hoveredPct = hoveredSecond !== null ? (hoveredSecond / TOTAL_DAY) * 100 : null;

  // Hour markers
  const hours = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div
      style={{
        background: '#111827',
        borderRadius: 12,
        padding: '12px 16px 10px',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            History Timeline
          </span>
          {date && (
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#6b7280' }}>
              {date}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#d1d5db' }}>
            {secondsToHMS(currentSecond)}
          </span>
          <span style={{ fontSize: 11, color: '#4b5563' }}>
            {filtered.length} clips
          </span>
        </div>
      </div>

      {/* Timeline Bar */}
      <div
        ref={barRef}
        style={{ position: 'relative', height: 40, cursor: 'pointer' }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredSecond(null)}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        {/* Background track */}
        <div style={{
          position: 'absolute', inset: '8px 0',
          background: '#1f2937', borderRadius: 4,
        }} />

        {/* Clip segments */}
        {filtered.map((seg, i) => {
          const left = (seg.dayStartSecond / TOTAL_DAY) * 100;
          const width = (seg.durationSec / TOTAL_DAY) * 100;
          const isFwd = seg.cameraType === 'ForwardCam';
          return (
            <div
              key={`${seg.filename}-${i}`}
              title={`${seg.cameraType} — ${seg.timeLabel}`}
              style={{
                position: 'absolute',
                left: `${left}%`,
                width: `${Math.max(width, 0.3)}%`,
                top: isFwd ? 8 : 20,
                height: 12,
                background: isFwd ? '#3b82f6' : '#8b5cf6',
                borderRadius: 2,
                opacity: 0.85,
                transition: 'opacity 0.1s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.target as HTMLDivElement).style.opacity = '1'; }}
              onMouseLeave={e => { (e.target as HTMLDivElement).style.opacity = '0.85'; }}
              onClick={(e) => { e.stopPropagation(); onSeek(seg.dayStartSecond); }}
            />
          );
        })}

        {/* Hover indicator */}
        {hoveredPct !== null && (
          <div style={{
            position: 'absolute',
            left: `${hoveredPct}%`,
            top: 0, bottom: 0, width: 1,
            background: 'rgba(255,255,255,0.3)',
            pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute',
              top: -20, left: '50%', transform: 'translateX(-50%)',
              background: '#374151', borderRadius: 4, padding: '2px 6px',
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#d1d5db',
              whiteSpace: 'nowrap',
            }}>
              {hoveredSecond !== null ? secondsToHMS(hoveredSecond) : ''}
            </div>
          </div>
        )}

        {/* Current position scrubber */}
        <div style={{
          position: 'absolute',
          left: `${currentPct}%`,
          top: 0, bottom: 0, width: 2,
          background: '#f59e0b',
          boxShadow: '0 0 8px #f59e0b',
          borderRadius: 1,
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 10, height: 10,
            borderRadius: '50%',
            background: '#f59e0b',
            boxShadow: '0 0 10px #f59e0b',
          }} />
        </div>
      </div>

      {/* Hour markers */}
      <div style={{ position: 'relative', height: 18, marginTop: 2 }}>
        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => (
          <div
            key={h}
            style={{
              position: 'absolute',
              left: `${(h / 24) * 100}%`,
              transform: 'translateX(-50%)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              color: '#4b5563',
              whiteSpace: 'nowrap',
            }}
          >
            {String(h % 24).padStart(2, '0')}:00
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 12, height: 6, borderRadius: 2, background: '#3b82f6' }} />
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10, color: '#6b7280' }}>Forward</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 12, height: 6, borderRadius: 2, background: '#8b5cf6' }} />
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10, color: '#6b7280' }}>Inward</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 12, height: 6, borderRadius: 2, background: '#f59e0b' }} />
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 10, color: '#6b7280' }}>Current</span>
        </div>
      </div>
    </div>
  );
}
