import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon parameters required' }, { status: 400 });
  }

  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate solar declination
  const declination = -23.45 * Math.cos((Math.PI / 180) * (360 / 365) * (dayOfYear + 10));

  // Calculate day length
  const latRad = (lat * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;

  let dayLength: number;
  try {
    const hourAngle = (180 / Math.PI) * Math.acos(-Math.tan(latRad) * Math.tan(decRad));
    dayLength = (2 * hourAngle) / 15;
  } catch {
    dayLength = lat * declination > 0 ? 24 : 0;
  }

  // Moon phase calculation
  const referenceDate = new Date('2000-01-06T00:00:00Z');
  const daysSince = (now.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  const moonAge = daysSince % 29.53;
  const moonPhase = moonAge / 29.53;

  const phaseNames = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ];
  const phaseIndex = Math.floor((moonPhase * 8) % 8);

  const illumination =
    moonPhase <= 0.5
      ? Math.abs(Math.cos(Math.PI * moonPhase)) * 100
      : Math.abs(Math.cos(Math.PI * (1 - moonPhase))) * 100;

  return NextResponse.json({
    sun: {
      declination: Math.round(declination * 100) / 100,
      day_length_hours: Math.round(dayLength * 100) / 100,
    },
    moon: {
      phase: Math.round(moonPhase * 1000) / 1000,
      age_days: Math.round(moonAge * 10) / 10,
      phase_name: phaseNames[phaseIndex],
      illumination: Math.round(illumination * 10) / 10,
    },
  });
}
