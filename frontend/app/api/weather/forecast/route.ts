import { NextRequest, NextResponse } from 'next/server';

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const DEMO_MODE = process.env.DEMO_MODE !== 'false';

const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

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

function getDemoForecast(lat: number, lon: number, units: string) {
  const forecasts = [];
  const now = new Date();
  const conditions = ['clear sky', 'few clouds', 'scattered clouds', 'light rain'];
  const icons = ['01d', '02d', '03d', '10d'];

  for (let i = 0; i < 40; i++) {
    const dt = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
    const idx = Math.floor(Math.random() * 4);
    const temp = units === 'metric' ? Math.floor(Math.random() * 16) + 12 : Math.floor(Math.random() * 30) + 55;

    forecasts.push({
      dt: Math.floor(dt.getTime() / 1000),
      main: {
        temp,
        feels_like: temp - 2,
        humidity: Math.floor(Math.random() * 40) + 40,
      },
      weather: [{ description: conditions[idx], icon: icons[idx] }],
      pop: Math.random() * 0.5,
      wind: { speed: Math.floor(Math.random() * 8) + 2 },
    });
  }

  return { list: forecasts, city: { name: 'Demo Location' } };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const units = searchParams.get('units') || 'metric';

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon parameters required' }, { status: 400 });
  }

  const cacheKey = `forecast_${lat}_${lon}_${units}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  if (WEATHER_API_KEY) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${units}`,
        { next: { revalidate: 1800 } }
      );

      if (response.ok) {
        const data = await response.json();
        setCache(cacheKey, data);
        return NextResponse.json(data);
      }
    } catch (error) {
      if (!DEMO_MODE) {
        return NextResponse.json({ error: 'Failed to fetch forecast' }, { status: 502 });
      }
    }
  }

  if (DEMO_MODE) {
    const data = getDemoForecast(parseFloat(lat), parseFloat(lon), units);
    setCache(cacheKey, data);
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: 'Weather API not configured' }, { status: 503 });
}
