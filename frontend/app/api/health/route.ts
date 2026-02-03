import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      weather_api: !!process.env.OPENWEATHER_API_KEY,
      gemini_api: !!process.env.GEMINI_API_KEY,
    },
  });
}
