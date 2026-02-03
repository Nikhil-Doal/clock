'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Brain, Radar, X, Thermometer, Droplets, CloudRain, Wind, Send, Loader2, Sun, Eye } from 'lucide-react';
import { useAppStore } from '@/store';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Bar,
  Cell,
} from 'recharts';

type Tab = 'graph' | 'radar' | 'ai';

export function WeatherSidePanel() {
  const { displaySettings, updateDisplaySettings } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('graph');

  if (!displaySettings.showWeatherPanel) return null;

  return (
    <motion.div
      className="fixed right-0 top-0 bottom-0 w-[420px] bg-black/90 backdrop-blur-xl z-20 flex flex-col border-l border-white/10"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
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
            label="AI Chat"
            active={activeTab === 'ai'}
            onClick={() => setActiveTab('ai')}
          />
        </div>
        <button
          onClick={() => updateDisplaySettings({ showWeatherPanel: false })}
          className="p-2 text-white/40 hover:text-white/60 hover:bg-white/10 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'graph' && (
            <motion.div
              key="graph"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ForecastPanel />
            </motion.div>
          )}
          {activeTab === 'radar' && (
            <motion.div
              key="radar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <RadarPanel />
            </motion.div>
          )}
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              <AIChatPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TabButton({ icon, label, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
        active
          ? 'bg-white/10 text-white'
          : 'text-white/50 hover:text-white/70'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Generate simulated past data based on current weather
function generatePastData(currentWeather: any, hourlyForecast: any[]) {
  const now = Math.floor(Date.now() / 1000);
  const pastHours = [];

  const baseTemp = currentWeather?.temp || hourlyForecast[0]?.temp || 20;
  const baseHumidity = currentWeather?.humidity || hourlyForecast[0]?.humidity || 50;
  const basePop = hourlyForecast[0]?.pop || 0;
  const baseWind = currentWeather?.wind_speed || 5;
  const baseVisibility = currentWeather?.visibility || 10000;
  const basePressure = currentWeather?.pressure || 1013;

  for (let i = 6; i >= 1; i--) {
    const hourTime = now - (i * 3600);
    const hourOfDay = new Date(hourTime * 1000).getHours();
    const tempVariation = Math.sin((hourOfDay - 14) * Math.PI / 12) * 3;

    pastHours.push({
      dt: hourTime,
      temp: baseTemp + tempVariation + (Math.random() * 2 - 1),
      humidity: Math.max(20, Math.min(100, baseHumidity + (Math.random() * 10 - 5))),
      pop: Math.max(0, Math.min(1, basePop + (Math.random() * 0.2 - 0.1))),
      wind_speed: Math.max(0, baseWind + (Math.random() * 2 - 1)),
      visibility: Math.max(1000, baseVisibility + (Math.random() * 2000 - 1000)),
      pressure: basePressure + (Math.random() * 4 - 2),
      isPast: true,
    });
  }

  return pastHours;
}

// Custom dot component for temperature line
function TempDot(props: any) {
  const { cx, cy, payload } = props;
  if (payload?.isCurrent) {
    return <circle cx={cx} cy={cy} r={6} fill="#22c55e" stroke="#fff" strokeWidth={2} />;
  }
  return null;
}

// Forecast with multiple graphs
function ForecastPanel() {
  const { hourlyForecast, currentWeather, dailyForecast } = useAppStore();

  const chartData = useMemo(() => {
    if (!hourlyForecast || hourlyForecast.length === 0) return [];

    const now = Math.floor(Date.now() / 1000);
    const pastData = generatePastData(currentWeather, hourlyForecast);

    const currentData = {
      dt: now,
      temp: currentWeather?.temp || hourlyForecast[0]?.temp,
      humidity: currentWeather?.humidity || hourlyForecast[0]?.humidity,
      pop: hourlyForecast[0]?.pop || 0,
      wind_speed: currentWeather?.wind_speed || hourlyForecast[0]?.wind_speed || 0,
      visibility: currentWeather?.visibility || 10000,
      pressure: currentWeather?.pressure || 1013,
      uvi: currentWeather?.uvi || 0,
      isCurrent: true,
      isPast: false,
    };

    const futureData = hourlyForecast.slice(0, 18).map(h => ({
      ...h,
      isFuture: true,
      isPast: false,
    }));

    const allData = [...pastData, currentData, ...futureData];

    return allData.map((hour, index) => {
      const date = new Date(hour.dt * 1000);
      const hourNum = date.getHours();

      return {
        time: `${hourNum}:00`,
        hour: hourNum,
        temp: Math.round((hour.temp || 0) * 10) / 10,
        humidity: Math.round(hour.humidity || 0),
        pop: Math.round((hour.pop || 0) * 100),
        wind: Math.round((hour.wind_speed || 0) * 10) / 10,
        visibility: Math.round((hour.visibility || 10000) / 1000),
        pressure: Math.round(hour.pressure || 1013),
        isPast: hour.isPast || false,
        isCurrent: hour.isCurrent || false,
        index,
      };
    });
  }, [hourlyForecast, currentWeather]);

  if (!hourlyForecast || hourlyForecast.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-white/40">
        No forecast data available
      </div>
    );
  }

  const currentIndex = chartData.findIndex(d => d.isCurrent);
  const currentTime = chartData[currentIndex]?.time;

  const temps = chartData.map(d => d.temp);
  const minTemp = Math.floor(Math.min(...temps) - 2);
  const maxTemp = Math.ceil(Math.max(...temps) + 2);

  const winds = chartData.map(d => d.wind);
  const maxWind = Math.ceil(Math.max(...winds) + 1);

  return (
    <div className="h-full flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
      {/* Current Conditions Summary */}
      {currentWeather && (
        <div className="flex-shrink-0 grid grid-cols-4 gap-2 mb-1">
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <Thermometer className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <div className="text-white font-medium">{Math.round(currentWeather.temp)}°</div>
            <div className="text-white/40 text-xs">Now</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <Droplets className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-white font-medium">{currentWeather.humidity}%</div>
            <div className="text-white/40 text-xs">Humidity</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <Wind className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-white font-medium">{Math.round(currentWeather.wind_speed)}</div>
            <div className="text-white/40 text-xs">m/s</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <Eye className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <div className="text-white font-medium">{Math.round((currentWeather.visibility || 10000) / 1000)}</div>
            <div className="text-white/40 text-xs">km</div>
          </div>
        </div>
      )}

      {/* Temperature Line Chart - Gray for past, Orange for future */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Thermometer className="w-4 h-4 text-orange-400" />
          <span className="text-white/70 text-sm">Temperature</span>
          <span className="text-white/40 text-xs ml-auto">{minTemp}° - {maxTemp}°</span>
        </div>
        <div className="h-[110px] bg-white/5 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradientPast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="tempGradientFuture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={4} />
              <YAxis domain={[minTemp, maxTemp]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} tickFormatter={(v) => `${v}°`} width={35} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '12px' }} formatter={(value: number, name: string, props: any) => [`${value}°`, props.payload.isPast ? 'Past' : 'Forecast']} />
              {currentTime && <ReferenceLine x={currentTime} stroke="#22c55e" strokeWidth={2} strokeDasharray="4 4" />}
              <Area type="monotone" dataKey="temp" stroke="none" fill="url(#tempGradientFuture)" />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#f97316"
                strokeWidth={2}
                dot={TempDot}
                activeDot={{ r: 3, fill: '#f97316' }}
                strokeDasharray={(d: any) => d?.isPast ? "4 4" : "0"}
              />
              {/* Overlay gray line for past data */}
              <Line
                type="monotone"
                dataKey={(d: any) => d.isPast ? d.temp : null}
                stroke="#6b7280"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rain Chance - Bars with gray for past */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <CloudRain className="w-4 h-4 text-blue-400" />
          <span className="text-white/70 text-sm">Precipitation Chance</span>
        </div>
        <div className="h-[80px] bg-white/5 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={4} />
              <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} tickFormatter={(v) => `${v}%`} width={35} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '12px' }} formatter={(value: number) => [`${value}%`, 'Rain']} />
              {currentTime && <ReferenceLine x={currentTime} stroke="#22c55e" strokeWidth={2} strokeDasharray="4 4" />}
              <Bar dataKey="pop" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isPast ? '#6b7280' : '#3b82f6'} fillOpacity={entry.isPast ? 0.5 : 0.7} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Humidity Line */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Droplets className="w-4 h-4 text-cyan-400" />
          <span className="text-white/70 text-sm">Humidity</span>
        </div>
        <div className="h-[70px] bg-white/5 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={4} />
              <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} tickFormatter={(v) => `${v}%`} width={35} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '12px' }} formatter={(value: number) => [`${value}%`, 'Humidity']} />
              {currentTime && <ReferenceLine x={currentTime} stroke="#22c55e" strokeWidth={2} strokeDasharray="4 4" />}
              {/* Gray for past */}
              <Line type="monotone" dataKey={(d: any) => d.isPast ? d.humidity : null} stroke="#6b7280" strokeWidth={2} dot={false} />
              {/* Cyan for future */}
              <Line type="monotone" dataKey={(d: any) => !d.isPast ? d.humidity : null} stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Wind Speed */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Wind className="w-4 h-4 text-emerald-400" />
          <span className="text-white/70 text-sm">Wind Speed</span>
        </div>
        <div className="h-[70px] bg-white/5 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} interval={4} />
              <YAxis domain={[0, maxWind]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} tickFormatter={(v) => `${v}`} width={35} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '12px' }} formatter={(value: number) => [`${value} m/s`, 'Wind']} />
              {currentTime && <ReferenceLine x={currentTime} stroke="#22c55e" strokeWidth={2} strokeDasharray="4 4" />}
              <Line type="monotone" dataKey={(d: any) => d.isPast ? d.wind : null} stroke="#6b7280" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={(d: any) => !d.isPast ? d.wind : null} stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5-Day Outlook */}
      {dailyForecast && dailyForecast.length > 0 && (
        <div className="flex-shrink-0">
          <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">5-Day Outlook</h4>
          <div className="grid grid-cols-5 gap-1.5">
            {dailyForecast.slice(0, 5).map((day: any, i: number) => {
              const date = new Date(day.dt * 1000);
              const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' });
              const temp = day.temp || {};
              return (
                <div key={i} className="bg-white/5 rounded-lg p-2 text-center">
                  <div className="text-white/60 text-xs mb-1">{dayName}</div>
                  <div className="text-orange-400 font-semibold text-sm">{Math.round(temp.max || 0)}°</div>
                  <div className="text-blue-400 text-xs">{Math.round(temp.min || 0)}°</div>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    <CloudRain className="w-3 h-3 text-blue-300" />
                    <span className="text-blue-300 text-xs">{Math.round((day.pop || 0) * 100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-white/50 flex-shrink-0 pt-1 pb-1">
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 bg-gray-500" />
          <span>Past</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white" />
          <span>Now</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-0.5 bg-orange-500" />
          <span>Forecast</span>
        </div>
      </div>
    </div>
  );
}

// Radar using Windy embed
function RadarPanel() {
  const { location } = useAppStore();

  if (!location) {
    return (
      <div className="h-full flex items-center justify-center text-white/40">
        Location required for radar
      </div>
    );
  }

  const windyUrl = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=m/s&zoom=7&overlay=radar&product=radar&level=surface&lat=${location.lat}&lon=${location.lon}&detailLat=${location.lat}&detailLon=${location.lon}&marker=true&message=true`;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-white text-sm font-medium mb-3 flex-shrink-0">Live Weather Radar</h3>

      <div className="flex-1 rounded-xl overflow-hidden border border-white/10 min-h-0">
        <iframe
          src={windyUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="fullscreen"
          className="bg-slate-900"
          title="Weather Radar"
        />
      </div>

      <p className="text-white/40 text-xs text-center mt-3 flex-shrink-0">
        Powered by Windy.com
      </p>
    </div>
  );
}

// Simple markdown parser
function formatMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((para, pIndex) => {
    const lines = para.split('\n');
    const formattedLines = lines.map((line, lIndex) => {
      const parts: React.ReactNode[] = [];
      let remaining = line;
      let keyIndex = 0;

      while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        if (boldMatch && boldMatch.index !== undefined) {
          if (boldMatch.index > 0) parts.push(remaining.slice(0, boldMatch.index));
          parts.push(<strong key={`b-${pIndex}-${lIndex}-${keyIndex++}`} className="font-semibold text-white">{boldMatch[1]}</strong>);
          remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        } else {
          parts.push(remaining);
          remaining = '';
        }
      }

      return <span key={lIndex}>{parts}{lIndex < lines.length - 1 && <br />}</span>;
    });

    return <p key={pIndex} className="mb-2 last:mb-0">{formattedLines}</p>;
  });
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Suggested prompts for the AI
const SUGGESTED_PROMPTS = [
  "Should I bring an umbrella today?",
  "What should I wear?",
  "Is it good for outdoor activities?",
  "Will it rain this week?",
  "How's the air quality?",
  "Best time to go for a walk?",
  "Is it safe to drive?",
  "Should I water my plants?",
  "Good day for laundry?",
  "UV protection needed?",
  "Will there be a storm?",
  "Is it allergy weather?",
];

function AIChatPanel() {
  const { currentWeather, location, hourlyForecast, dailyForecast } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayedPrompts, setDisplayedPrompts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Shuffle and pick random prompts
  const refreshPrompts = useCallback(() => {
    const shuffled = [...SUGGESTED_PROMPTS].sort(() => Math.random() - 0.5);
    setDisplayedPrompts(shuffled.slice(0, 4));
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    refreshPrompts();
  }, [refreshPrompts]);

  // Auto-generate initial summary when panel opens
  useEffect(() => {
    if (messages.length === 0 && currentWeather && location) {
      generateSummary();
    }
  }, [currentWeather, location]);

  const generateSummary = async () => {
    if (!location || !currentWeather) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/weather-summary', {
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
        setMessages([{ role: 'assistant', content: data.summary }]);
      } else {
        setMessages([{ role: 'assistant', content: `Hello! I'm your weather assistant for ${location.name}. The current temperature is ${Math.round(currentWeather.temp)}° with ${currentWeather.description}. Ask me anything about the weather!` }]);
      }
    } catch {
      setMessages([{ role: 'assistant', content: `Hello! I'm your weather assistant for ${location?.name || 'your area'}. Ask me anything about the weather!` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);
    refreshPrompts();

    try {
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          current: currentWeather,
          hourly: hourlyForecast?.slice(0, 12),
          daily: dailyForecast?.slice(0, 5),
          location: location?.name,
          history: messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that request. Please try again.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I\'m having trouble connecting. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-white text-sm font-medium">Weather Assistant</h3>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); generateSummary(); refreshPrompts(); }}
            className="text-white/40 hover:text-white/60 text-xs"
          >
            Reset
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-0">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <Brain className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm text-center">Loading weather insights...</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-purple-500/30 text-white'
                  : 'bg-white/10 text-white/90'
              }`}
            >
              {msg.role === 'assistant' ? formatMarkdown(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions - always show when not loading */}
      {!isLoading && (
        <div className="flex flex-wrap gap-1.5 mb-3 flex-shrink-0">
          {displayedPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="text-xs bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 px-2 py-1 rounded-lg transition-colors"
            >
              {q}
            </button>
          ))}
          <button
            onClick={refreshPrompts}
            className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-2 py-1 rounded-lg transition-colors"
          >
            More...
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about the weather..."
          className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
          className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <p className="text-white/30 text-xs text-center mt-2 flex-shrink-0">
        Powered by Gemini AI
      </p>
    </div>
  );
}
