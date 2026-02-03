"""
Ambient Clock Backend - Flask API Server
Handles weather data proxying, Gemini AI integration, and caching.
"""

import os
from datetime import datetime, timedelta, timezone
from functools import wraps

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import requests
from cachetools import TTLCache
from google import genai

load_dotenv()

app = Flask(__name__)
CORS(app, origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","))

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Caching
weather_cache = TTLCache(maxsize=100, ttl=600)  # 10 min cache for weather
forecast_cache = TTLCache(maxsize=100, ttl=1800)  # 30 min cache for forecasts
ai_cache = TTLCache(maxsize=50, ttl=3600)  # 1 hour cache for AI summaries

# API Keys
WEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"  # Enable demo mode by default

# Configure Gemini
gemini_client = None
GEMINI_MODEL = "gemini-2.5-flash"
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)


def get_demo_weather(lat, lon, units):
    """Return mock weather data for demo purposes."""
    import random
    temp = random.randint(15, 25) if units == "metric" else random.randint(60, 80)
    conditions = ["clear sky", "few clouds", "scattered clouds", "light rain", "overcast clouds"]
    icons = ["01d", "02d", "03d", "10d", "04d"]
    idx = random.randint(0, 4)

    now = datetime.now(timezone.utc)
    sunrise = now.replace(hour=6, minute=30).timestamp()
    sunset = now.replace(hour=18, minute=30).timestamp()

    return {
        "coord": {"lon": float(lon), "lat": float(lat)},
        "weather": [{"description": conditions[idx], "icon": icons[idx]}],
        "main": {
            "temp": temp,
            "feels_like": temp - 2,
            "humidity": random.randint(40, 80),
            "pressure": random.randint(1010, 1025)
        },
        "wind": {"speed": random.randint(2, 10), "deg": random.randint(0, 360)},
        "clouds": {"all": random.randint(0, 100)},
        "visibility": 10000,
        "sys": {"sunrise": int(sunrise), "sunset": int(sunset)},
        "name": "Demo Location"
    }


def get_demo_forecast(lat, lon, units):
    """Return mock forecast data for demo purposes."""
    import random
    forecasts = []
    now = datetime.now(timezone.utc)
    conditions = ["clear sky", "few clouds", "scattered clouds", "light rain"]
    icons = ["01d", "02d", "03d", "10d"]

    for i in range(40):  # 5 days * 8 (3-hour intervals)
        dt = now + timedelta(hours=i * 3)
        idx = random.randint(0, 3)
        temp = random.randint(12, 28) if units == "metric" else random.randint(55, 85)
        forecasts.append({
            "dt": int(dt.timestamp()),
            "main": {
                "temp": temp,
                "feels_like": temp - 2,
                "humidity": random.randint(40, 80)
            },
            "weather": [{"description": conditions[idx], "icon": icons[idx]}],
            "pop": random.random() * 0.5
        })

    return {"list": forecasts, "city": {"name": "Demo Location"}}


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "weather_api": bool(WEATHER_API_KEY),
            "gemini_api": bool(GEMINI_API_KEY)
        }
    })


@app.route("/api/weather/current", methods=["GET"])
@limiter.limit("30 per minute")
def get_current_weather():
    """Get current weather for a location."""
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    units = request.args.get("units", "metric")

    if not lat or not lon:
        return jsonify({"error": "lat and lon parameters required"}), 400

    cache_key = f"current_{lat}_{lon}_{units}"
    if cache_key in weather_cache:
        return jsonify(weather_cache[cache_key])

    # Try real API first
    if WEATHER_API_KEY:
        try:
            response = requests.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": WEATHER_API_KEY,
                    "units": units
                },
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            weather_cache[cache_key] = data
            return jsonify(data)
        except requests.RequestException as e:
            # Fall through to demo mode if enabled
            if not DEMO_MODE:
                return jsonify({"error": str(e)}), 502

    # Return demo data
    if DEMO_MODE:
        data = get_demo_weather(lat, lon, units)
        weather_cache[cache_key] = data
        return jsonify(data)

    return jsonify({"error": "Weather API not configured"}), 503


