'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  url: string | null;
  isLoading?: boolean;
  onEnded?: () => void;
  autoPlay?: boolean;
  label?: string;
}

export default function VideoPlayer({
  url,
  isLoading,
  onEnded,
  autoPlay = true,
  label,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
  setError(false);
  const video = videoRef.current;
  if (!video || !url) return;
  video.src = url;
  video.load();
  video.addEventListener('loadeddata', () => {
    video.play().catch(() => {});
  }, { once: true });
}, [url, autoPlay]);

  return (
    <div style={{
      background: '#0a0a0a', borderRadius: 10, overflow: 'hidden',
      position: 'relative', aspectRatio: '16/9', border: '1px solid #1f2937',
    }}>
      {label && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 10,
          background: 'rgba(0,0,0,0.7)', borderRadius: 5, padding: '3px 8px',
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 11, fontWeight: 600, color: '#fff',
        }}>
          {label}
        </div>
      )}

      <video
        ref={videoRef}
        controls
        playsInline
        onEnded={onEnded}
        onError={() => setError(true)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          display: (!url || error) ? 'none' : 'block',
        }}
      />

      {(!url || isLoading) && !error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <svg width="40" height="40" fill="none" stroke="#374151" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: '#4b5563' }}>
            Select Clip
          </span>
        </div>
      )}

      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="28" height="28" fill="none" stroke="#ef4444" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="0.5" fill="#ef4444" />
          </svg>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: '#6b7280' }}>
            No Video Loaded
          </span>
        </div>
      )}
    </div>
  );
}