'use client';

import { useCallback, useState } from 'react';
import { enrichClip, sortClips, VideoClip } from '@/lib/clips';
import { MOCK_VIDEOS, MOCK_DEVICE, getMockUrl } from '@/lib/mockData';
import DVRTimeline from '@/components/DVRTimeline';
import VideoPlayer from '@/components/VideoPlayer';
import ClipList from '@/components/ClipList';

interface TimelineSegment {
  filename: string;
  dayStartSecond: number;
  durationSec: number;
  cameraType: 'ForwardCam' | 'InwardCam';
  channel: number;
  timeLabel: string;
}

export default function DVRHistoryPage() {
  const [date, setDate] = useState('2026-05-09');
  const [cameraFilter, setCameraFilter] = useState<'ForwardCam' | 'InwardCam' | 'Both'>('Both');
  const [isSearching, setIsSearching] = useState(false);
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [segments, setSegments] = useState<TimelineSegment[]>([]);
  const [currentClip, setCurrentClip] = useState<VideoClip | null>(null);
  const [currentClipFwd, setCurrentClipFwd] = useState<VideoClip | null>(null);
  const [currentClipInward, setCurrentClipInward] = useState<VideoClip | null>(null);
  const [videoUrlFwd, setVideoUrlFwd] = useState<string | null>(null);
  const [videoUrlInward, setVideoUrlInward] = useState<string | null>(null);
  const [seekSecond, setSeekSecond] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    setClips([]);
    setSegments([]);
    setCurrentClip(null);
    setVideoUrlFwd(null);
    setVideoUrlInward(null);
    await new Promise(r => setTimeout(r, 800));
    const enriched = sortClips(
      MOCK_VIDEOS.map(v => enrichClip({ filename: v.filename } as Record<string, unknown>))
    );
    setClips(enriched);
    setSegments(enriched.map(c => ({
      filename: c.filename,
      dayStartSecond: c.localTotalSeconds ?? 0,
      durationSec: c.durationSec,
      cameraType: c.cameraType,
      channel: c.channel,
      timeLabel: c.parsedLocalTime?.timeLabel ?? '00:00:00',
    })));
    setIsSearching(false);
  }, []);

  const playClip = useCallback((clip: VideoClip) => {
    setCurrentClip(clip);
    const url = getMockUrl(clip.filename) ?? `/videos/${clip.filename}`;
    if (clip.cameraType === 'ForwardCam') {
      setCurrentClipFwd(clip);
      setVideoUrlFwd(url);
    } else {
      setCurrentClipInward(clip);
      setVideoUrlInward(url);
    }
    setSeekSecond(clip.localTotalSeconds ?? 0);
  }, []);

  const playNext = useCallback(() => {
  if (!autoPlay) return;
  
  const allClips = sortClips(clips);
  
  // Current time se next clip search
  const currentSec = seekSecond;
  
  // Next forward clip
  const nextFwd = allClips.find(c => 
    c.cameraType === 'ForwardCam' && (c.localTotalSeconds ?? 0) > currentSec
  );
  
  // Next inward clip  
  const nextInward = allClips.find(c => 
    c.cameraType === 'InwardCam' && (c.localTotalSeconds ?? 0) > currentSec
  );

  if (cameraFilter === 'ForwardCam' && nextFwd) {
    playClip(nextFwd);
  } else if (cameraFilter === 'InwardCam' && nextInward) {
    playClip(nextInward);
  } else if (cameraFilter === 'Both') {
    if (nextFwd) playClip(nextFwd);
    if (nextInward) playClip(nextInward);
  }
}, [autoPlay, clips, seekSecond, cameraFilter, playClip]);

  const handleSeek = useCallback((second: number) => {
  setSeekSecond(second);
  const allClips = sortClips(clips);
  
  // Forward cam ka closest clip
  const bestFwd = allClips
    .filter(c => c.cameraType === 'ForwardCam')
    .reduce<VideoClip | null>((prev, cur) => {
      const cs = cur.localTotalSeconds ?? 0;
      if (cs > second + cur.durationSec) return prev;
      if (!prev) return cur;
      return Math.abs(cs - second) < Math.abs((prev.localTotalSeconds ?? 0) - second) ? cur : prev;
    }, null);

  // Inward cam ka closest clip
  const bestInward = allClips
    .filter(c => c.cameraType === 'InwardCam')
    .reduce<VideoClip | null>((prev, cur) => {
      const cs = cur.localTotalSeconds ?? 0;
      if (cs > second + cur.durationSec) return prev;
      if (!prev) return cur;
      return Math.abs(cs - second) < Math.abs((prev.localTotalSeconds ?? 0) - second) ? cur : prev;
    }, null);

  // Dono ek sath play 
  if (cameraFilter === 'Both' || cameraFilter === 'ForwardCam') {
    if (bestFwd) playClip(bestFwd);
  }
  if (cameraFilter === 'Both' || cameraFilter === 'InwardCam') {
    if (bestInward) playClip(bestInward);
  }
}, [clips, cameraFilter, playClip]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f1f5f9', fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: '#111827', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>okDriver</span>
          <span style={{ fontSize: 11, color: '#4b5563' }}>DVR History Playback</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: '#1d4ed8', color: '#fff' }}>
            {MOCK_DEVICE.vehicleNo}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>Auto-play</span>
          <button onClick={() => setAutoPlay(p => !p)} style={{ width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', background: autoPlay ? '#3b82f6' : '#374151', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: 2, left: autoPlay ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 20px', flexShrink: 0, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', display: 'block', marginBottom: 5 }}>Device</label>
          <div style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', background: '#f9fafb', fontFamily: "'IBM Plex Mono', monospace" }}>
            {MOCK_DEVICE.vehicleNo} [{MOCK_DEVICE.imei}]
          </div>
        </div>
        <div>
          <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', display: 'block', marginBottom: 5 }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', outline: 'none', fontFamily: "'IBM Plex Mono', monospace" }} />
        </div>
        <button onClick={handleSearch} disabled={isSearching}
          style={{ padding: '9px 28px', background: isSearching ? '#6b7280' : '#111827', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: isSearching ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, height: 38, flexShrink: 0 }}>
          {isSearching ? (
            <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Searching...</>
          ) : (
            <><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>Search</>
          )}
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid #e5e7eb', background: '#fff', overflowY: 'auto' }}>
          <ClipList clips={clips} selected={currentClip} onSelect={playClip} cameraFilter={cameraFilter} onCameraChange={setCameraFilter} isSearching={isSearching} />
        </div>

        {/* Videos + Timeline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0f172a' }}>
          <div style={{ flex: 1, display: 'flex', gap: 12, padding: 16, overflow: 'hidden' }}>

            {/* Forward cam */}
            {(cameraFilter === 'Both' || cameraFilter === 'ForwardCam') && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <VideoPlayer url={videoUrlFwd} label="🔵 Forward Camera" isLoading={false} onEnded={playNext}/>
                {currentClipFwd && (
                  <div style={{ background: '#1e293b', borderRadius: 6, padding: '6px 12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#94a3b8' }}>{currentClipFwd && videoUrlFwd && (
  <div style={{ background: '#1e293b', borderRadius: 6, padding: '6px 12px', display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#94a3b8' }}>{currentClipFwd.localDisplayTime}</span>
    <span style={{ fontSize: 10, color: '#3b82f6', fontWeight: 600 }}>ForwardCam</span>
  </div>
)}</span>
                    <span style={{ fontSize: 10, color: '#3b82f6', fontWeight: 600 }}>ForwardCam</span>
                  </div>
                )}
              </div>
            )}

            {/* Inward cam */}
            {(cameraFilter === 'Both' || cameraFilter === 'InwardCam') && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <VideoPlayer url={videoUrlInward} label="🟣 Inward Camera" isLoading={false} onEnded={playNext}/>
                  <div style={{ background: '#1e293b', borderRadius: 6, padding: '6px 12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#94a3b8' }}>{currentClipInward && videoUrlInward && (
  <div style={{ background: '#1e293b', borderRadius: 6, padding: '6px 12px', display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#94a3b8' }}>{currentClipInward.localDisplayTime}</span>
    <span style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 600 }}>InwardCam</span>
  </div>
)}</span>
                    <span style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 600 }}>InwardCam</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div style={{ padding: '0 16px 16px', flexShrink: 0 }}>
            <DVRTimeline segments={segments} currentSecond={seekSecond} onSeek={handleSeek} cameraFilter={cameraFilter} date={date} />
          </div>
        </div>
      </div>
    </div>
  );
}