@app.route("/api/weather/forecast", methods=["GET"])
@limiter.limit("20 per minute")
def get_forecast():
    """Get 5-day/3-hour forecast."""
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    units = request.args.get("units", "metric")

    if not lat or not lon:
        return jsonify({"error": "lat and lon parameters required"}), 400

    cache_key = f"forecast_{lat}_{lon}_{units}"
    if cache_key in forecast_cache:
        return jsonify(forecast_cache[cache_key])

    # Try real API first
    if WEATHER_API_KEY:
        try:
            response = requests.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": WEATHER_API_KEY,
                    "units": units
                },
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            forecast_cache[cache_key] = data
            return jsonify(data)
        except requests.RequestException:
            if not DEMO_MODE:
                return jsonify({"error": "Failed to fetch forecast"}), 502

    # Return demo data
    if DEMO_MODE:
        data = get_demo_forecast(lat, lon, units)
        forecast_cache[cache_key] = data
        return jsonify(data)

    return jsonify({"error": "Weather API not configured"}), 503


@app.route("/api/weather/onecall", methods=["GET"])
@limiter.limit("15 per minute")
def get_onecall():
    """Get comprehensive weather data (current, hourly, daily, alerts)."""
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    units = request.args.get("units", "metric")

    if not lat or not lon:
        return jsonify({"error": "lat and lon parameters required"}), 400

    cache_key = f"onecall_{lat}_{lon}_{units}"
    if cache_key in forecast_cache:
        return jsonify(forecast_cache[cache_key])

    try:
        response = requests.get(
            "https://api.openweathermap.org/data/3.0/onecall",
            params={
                "lat": lat,
                "lon": lon,
                "appid": WEATHER_API_KEY,
                "units": units,
                "exclude": "minutely"
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        forecast_cache[cache_key] = data
        return jsonify(data)
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 502


@app.route("/api/weather/air-quality", methods=["GET"])
@limiter.limit("20 per minute")
def get_air_quality():
    """Get air quality data."""
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not lat or not lon:
        return jsonify({"error": "lat and lon parameters required"}), 400

    cache_key = f"air_{lat}_{lon}"
    if cache_key in weather_cache:
        return jsonify(weather_cache[cache_key])

    try:
        response = requests.get(
            "https://api.openweathermap.org/data/2.5/air_pollution",
            params={
                "lat": lat,
                "lon": lon,
                "appid": WEATHER_API_KEY
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        weather_cache[cache_key] = data
        return jsonify(data)
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 502


@app.route("/api/geocode", methods=["GET"])
@limiter.limit("30 per minute")
def geocode():
    """Convert city name to coordinates."""
    query = request.args.get("q")

    if not query:
        return jsonify({"error": "q parameter required"}), 400

    try:
        response = requests.get(
            "https://api.openweathermap.org/geo/1.0/direct",
            params={
                "q": query,
                "limit": 5,
                "appid": WEATHER_API_KEY
            },
            timeout=10
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 502


@app.route("/api/ai/weather-summary", methods=["POST"])
@limiter.limit("10 per minute")
def get_weather_summary():
    """Generate AI weather summary using Gemini."""
    if not gemini_client:
        return jsonify({"error": "Gemini API not configured"}), 503

    data = request.get_json()
    # Support both 'weather' and 'current' keys for backwards compatibility
    weather_data = data.get("weather") or data.get("current")
    hourly_data = data.get("hourly", [])
    daily_data = data.get("daily", [])
    location_name = data.get("location", "Unknown")
    style = data.get("style", "friendly")

    if not weather_data:
        return jsonify({"error": "weather data required"}), 400

    cache_key = f"summary_{hash(str(weather_data))}_{style}"
    if cache_key in ai_cache:
        return jsonify({"summary": ai_cache[cache_key]})

    # Build hourly forecast text
    hourly_text = ""
    for h in hourly_data[:6]:
        if isinstance(h, dict):
            dt = datetime.fromtimestamp(h.get('dt', 0), tz=timezone.utc)
            hourly_text += f"- {dt.strftime('%H:%M')}: {h.get('temp', 'N/A')}°, {h.get('weather', [{}])[0].get('description', 'N/A')}, Rain: {int(h.get('pop', 0)*100)}%\n"

    # Build daily forecast text
    daily_text = ""
    for d in daily_data[:3]:
        if isinstance(d, dict):
            dt = datetime.fromtimestamp(d.get('dt', 0), tz=timezone.utc)
            temp = d.get('temp', {})
            daily_text += f"- {dt.strftime('%A')}: High {temp.get('max', 'N/A')}°, Low {temp.get('min', 'N/A')}°, {d.get('weather', [{}])[0].get('description', 'N/A')}\n"

    style_prompts = {
        "friendly": "Give a friendly, conversational weather summary. Be warm and helpful.",
        "scientific": "Give a scientific, detailed weather analysis with meteorological terms.",
        "eli5": "Explain the weather like I'm 5 years old. Use simple words and fun comparisons."
    }

    prompt = f"""
{style_prompts.get(style, style_prompts["friendly"])}

Based on this weather data, provide a helpful weather summary (3-4 sentences):

**Current conditions in {location_name}:**
- Temperature: {weather_data.get('temp', 'N/A')}°
- Feels like: {weather_data.get('feels_like', 'N/A')}°
- Conditions: {weather_data.get('description', 'N/A')}
- Humidity: {weather_data.get('humidity', 'N/A')}%
- Wind: {weather_data.get('wind_speed', 'N/A')} m/s

**Upcoming hours:**
{hourly_text or 'N/A'}

**Upcoming days:**
{daily_text or 'N/A'}

Include what to expect and any recommendations. Use **bold** for important points.
"""

    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
        summary = response.text
        ai_cache[cache_key] = summary
        return jsonify({"summary": summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@app.route("/api/ai/chat", methods=["POST"])
@limiter.limit("20 per minute")
def weather_chat():
    """Chat with AI about weather - answer questions about the current weather."""
    if not gemini_client:
        return jsonify({"error": "Gemini API not configured"}), 503

    data = request.get_json()
    message = data.get("message", "")
    weather_data = data.get("weather") or data.get("current")
    hourly_data = data.get("hourly", [])
    daily_data = data.get("daily", [])
    location_name = data.get("location", "Unknown")
    chat_history = data.get("history", [])

    if not message:
        return jsonify({"error": "message required"}), 400

    # Build context about current weather
    weather_context = f"""
Current weather in {location_name}:
- Temperature: {weather_data.get('temp', 'N/A') if weather_data else 'N/A'}°
- Feels like: {weather_data.get('feels_like', 'N/A') if weather_data else 'N/A'}°
- Conditions: {weather_data.get('description', 'N/A') if weather_data else 'N/A'}
- Humidity: {weather_data.get('humidity', 'N/A') if weather_data else 'N/A'}%
- Wind: {weather_data.get('wind_speed', 'N/A') if weather_data else 'N/A'} m/s
"""

    # Add hourly forecast context
    if hourly_data:
        weather_context += "\nUpcoming hours:\n"
        for h in hourly_data[:8]:
            if isinstance(h, dict):
                dt = datetime.fromtimestamp(h.get('dt', 0), tz=timezone.utc)
                weather_context += f"- {dt.strftime('%H:%M')}: {h.get('temp', 'N/A')}°, Rain: {int(h.get('pop', 0)*100)}%\n"

    # Add daily forecast context
    if daily_data:
        weather_context += "\nUpcoming days:\n"
        for d in daily_data[:5]:
            if isinstance(d, dict):
                dt = datetime.fromtimestamp(d.get('dt', 0), tz=timezone.utc)
                temp = d.get('temp', {})
                weather_context += f"- {dt.strftime('%A')}: High {temp.get('max', 'N/A')}°, Low {temp.get('min', 'N/A')}°\n"

    # Build conversation history
    conversation = ""
    for msg in chat_history[-6:]:  # Last 6 messages for context
        role = "User" if msg.get("role") == "user" else "Assistant"
        conversation += f"{role}: {msg.get('content', '')}\n"

    prompt = f"""You are a helpful weather assistant for an ambient clock display. Answer questions about the weather concisely and helpfully. Use **bold** for emphasis.

{weather_context}

{conversation}
User: {message}

Respond helpfully and concisely (2-3 sentences unless more detail is needed). If asked about something unrelated to weather, politely redirect to weather topics."""

    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@app.route("/api/ai/daily-briefing", methods=["POST"])
@limiter.limit("5 per minute")
def get_daily_briefing():
    """Generate comprehensive daily briefing."""
    if not gemini_client:
        return jsonify({"error": "Gemini API not configured"}), 503

    data = request.get_json()
    weather_data = data.get("weather")
    forecast_data = data.get("forecast", [])
    timezone = data.get("timezone", "UTC")

    if not weather_data:
        return jsonify({"error": "weather data required"}), 400

    forecast_text = ""
    for item in forecast_data[:8]:  # Next 24 hours
        forecast_text += f"- {item.get('time', 'N/A')}: {item.get('temp', 'N/A')}°, {item.get('description', 'N/A')}\n"

    prompt = f"""
You are an ambient display assistant. Generate a calming, helpful daily briefing.

Current Weather:
- Temperature: {weather_data.get('temp', 'N/A')}°
- Feels like: {weather_data.get('feels_like', 'N/A')}°
- Conditions: {weather_data.get('description', 'N/A')}
- Humidity: {weather_data.get('humidity', 'N/A')}%
- Sunrise: {weather_data.get('sunrise', 'N/A')}
- Sunset: {weather_data.get('sunset', 'N/A')}

Upcoming forecast:
{forecast_text}

Location: {weather_data.get('location', 'Unknown')}
Timezone: {timezone}

Provide a brief, calming daily briefing (3-4 sentences) that includes:
1. Current conditions summary
2. What to expect throughout the day
3. Any clothing or activity recommendations
"""

    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
        return jsonify({"briefing": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@app.route("/api/astronomy", methods=["GET"])
@limiter.limit("30 per minute")
def get_astronomy():
    """Calculate sun and moon data."""
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    if lat is None or lon is None:
        return jsonify({"error": "lat and lon parameters required"}), 400

    # Calculate sun position (simplified)
    now = datetime.now(timezone.utc)
    day_of_year = now.timetuple().tm_yday

    # Simplified sunrise/sunset calculation
    # This is approximate - production would use a proper astronomical library
    import math

    # Calculate solar declination
    declination = -23.45 * math.cos(math.radians(360/365 * (day_of_year + 10)))

    # Calculate day length
    lat_rad = math.radians(lat)
    dec_rad = math.radians(declination)

    try:
        hour_angle = math.degrees(math.acos(
            -math.tan(lat_rad) * math.tan(dec_rad)
        ))
        day_length = 2 * hour_angle / 15  # hours
    except ValueError:
        # Polar day or night
        day_length = 24 if lat * declination > 0 else 0

    # Moon phase calculation (simplified)
    # Synodic month is approximately 29.53 days
    # New moon reference: January 6, 2000
    reference_date = datetime(2000, 1, 6, tzinfo=timezone.utc)
    days_since = (now - reference_date).days
    moon_age = days_since % 29.53
    moon_phase = moon_age / 29.53

    phase_names = [
        "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
        "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
    ]
    phase_index = int((moon_phase * 8) % 8)

    return jsonify({
        "sun": {
            "declination": round(declination, 2),
            "day_length_hours": round(day_length, 2),
        },
        "moon": {
            "phase": round(moon_phase, 3),
            "age_days": round(moon_age, 1),
            "phase_name": phase_names[phase_index],
            "illumination": round(abs(math.cos(math.pi * moon_phase)) * 100 if moon_phase <= 0.5 else abs(math.cos(math.pi * (1 - moon_phase))) * 100, 1)
        }
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
