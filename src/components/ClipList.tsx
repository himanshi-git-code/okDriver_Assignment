'use client';

import { VideoClip } from '@/lib/clips';

interface ClipListProps {
  clips: VideoClip[];
  selected: VideoClip | null;
  onSelect: (clip: VideoClip) => void;
  cameraFilter: 'ForwardCam' | 'InwardCam' | 'Both';
  onCameraChange: (cam: 'ForwardCam' | 'InwardCam' | 'Both') => void;
  isSearching: boolean;
}

export default function ClipList({
  clips,
  selected,
  onSelect,
  cameraFilter,
  onCameraChange,
  isSearching,
}: ClipListProps) {
  const filtered = clips.filter(
    c => cameraFilter === 'Both' || c.cameraType === cameraFilter
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Camera filter */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
        <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 8 }}>
          Camera
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['Both', 'ForwardCam', 'InwardCam'] as const).map(cam => (
            <button
              key={cam}
              onClick={() => onCameraChange(cam)}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'IBM Plex Sans',sans-serif",
                fontSize: 11,
                fontWeight: 600,
                background: cameraFilter === cam ? '#111827' : '#f3f4f6',
                color: cameraFilter === cam ? '#fff' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              {cam === 'Both' ? 'Both' : cam === 'ForwardCam' ? 'Forward' : 'Inward'}
            </button>
          ))}
        </div>
      </div>

      {/* Clip count header */}
      <div style={{ padding: '10px 14px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 13, fontWeight: 600, color: '#111827' }}>
          Available Videos ({filtered.length})
        </span>
        {filtered.length > 0 && (
          <span style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 11, color: '#9ca3af' }}>
            Click to play
          </span>
        )}
      </div>

      {/* Searching state */}
      {isSearching && (
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['Requesting video list from device...', 'Waiting for device to respond...', 'Polling for available videos...'].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', animation: `pulse ${0.6 + i * 0.2}s ease infinite alternate` }} />
              <span style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, color: '#6b7280' }}>{s}</span>
            </div>
          ))}
          <style>{`@keyframes pulse { from { opacity: 0.3; } to { opacity: 1; } }`}</style>
        </div>
      )}

      {/* Empty state */}
      {!isSearching && filtered.length === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 }}>
          <svg width="32" height="32" fill="none" stroke="#d1d5db" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            Search to load recordings
          </p>
        </div>
      )}

      {/* Clip list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.map((clip, i) => {
          const isSelected = selected?.filename === clip.filename;
          const isFwd = clip.cameraType === 'ForwardCam';
          return (
            <div
              key={`${clip.filename}-${i}`}
              onClick={() => onSelect(clip)}
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid #f9fafb',
                cursor: 'pointer',
                background: isSelected ? '#f0f9ff' : '#fff',
                borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.12s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 13, fontWeight: 600,
                    color: isSelected ? '#1d4ed8' : '#111827',
                    marginBottom: 2,
                  }}>
                    {clip.localDisplayTime ?? clip.filename}
                  </p>
                  <p style={{
                    fontFamily: "'IBM Plex Sans',sans-serif",
                    fontSize: 11, color: '#9ca3af',
                  }}>
                    {clip.filename.split('/').pop()}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: "'IBM Plex Sans',sans-serif",
                    fontSize: 10, fontWeight: 600,
                    padding: '2px 8px', borderRadius: 5,
                    background: isFwd ? '#dbeafe' : '#ede9fe',
                    color: isFwd ? '#1d4ed8' : '#7c3aed',
                  }}>
                    {isFwd ? 'ForwardCam' : 'InwardCam'}
                  </span>
                  {isSelected && (
                    <svg width="14" height="14" fill="#3b82f6" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
