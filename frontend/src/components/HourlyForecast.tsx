'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { WeatherIcon } from './WeatherIcon';
import { formatTemperature } from '@/lib/utils';

export function HourlyForecast() {
  const { hourlyForecast, weatherSettings } = useAppStore();

  if (!weatherSettings.showHourlyForecast || hourlyForecast.length === 0) {
    return null;
  }

  const displayForecast = hourlyForecast.slice(0, 12);

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h3 className="text-white/60 text-sm uppercase tracking-wide mb-4">
        Next 12 Hours
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {displayForecast.map((hour, index) => (
          <motion.div
            key={hour.dt}
            className="flex flex-col items-center min-w-[70px] bg-white/5 backdrop-blur-sm rounded-xl p-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="text-white/60 text-sm">
              {new Date(hour.dt * 1000).toLocaleTimeString('en-US', {
                hour: 'numeric',
                hour12: true,
              })}
            </div>
            <WeatherIcon code={hour.weather[0].icon} size="sm" animated={false} />
            <div className="text-white font-medium">
              {formatTemperature(hour.temp, weatherSettings.units)}
            </div>
            {hour.pop > 0 && (
              <div className="text-blue-400 text-xs mt-1">
                {Math.round(hour.pop * 100)}%
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
