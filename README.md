# okDriver DVR History Playback

A **continuous DVR-style History Playback** feature for the okDriver Smart Dashcam Platform.

## Features

- ✅ **Clickable DVR Timeline** — 24-hour visual bar showing all recorded clips. Click or drag to jump to any time.
- ✅ **Auto-play Between Clips** — When one clip ends, the next automatically starts (toggle on/off).
- ✅ **Dual Camera Support** — Forward & Inward cameras displayed side-by-side in sync.
- ✅ **Seamless Video Navigation** — HLS streaming with hls.js fallback to MP4.
- ✅ **Camera Filter** — View Forward, Inward, or Both cameras at once.
- ✅ **Timeline Seek** — Click anywhere on the timeline to jump to that moment.

## Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd okdriver-dvr
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Login

The app uses `localStorage.userToken` for auth. Login via the main okDriver platform first, then the token will be shared across `dashcam.okdriver.in` and this app (same origin required).

Or paste a token manually in the browser console:
```js
localStorage.setItem('userToken', 'your-token-here')
```

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Redirects to /history
│   └── history/
│       └── page.tsx        # Main DVR History page
├── components/
│   ├── DVRTimeline.tsx     # Clickable 24h timeline bar
│   ├── VideoPlayer.tsx     # HLS/MP4 video player
│   └── ClipList.tsx        # Sidebar clip list
└── lib/
    ├── api.ts              # okDriver API service layer
    └── clips.ts            # Filename parser & clip utilities
```

## How It Works

1. **Search**: Select device + date → calls `requestVideoList` → polls `getVideoList` until clips arrive
2. **Timeline**: Clips are mapped to a 24h bar by their timestamp (parsed from filename `YYYY_MM_DD_HH_mm_ss_CH.ts`)
3. **Play**: Click clip → `startPlayback` → polls `checkPlaybackVideoReady` → loads HLS stream
4. **Autoplay**: `onEnded` callback triggers next clip in sequence
5. **Seek**: Click timeline → finds nearest clip → plays it; or calls `startHistoryPlayback` for server-side seek

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/devices/:imei/request-video-list` | Ask device to send clip list |
| GET | `/api/devices/:imei/video-list` | Fetch available clips |
| POST | `/api/devices/:imei/start-playback` | Start clip playback |
| POST | `/api/devices/:imei/stop-playback` | Stop current playback |
| GET | `/api/devices/:imei/playback-ready` | Check if clip is ready |
| POST | `/api/devices/:imei/history-playback` | Seek to specific timestamp |

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **hls.js** — HLS video streaming
- **IBM Plex Sans / Mono** — Matching okDriver's font stack

## Demo Credentials

- **Platform**: https://dashcam.okdriver.in/user/auth/login
- **Email**: demo@okdriver.in
- **Password**: 12345678
