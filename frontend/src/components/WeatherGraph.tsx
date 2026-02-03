'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, ChevronDown, ChevronUp, Thermometer, Droplets, Wind } from 'lucide-react';
import { useAppStore } from '@/store';

type DataType = 'temperature' | 'humidity' | 'wind';

export function WeatherGraph() {
  const { hourlyForecast, weatherSettings } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dataType, setDataType] = useState<DataType>('temperature');

  if (!hourlyForecast || hourlyForecast.length === 0) return null;

  // Prepare data for chart - showing available forecast data
  const chartData = hourlyForecast.slice(0, 24).map((item, index) => {
    const date = new Date(item.dt * 1000);
    const hours = date.getHours();
    const label = index === 0 ? 'Now' : `${hours}:00`;
    const isPast = index < 4; // First 4 entries are approximated as "past"

    return {
      time: label,
      temp: Math.round(item.temp),
      humidity: item.humidity,
      wind: Math.round((item as { wind_speed?: number }).wind_speed || 0),
      isPast,
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

  if (!isExpanded) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <TrendingUp className="w-4 h-4" />
        <span className="text-sm">Weather Trends</span>
        <ChevronDown className="w-4 h-4" />
      </motion.button>
    );
  }

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-white/70 text-sm font-medium">24-Hour Forecast</span>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 text-white/40 hover:text-white/60 transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>

      {/* Data type selector */}
      <div className="flex gap-2 px-5 py-3 border-b border-white/10">
        <DataButton
          icon={<Thermometer className="w-3.5 h-3.5" />}
          label="Temp"
          active={dataType === 'temperature'}
          onClick={() => setDataType('temperature')}
          color="text-orange-400"
        />
        <DataButton
          icon={<Droplets className="w-3.5 h-3.5" />}
          label="Humidity"
          active={dataType === 'humidity'}
          onClick={() => setDataType('humidity')}
          color="text-blue-400"
        />
        <DataButton
          icon={<Wind className="w-3.5 h-3.5" />}
          label="Wind"
          active={dataType === 'wind'}
          onClick={() => setDataType('wind')}
          color="text-green-400"
        />
      </div>

      {/* Chart */}
      <div className="p-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getColor()} stopOpacity={0.3} />
                <stop offset="95%" stopColor={getColor()} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
              }}
              formatter={(value) => [`${value ?? 0}${getUnit()}`, dataType]}
            />
            <Area
              type="monotone"
              dataKey={getDataKey()}
              stroke={getColor()}
              strokeWidth={2}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="px-5 pb-3 text-center text-white/40 text-xs">
        Forecast data for the next 24 hours
      </div>
    </motion.div>
  );
}

interface DataButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}

function DataButton({ icon, label, active, onClick, color }: DataButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
        active
          ? `bg-white/10 ${color}`
          : 'text-white/50 hover:text-white/70 hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
