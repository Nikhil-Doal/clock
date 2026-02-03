// Use relative paths for Vercel serverless functions
const API_BASE = '';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw new Error('Network error - please check your connection');
  }
}

async function handleResponse(response: Response, errorMsg: string) {
  if (!response.ok) {
    try {
      const data = await response.json();
      throw new Error(data.error || errorMsg);
    } catch {
      throw new Error(`${errorMsg} (${response.status})`);
    }
  }
  return response.json();
}

export async function getCurrentWeather(
  lat: number,
  lon: number,
  units: 'metric' | 'imperial' = 'metric'
) {
  const response = await fetchWithTimeout(
    `${API_BASE}/api/weather/current?lat=${lat}&lon=${lon}&units=${units}`
  );
  return handleResponse(response, 'Failed to fetch weather');
}

export async function getForecast(
  lat: number,
  lon: number,
  units: 'metric' | 'imperial' = 'metric'
) {
  const response = await fetchWithTimeout(
    `${API_BASE}/api/weather/forecast?lat=${lat}&lon=${lon}&units=${units}`
  );
  return handleResponse(response, 'Failed to fetch forecast');
}

export async function getOneCall(
  lat: number,
  lon: number,
  units: 'metric' | 'imperial' = 'metric'
) {
  const response = await fetchWithTimeout(
    `${API_BASE}/api/weather/onecall?lat=${lat}&lon=${lon}&units=${units}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  return response.json();
}

export async function getAirQuality(lat: number, lon: number) {
  const response = await fetchWithTimeout(
    `${API_BASE}/api/weather/air-quality?lat=${lat}&lon=${lon}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch air quality');
  }
  return response.json();
}

export async function geocode(query: string) {
  const response = await fetchWithTimeout(
    `${API_BASE}/api/geocode?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    throw new Error('Failed to geocode location');
  }
  return response.json();
}

export async function getAstronomy(lat: number, lon: number) {
  const response = await fetchWithTimeout(
    `${API_BASE}/api/astronomy?lat=${lat}&lon=${lon}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch astronomy data');
  }
  return response.json();
}

export async function getWeatherSummary(
  weatherData: Record<string, unknown>,
  style: 'friendly' | 'scientific' | 'eli5' = 'friendly'
) {
  const response = await fetchWithTimeout(`${API_BASE}/api/ai/weather-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weather: weatherData, style }),
  });
  if (!response.ok) {
    throw new Error('Failed to get weather summary');
  }
  return response.json();
}

export async function getDailyBriefing(
  weatherData: Record<string, unknown>,
  forecastData: Record<string, unknown>[],
  timezone: string
) {
  const response = await fetchWithTimeout(`${API_BASE}/api/ai/daily-briefing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      weather: weatherData,
      forecast: forecastData,
      timezone,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to get daily briefing');
  }
  return response.json();
}

export async function checkHealth() {
  const response = await fetchWithTimeout(`${API_BASE}/api/health`);
  return response.json();
}
