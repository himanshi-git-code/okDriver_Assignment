// Filename parser - extracted from okdriver source code
// Format: YYYY_MM_DD_HH_mm_ss_CH.ts
// Channel: 03 = ForwardCam, 04 = InwardCam

export interface ParsedClip {
  display: string;       // "2026-05-08 01:28:12"
  dateYmd: string;       // "2026-05-08"
  timeLabel: string;     // "01:28:12"
  totalSeconds: number;  // seconds since midnight
  channel: number;       // 0=forward, 1=inward
  channelCode: string;   // "03" or "04"
  cameraType: 'ForwardCam' | 'InwardCam';
}

export function parseFilename(filename: string | null | undefined): ParsedClip | null {
  if (!filename) return null;
  const base = (filename.split('/').pop() || '').replace(/\.(ts|mp4)$/i, '');
  const parts = base.split('_');
  if (parts.length < 7) return null;

  const [yr, mo, dy, hr, mn, sc, ch] = parts;
  if (![yr, mo, dy, hr, mn, sc].every(p => /^\d+$/.test(p))) return null;

  const hh = parseInt(hr, 10);
  const mm = parseInt(mn, 10);
  const ss = parseInt(sc, 10);
  const channel = ch === '04' ? 1 : 0;

  return {
    display: `${yr}-${mo}-${dy} ${hr}:${mn}:${sc}`,
    dateYmd: `${yr}-${mo}-${dy}`,
    timeLabel: `${hr}:${mn}:${sc}`,
    totalSeconds: hh * 3600 + mm * 60 + ss,
    channel,
    channelCode: ch,
    cameraType: channel === 0 ? 'ForwardCam' : 'InwardCam',
  };
}

export interface VideoClip {
  filename: string;
  cameraType: 'ForwardCam' | 'InwardCam';
  channel: number;
  channelCode: string | null;
  localDisplayTime: string | null;
  localDateYmd: string | null;
  localTotalSeconds: number | null;
  parsedLocalTime: ParsedClip | null;
  durationSec: number;
  [key: string]: unknown;
}

export function enrichClip(raw: Record<string, unknown>): VideoClip {
  const parsed = parseFilename(raw.filename as string);
  const channel = parsed?.channel ?? (raw.channelCode === '04' ? 1 : 0);
  return {
    ...raw,
    filename: raw.filename as string,
    parsedLocalTime: parsed,
    localDisplayTime: parsed?.display ?? null,
    localDateYmd: parsed?.dateYmd ?? null,
    localTotalSeconds: parsed?.totalSeconds ?? null,
    channel,
    channelCode: (parsed?.channelCode ?? raw.channelCode ?? null) as string | null,
    cameraType: parsed?.cameraType ?? (channel === 0 ? 'ForwardCam' : 'InwardCam'),
    durationSec: 180, // 3-minute clips
  };
}

export function sortClips(clips: VideoClip[]): VideoClip[] {
  return [...clips].sort(
    (a, b) =>
      (a.localTotalSeconds ?? Number.MAX_SAFE_INTEGER) -
      (b.localTotalSeconds ?? Number.MAX_SAFE_INTEGER)
  );
}

export function secondsToHMS(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
