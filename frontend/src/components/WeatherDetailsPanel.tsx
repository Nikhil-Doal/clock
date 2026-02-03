'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Brain, Radar, ChevronDown, X } from 'lucide-react';
import { WeatherGraph } from './WeatherGraph';
import { WeatherRadar } from './WeatherRadar';
import { AISummary } from './AISummary';
import { useAppStore } from '@/store';

type Tab = 'graph' | 'radar' | 'ai';

export function WeatherDetailsPanel() {
  const { displaySettings, hourlyForecast } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('graph');

  if (!displaySettings.showWeather) return null;

  if (!isExpanded) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 transition-all border border-white/10"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <BarChart3 className="w-4 h-4" />
        <span className="text-sm font-medium">Weather Details</span>
        <ChevronDown className="w-4 h-4" />
      </motion.button>
    );
  }

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      {/* Header with tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-1">
          <TabButton
            icon={<BarChart3 className="w-4 h-4" />}
            label="Forecast"
            active={activeTab === 'graph'}
            onClick={() => setActiveTab('graph')}
          />
          <TabButton
            icon={<Radar className="w-4 h-4" />}
            label="Radar"
            active={activeTab === 'radar'}
            onClick={() => setActiveTab('radar')}
          />
          <TabButton
            icon={<Brain className="w-4 h-4" />}
            label="AI Summary"
            active={activeTab === 'ai'}
            onClick={() => setActiveTab('ai')}
          />
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 text-white/40 hover:text-white/60 hover:bg-white/10 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 min-h-[320px]">
        <AnimatePresence mode="wait">
          {activeTab === 'graph' && (
            <motion.div
              key="graph"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <WeatherGraphExpanded />
            </motion.div>
          )}
          {activeTab === 'radar' && (
            <motion.div
              key="radar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <WeatherRadarExpanded />
            </motion.div>
          )}
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <AISummaryExpanded />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ icon, label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-white/10 text-white'
          : 'text-white/50 hover:text-white/70 hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// Expanded version of WeatherGraph for the panel
function WeatherGraphExpanded() {
  const { hourlyForecast, weatherSettings } = useAppStore();
  const [dataType, setDataType] = useState<'temperature' | 'humidity' | 'wind'>('temperature');

  if (!hourlyForecast || hourlyForecast.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-white/40">
        No forecast data available
      </div>
    );
  }

  // Import recharts dynamically
  const { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } = require('recharts');

  const chartData = hourlyForecast.slice(0, 24).map((item, index) => {
    const date = new Date(item.dt * 1000);
    const hours = date.getHours();
    const label = index === 0 ? 'Now' : `${hours}:00`;

    return {
      time: label,
      temp: Math.round(item.temp),
      humidity: item.humidity,
      wind: Math.round((item as { wind_speed?: number }).wind_speed || 0),
    };
  });

  const getDataKey = () => {
    switch (dataType) {
      case 'temperature': return 'temp';
      case 'humidity': return 'humidity';
      case 'wind': return 'wind';
    }
  };

  const getUnit = () => {
    switch (dataType) {
      case 'temperature': return weatherSettings.units === 'fahrenheit' ? '°F' : '°C';
      case 'humidity': return '%';
      case 'wind': return weatherSettings.units === 'fahrenheit' ? 'mph' : 'm/s';
    }
  };

  const getColor = () => {
    switch (dataType) {
      case 'temperature': return '#f97316';
      case 'humidity': return '#3b82f6';
      case 'wind': return '#22c55e';
    }
  };

  return (
    <div>
      {/* Data type selector */}
      <div className="flex gap-2 mb-4">
        {(['temperature', 'humidity', 'wind'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setDataType(type)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              dataType === type
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorGradientExpanded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getColor()} stopOpacity={0.3} />
                <stop offset="95%" stopColor={getColor()} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.3)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
              }}
              formatter={(value: number) => [`${value}${getUnit()}`, dataType]}
            />
            <Area
              type="monotone"
              dataKey={getDataKey()}
              stroke={getColor()}
              strokeWidth={2}
              fill="url(#colorGradientExpanded)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center text-white/40 text-xs mt-2">
        24-hour forecast data
      </div>
    </div>
  );
}

