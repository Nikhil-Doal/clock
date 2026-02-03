import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API not configured' }, { status: 503 });
  }

  try {
    const data = await request.json();
    const weatherData = data.weather;
    const forecastData = data.forecast || [];
    const timezone = data.timezone || 'UTC';

    if (!weatherData) {
      return NextResponse.json({ error: 'weather data required' }, { status: 400 });
    }

    let forecastText = '';
    for (const item of forecastData.slice(0, 8)) {
      if (item) {
        forecastText += `- ${item.time || 'N/A'}: ${item.temp || 'N/A'}°, ${item.description || 'N/A'}\n`;
      }
    }

    const prompt = `
You are an ambient display assistant. Generate a calming, helpful daily briefing.

Current Weather:
- Temperature: ${weatherData.temp || 'N/A'}°
- Feels like: ${weatherData.feels_like || 'N/A'}°
- Conditions: ${weatherData.description || 'N/A'}
- Humidity: ${weatherData.humidity || 'N/A'}%
- Sunrise: ${weatherData.sunrise || 'N/A'}
- Sunset: ${weatherData.sunset || 'N/A'}

Upcoming forecast:
${forecastText || 'N/A'}

Location: ${weatherData.location || 'Unknown'}
Timezone: ${timezone}

Provide a brief, calming daily briefing (3-4 sentences) that includes:
1. Current conditions summary
2. What to expect throughout the day
3. Any clothing or activity recommendations
`;

    const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await genai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    return NextResponse.json({ briefing: response.text || 'Unable to generate briefing' });
  } catch (error) {
    console.error('AI Daily Briefing error:', error);
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 502 });
  }
}
