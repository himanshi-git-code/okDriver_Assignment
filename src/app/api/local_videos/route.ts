import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'videos');
  if (!fs.existsSync(dir)) {
    return NextResponse.json({ success: true, videos: [] });
  }
  const files = fs.readdirSync(dir)
    .filter(f => /\.(mp4|ts)$/i.test(f))
    .map(f => ({ filename: f }));
  return NextResponse.json({ success: true, videos: files });
}