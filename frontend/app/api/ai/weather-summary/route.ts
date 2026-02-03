import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

// Simple cache
const cache = new Map<string, { data: string; expires: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached(key: string) {
  const item = cache.get(key);
  if (item && item.expires > Date.now()) {
    return item.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: string) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API not configured' }, { status: 503 });
  }

  try {
    const data = await request.json();
    const weatherData = data.weather || data.current;
    const hourlyData = data.hourly || [];
    const dailyData = data.daily || [];
    const locationName = data.location || 'Unknown';
    const style = data.style || 'friendly';

    if (!weatherData) {
      return NextResponse.json({ error: 'weather data required' }, { status: 400 });
    }

    const cacheKey = `summary_${JSON.stringify(weatherData).slice(0, 100)}_${style}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ summary: cached });
    }

    // Build hourly text
    let hourlyText = '';
    for (const h of hourlyData.slice(0, 6)) {
      if (h && h.dt) {
        const dt = new Date(h.dt * 1000);
        const weather = h.weather?.[0]?.description || 'N/A';
        hourlyText += `- ${dt.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}: ${h.temp || 'N/A'}°, ${weather}, Rain: ${Math.round((h.pop || 0) * 100)}%\n`;
      }
    }

    // Build daily text
    let dailyText = '';
    for (const d of dailyData.slice(0, 3)) {
      if (d && d.dt) {
        const dt = new Date(d.dt * 1000);
        const temp = d.temp || {};
        const weather = d.weather?.[0]?.description || 'N/A';
        dailyText += `- ${dt.toLocaleDateString('en', { weekday: 'long' })}: High ${temp.max || 'N/A'}°, Low ${temp.min || 'N/A'}°, ${weather}\n`;
      }
    }

    const stylePrompts: Record<string, string> = {
      friendly: 'Give a friendly, conversational weather summary. Be warm and helpful.',
      scientific: 'Give a scientific, detailed weather analysis with meteorological terms.',
      eli5: 'Explain the weather like I\'m 5 years old. Use simple words and fun comparisons.',
    };

    const prompt = `
${stylePrompts[style] || stylePrompts.friendly}

Based on this weather data, provide a helpful weather summary (3-4 sentences):

**Current conditions in ${locationName}:**
- Temperature: ${weatherData.temp || 'N/A'}°
- Feels like: ${weatherData.feels_like || 'N/A'}°
- Conditions: ${weatherData.description || 'N/A'}
- Humidity: ${weatherData.humidity || 'N/A'}%
- Wind: ${weatherData.wind_speed || 'N/A'} m/s

**Upcoming hours:**
${hourlyText || 'N/A'}

**Upcoming days:**
${dailyText || 'N/A'}

Include what to expect and any recommendations. Use **bold** for important points.
`;

    const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await genai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const summary = response.text || 'Unable to generate summary';
    setCache(cacheKey, summary);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('AI Summary error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 502 });
  }
}
