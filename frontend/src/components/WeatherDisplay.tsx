'use client';

import { motion } from 'framer-motion';
import {
  Droplets,
  Wind,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { WeatherIcon } from './WeatherIcon';
import { formatTemperature, cn } from '@/lib/utils';

export function WeatherDisplay() {
  const { currentWeather, weatherSettings } = useAppStore();

  if (!currentWeather) return null;

  const tempUnit = weatherSettings.units;

  return (
    <motion.div
      className="flex items-center justify-center gap-12"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Weather icon and temp */}
      <div className="flex items-center gap-6">
        <WeatherIcon code={currentWeather.icon} size="xl" />
        <div>
          <div className="text-7xl sm:text-8xl font-light text-white">
            {formatTemperature(currentWeather.temp, tempUnit)}
          </div>
          {weatherSettings.showFeelsLike && (
            <div className="text-xl text-white/60">
              Feels like {formatTemperature(currentWeather.feels_like, tempUnit)}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="text-3xl sm:text-4xl text-white/80 capitalize font-light">
        {currentWeather.description}
      </div>

      {/* Key stats */}
      <div className="flex items-center gap-10 text-white/80">
        <div className="flex items-center gap-3">
          <Droplets className="w-8 h-8" />
          <span className="text-3xl font-light">{currentWeather.humidity}%</span>
        </div>
        <div className="flex items-center gap-3">
          <Wind className="w-8 h-8" />
          <span className="text-3xl font-light">{Math.round(currentWeather.wind_speed)} {tempUnit === 'fahrenheit' ? 'mph' : 'm/s'}</span>
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