// Expanded version of WeatherRadar for the panel
function WeatherRadarExpanded() {
  const { location } = useAppStore();
  const [radarFrames, setRadarFrames] = useState<{ time: number; path: string }[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch radar data
  useState(() => {
    if (!location) return;

    const fetchRadarData = async () => {
      try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await response.json();

        if (data.radar?.past) {
          const frames = [
            ...data.radar.past.map((f: { time: number; path: string }) => f),
            ...(data.radar?.nowcast || []).map((f: { time: number; path: string }) => f),
          ];
          setRadarFrames(frames);
          setCurrentFrame(frames.length - 1);
        }
      } catch (error) {
        console.error('Failed to fetch radar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRadarData();
  });

  // Animation loop
  useState(() => {
    if (!isPlaying || radarFrames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % radarFrames.length);
    }, 500);

    return () => clearInterval(interval);
  });

  if (!location) {
    return (
      <div className="h-64 flex items-center justify-center text-white/40">
        Location required for radar
      </div>
    );
  }

  // Calculate tile coordinates
  const zoom = 6;
  const x = Math.floor((location.lon + 180) / 360 * Math.pow(2, zoom));
  const y = Math.floor((1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));

  const currentTime = radarFrames[currentFrame]?.time
    ? new Date(radarFrames[currentFrame].time * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
              isPlaying ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-white/70'
            }`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          {currentTime && (
            <span className="text-white/50 text-sm">{currentTime}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-white/50">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500/70" />
            <span>Light</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500/70" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500/70" />
            <span>Heavy</span>
          </div>
        </div>
      </div>

      {/* Radar Map */}
      <div className="relative h-56 bg-slate-900/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/40">
            Loading radar...
          </div>
        ) : (
          <>
            {/* Base map */}
            <img
              src={`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`}
              alt="Map"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            {/* Radar overlay */}
            {radarFrames[currentFrame] && (
              <img
                src={`https://tilecache.rainviewer.com${radarFrames[currentFrame].path}/256/${zoom}/${x}/${y}/2/1_1.png`}
                alt="Radar"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ mixBlendMode: 'screen' }}
              />
            )}
            {/* Center marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg" />
            </div>
          </>
        )}
      </div>

      {/* Timeline slider */}
      {radarFrames.length > 0 && (
        <div className="mt-3">
          <input
            type="range"
            min="0"
            max={radarFrames.length - 1}
            value={currentFrame}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentFrame(parseInt(e.target.value));
            }}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-white/40 text-xs mt-1">
            <span>Past</span>
            <span>Now</span>
            <span>Forecast</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Expanded version of AI Summary for the panel
function AISummaryExpanded() {
  const { aiSummary, currentWeather, location, hourlyForecast, dailyForecast } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(aiSummary);

  const fetchSummary = async () => {
    if (!location || !currentWeather) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/weather-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current: currentWeather,
          hourly: hourlyForecast?.slice(0, 12),
          daily: dailyForecast?.slice(0, 5),
          location: location.name,
          style: 'friendly',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        useAppStore.getState().setAiSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch AI summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white/70">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="font-medium">AI Weather Analysis</span>
        </div>
        <button
          onClick={fetchSummary}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-white/5 rounded-xl p-4 min-h-[180px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-white/40">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        ) : summary ? (
          <p className="text-white/80 leading-relaxed">{summary}</p>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-white/40">
            <Brain className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Click refresh to generate AI weather analysis</p>
          </div>
        )}
      </div>

      <p className="text-white/40 text-xs text-center mt-3">
        Powered by Google Gemini AI
      </p>
    </div>
  );
}
