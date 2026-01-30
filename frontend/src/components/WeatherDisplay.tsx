'use client';

import { motion } from 'framer-motion';
import {
  Droplets,
  Wind,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { WeatherIcon } from './WeatherIcon';
import { formatTemperature } from '@/lib/utils';

export function WeatherDisplay() {
  const { currentWeather, weatherSettings } = useAppStore();

  if (!currentWeather) return null;

  const tempUnit = weatherSettings.units;

  return (
    <motion.div
      className="flex items-center justify-center gap-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Weather icon and temp */}
      <div className="flex items-center gap-4">
        <WeatherIcon code={currentWeather.icon} size="lg" />
        <div>
          <div className="text-5xl font-light text-white">
            {formatTemperature(currentWeather.temp, tempUnit)}
          </div>
          {weatherSettings.showFeelsLike && (
            <div className="text-sm text-white/50">
              Feels like {formatTemperature(currentWeather.feels_like, tempUnit)}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="text-xl text-white/70 capitalize">
        {currentWeather.description}
      </div>

      {/* Key stats */}
      <div className="flex items-center gap-6 text-white/60">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          <span className="text-sm">{currentWeather.humidity}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4" />
          <span className="text-sm">{Math.round(currentWeather.wind_speed)} {tempUnit === 'fahrenheit' ? 'mph' : 'm/s'}</span>
        </div>
      </div>
    </motion.div>
  );
}

interface WeatherStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  subValueClass?: string;
}

function WeatherStat({
  icon,
  label,
  value,
  subValue,
  subValueClass,
}: WeatherStatProps) {
  return (
    <motion.div
      className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3"
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-white/60">{icon}</div>
      <div>
        <div className="text-white/50 text-xs uppercase tracking-wide">
          {label}
        </div>
        <div className="text-white font-medium">{value}</div>
        {subValue && (
          <div className={cn('text-xs', subValueClass || 'text-white/50')}>
            {subValue}
          </div>
        )}
      </div>
    </motion.div>
  );
}
