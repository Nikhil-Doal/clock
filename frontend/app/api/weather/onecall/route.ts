import { NextRequest, NextResponse } from 'next/server';

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

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

function generateDemoOneCall(lat: number, lon: number, units: string) {
  const now = Math.floor(Date.now() / 1000);
  const baseTemp = units === 'metric' ? 20 : 68;
  const conditions = ['clear sky', 'few clouds', 'scattered clouds', 'light rain'];
  const icons = ['01d', '02d', '03d', '10d'];

  // Current weather
  const current = {
    dt: now,
    sunrise: now - 21600,
    sunset: now + 21600,
    temp: baseTemp + Math.random() * 5,
    feels_like: baseTemp + Math.random() * 3,
    pressure: 1013 + Math.floor(Math.random() * 10),
    humidity: 50 + Math.floor(Math.random() * 30),
    uvi: Math.random() * 8,
    clouds: Math.floor(Math.random() * 100),
    visibility: 10000,
    wind_speed: 2 + Math.random() * 8,
    wind_deg: Math.floor(Math.random() * 360),
    weather: [{ description: conditions[0], icon: icons[0] }],
  };

  // Hourly forecast (48 hours)
  const hourly = Array.from({ length: 48 }, (_, i) => {
    const hourOfDay = new Date((now + i * 3600) * 1000).getHours();
    const tempVariation = Math.sin((hourOfDay - 14) * Math.PI / 12) * 5;
    const idx = Math.floor(Math.random() * 4);
    return {
      dt: now + i * 3600,
      temp: baseTemp + tempVariation + Math.random() * 2,
      feels_like: baseTemp + tempVariation + Math.random() * 2 - 2,
      pressure: 1013 + Math.floor(Math.random() * 10),
      humidity: 50 + Math.floor(Math.random() * 30),
      uvi: i < 12 ? Math.random() * 8 : 0,
      clouds: Math.floor(Math.random() * 100),
      visibility: 10000,
      wind_speed: 2 + Math.random() * 8,
      wind_deg: Math.floor(Math.random() * 360),
      pop: Math.random() * 0.5,
      weather: [{ description: conditions[idx], icon: icons[idx] }],
    };
  });

  // Daily forecast (8 days)
  const daily = Array.from({ length: 8 }, (_, i) => {
    const dayTemp = baseTemp + Math.random() * 8;
    const idx = Math.floor(Math.random() * 4);
    return {
      dt: now + i * 86400,
      sunrise: now + i * 86400 - 21600,
      sunset: now + i * 86400 + 21600,
      temp: {
        day: dayTemp,
        min: dayTemp - 5 - Math.random() * 3,
        max: dayTemp + 5 + Math.random() * 3,
        night: dayTemp - 8,
        eve: dayTemp - 2,
        morn: dayTemp - 5,
      },
      feels_like: {
        day: dayTemp - 2,
        night: dayTemp - 10,
        eve: dayTemp - 4,
        morn: dayTemp - 7,
      },
      pressure: 1013 + Math.floor(Math.random() * 10),
      humidity: 50 + Math.floor(Math.random() * 30),
      wind_speed: 2 + Math.random() * 8,
      wind_deg: Math.floor(Math.random() * 360),
      clouds: Math.floor(Math.random() * 100),
      pop: Math.random() * 0.5,
      uvi: Math.random() * 10,
      weather: [{ description: conditions[idx], icon: icons[idx] }],
    };
  });

  return {
    lat,
    lon,
    timezone: 'UTC',
    timezone_offset: 0,
    current,
    hourly,
    daily,
    alerts: [],
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

  const cacheKey = `onecall_${lat}_${lon}_${units}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  if (WEATHER_API_KEY) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${units}&exclude=minutely`,
        { next: { revalidate: 1800 } }
      );

      if (response.ok) {
        const data = await response.json();
        setCache(cacheKey, data);
        return NextResponse.json(data);
      }
    } catch (error) {
      // Fall through to demo data
    }
  }

  // Return demo data
  const demoData = generateDemoOneCall(parseFloat(lat), parseFloat(lon), units);
  setCache(cacheKey, demoData);
  return NextResponse.json(demoData);
}
