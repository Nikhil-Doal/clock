import { NextRequest, NextResponse } from 'next/server';

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'q parameter required' }, { status: 400 });
  }

  if (!WEATHER_API_KEY) {
    return NextResponse.json({ error: 'Weather API not configured' }, { status: 503 });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${WEATHER_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Failed to geocode' }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to geocode' }, { status: 502 });
  }
}
