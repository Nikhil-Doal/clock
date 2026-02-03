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
    const message = data.message;
    const weatherData = data.weather || data.current;
    const hourlyData = data.hourly || [];
    const dailyData = data.daily || [];
    const locationName = data.location || 'Unknown';
    const chatHistory = data.history || [];

    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }

    // Build weather context
    let weatherContext = `
Current weather in ${locationName}:
- Temperature: ${weatherData?.temp || 'N/A'}°
- Feels like: ${weatherData?.feels_like || 'N/A'}°
- Conditions: ${weatherData?.description || 'N/A'}
- Humidity: ${weatherData?.humidity || 'N/A'}%
- Wind: ${weatherData?.wind_speed || 'N/A'} m/s
`;

    // Add hourly forecast
    if (hourlyData.length > 0) {
      weatherContext += '\nUpcoming hours:\n';
      for (const h of hourlyData.slice(0, 8)) {
        if (h && h.dt) {
          const dt = new Date(h.dt * 1000);
          weatherContext += `- ${dt.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}: ${h.temp || 'N/A'}°, Rain: ${Math.round((h.pop || 0) * 100)}%\n`;
        }
      }
    }

    // Add daily forecast
    if (dailyData.length > 0) {
      weatherContext += '\nUpcoming days:\n';
      for (const d of dailyData.slice(0, 5)) {
        if (d && d.dt) {
          const dt = new Date(d.dt * 1000);
          const temp = d.temp || {};
          weatherContext += `- ${dt.toLocaleDateString('en', { weekday: 'long' })}: High ${temp.max || 'N/A'}°, Low ${temp.min || 'N/A'}°\n`;
        }
      }
    }

    // Build conversation history
    let conversation = '';
    for (const msg of chatHistory.slice(-6)) {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      conversation += `${role}: ${msg.content}\n`;
    }

    const prompt = `You are a helpful weather assistant for an ambient clock display. Answer questions about the weather concisely and helpfully. Use **bold** for emphasis.

${weatherContext}

${conversation}
User: ${message}

Respond helpfully and concisely (2-3 sentences unless more detail is needed). If asked about something unrelated to weather, politely redirect to weather topics.`;

    const genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await genai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    return NextResponse.json({ response: response.text || 'Unable to respond' });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 502 });
  }
}
