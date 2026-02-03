import { NextRequest, NextResponse } from 'next/server';

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key: string) {
  const item = cache.get(key);
  if (item && item.expires > Date.now()) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon parameters required' }, { status: 400 });
  }

  const cacheKey = `air_${lat}_${lon}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  if (!WEATHER_API_KEY) {
    // Return demo data
    const demoData = {
      list: [{
        main: { aqi: Math.floor(Math.random() * 3) + 1 },
        components: {
          pm2_5: Math.random() * 20 + 5,
          pm10: Math.random() * 30 + 10,
          o3: Math.random() * 50 + 20,
          no2: Math.random() * 30 + 5,
        },
      }],
    };
    return NextResponse.json(demoData);
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`,
      { next: { revalidate: 600 } }
    );

    if (response.ok) {
      const data = await response.json();
      setCache(cacheKey, data);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Failed to fetch air quality' }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch air quality' }, { status: 502 });
  }
}
