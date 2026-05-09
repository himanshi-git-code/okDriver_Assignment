# okDriver DVR History Playback

A **continuous DVR-style History Playback** feature for the okDriver Smart Dashcam Platform.

## Features

- ✅ **Clickable DVR Timeline** — 24-hour visual bar showing all recorded clips. Click or drag to jump to any time.
- ✅ **Auto-play Between Clips** — When one clip ends, the next automatically starts (toggle on/off).
- ✅ **Dual Camera Support** — Forward & Inward cameras displayed side-by-side in sync.
- ✅ **Seamless Video Navigation** — HLS streaming with hls.js fallback to MP4.
- ✅ **Camera Filter** — View Forward, Inward, or Both cameras at once.
- ✅ **Timeline Seek** — Click anywhere on the timeline to jump to that moment.

## Setup Instructions

### Requirements
- Node.js v18+ — download from https://nodejs.org

### Steps to Run

1. Install dependencies
```bash
npm install next@13.4.0
npm install
```

2. Add demo videos
- Put your dashcam `.mp4` files inside `public/videos/` folder
- Update filenames in `src/lib/mockData.ts`

3. Start the app
```bash
npm run dev
```

5. Open in browser
http://localhost:3000

6. Click **Search** button to load clips, then click on timeline or any clip to play.

## How It Works

1. **Search**: Select device + date → calls `requestVideoList` → polls `getVideoList` until clips arrive
2. **Timeline**: Clips are mapped to a 24h bar by their timestamp (parsed from filename `YYYY_MM_DD_HH_mm_ss_CH.ts`)
3. **Play**: Click clip → `startPlayback` → polls `checkPlaybackVideoReady` → loads HLS stream
4. **Autoplay**: `onEnded` callback triggers next clip in sequence
5. **Seek**: Click timeline → finds nearest clip → plays it; or calls `startHistoryPlayback` for server-side seek

## Tech Stack

- **Next.js 14**  — React framework
- **React 18** — UI library
- **TypeScript**  — type-safe JavaScript
- **hls.js** — HLS video streaming
