import { NextRequest, NextResponse } from 'next/server';

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const DEMO_MODE = process.env.DEMO_MODE !== 'false';

// Simple in-memory cache
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

function getDemoWeather(lat: number, lon: number, units: string) {
  const temp = units === 'metric' ? Math.floor(Math.random() * 10) + 15 : Math.floor(Math.random() * 20) + 60;
  const conditions = ['clear sky', 'few clouds', 'scattered clouds', 'light rain', 'overcast clouds'];
  const icons = ['01d', '02d', '03d', '10d', '04d'];
  const idx = Math.floor(Math.random() * 5);

  const now = new Date();
  const sunrise = new Date(now);
  sunrise.setHours(6, 30, 0, 0);
  const sunset = new Date(now);
  sunset.setHours(18, 30, 0, 0);

  return {
    coord: { lon, lat },
    weather: [{ description: conditions[idx], icon: icons[idx] }],
    main: {
      temp,
      feels_like: temp - 2,
      humidity: Math.floor(Math.random() * 40) + 40,
      pressure: Math.floor(Math.random() * 15) + 1010,
    },
    wind: { speed: Math.floor(Math.random() * 8) + 2, deg: Math.floor(Math.random() * 360) },
    clouds: { all: Math.floor(Math.random() * 100) },
    visibility: 10000,
    sys: { sunrise: Math.floor(sunrise.getTime() / 1000), sunset: Math.floor(sunset.getTime() / 1000) },
    name: 'Demo Location',
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const units = searchParams.get('units') || 'metric';

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon parameters required' }, { status: 400 });
  }

  const cacheKey = `current_${lat}_${lon}_${units}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  if (WEATHER_API_KEY) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${units}`,
        { next: { revalidate: 600 } }
      );

      if (response.ok) {
        const data = await response.json();
        setCache(cacheKey, data);
        return NextResponse.json(data);
      }
    } catch (error) {
      if (!DEMO_MODE) {
        return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 502 });
      }
    }
  }

  if (DEMO_MODE) {
    const data = getDemoWeather(parseFloat(lat), parseFloat(lon), units);
    setCache(cacheKey, data);
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: 'Weather API not configured' }, { status: 503 });
}
