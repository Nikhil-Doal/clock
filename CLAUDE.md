# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ambient Clock is a production-ready ambient clock/weather dashboard application designed to run continuously on displays. It features a massive digital clock with weather integration, AI-powered summaries, and various ambient features.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- **Backend:** Flask (Python 3.13)
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Charts:** Recharts

## Quick Start

**Both servers must be running for the app to work.**

```powershell
# Option 1: Use the start script
.\start.ps1

# Option 2: Manual start (two terminal windows)
# Terminal 1 - Backend:
.\.venv\Scripts\Activate.ps1
python backend/app.py

# Terminal 2 - Frontend:
cd frontend
npm run dev
```

Then open http://localhost:3000 in your browser.

## Development Commands

### Backend (Flask)
```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt

# Run development server
python backend/app.py

# Or with gunicorn (production)
gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
```

### Frontend (Next.js)
```powershell
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Frontend Structure (`/frontend`)
- `app/` - Next.js App Router pages and layouts
- `src/components/` - React components (Clock, Weather, Settings, etc.)
- `src/store/` - Zustand store for global state management
- `src/hooks/` - Custom React hooks (useWeather, useClock, useGeolocation)
- `src/lib/` - Utilities and API client
- `src/types/` - TypeScript type definitions

### Backend Structure (`/backend`)
- `app.py` - Flask application with REST API endpoints
- `requirements.txt` - Python dependencies

### API Endpoints
- `GET /api/health` - Health check
- `GET /api/weather/current` - Current weather (requires lat, lon)
- `GET /api/weather/forecast` - 5-day forecast
- `GET /api/weather/onecall` - Comprehensive weather data
- `GET /api/weather/air-quality` - Air quality data
- `GET /api/geocode` - City name to coordinates
- `GET /api/astronomy` - Sun/moon calculations
- `POST /api/ai/weather-summary` - AI weather summary
- `POST /api/ai/daily-briefing` - AI daily briefing

## Environment Variables

Copy `.env.example` to `.env` (backend) and `frontend/.env.local.example` to `frontend/.env.local`.

Required:
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key

Optional:
- `GEMINI_API_KEY` - Google Gemini API key for AI features
- `PORT` - Backend server port (default: 5000)
- `NEXT_PUBLIC_API_URL` - Backend URL for frontend (default: http://localhost:5000)

## Key Features

1. **Clock** - Massive digital clock with customizable fonts, 12/24h format, glow effects
2. **Weather** - Current conditions, hourly/daily forecasts, alerts
3. **AI Summaries** - Gemini-powered weather descriptions (friendly, scientific, ELI5)
4. **Astronomy** - Sun position tracker, moon phases, day length
5. **World Clocks** - Multiple timezone support
6. **Focus Mode** - Distraction-free clock-only view
7. **Auto-Dim** - Automatic brightness reduction at night
8. **Burn-in Prevention** - Subtle position shifting for OLED displays
9. **Pomodoro Timer** - Built-in focus/break timer
10. **Ambient Sounds** - Rain, wind, waves, etc.
11. **Breathing Exercise** - Guided breathing animation
12. **Daily Quotes** - Inspirational quotes

## Keyboard Shortcuts

- `S` - Toggle settings panel
- `F` - Toggle focus mode
- `Esc` - Close settings/exit focus mode
