'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { WeatherIcon } from './WeatherIcon';
import { formatTemperature } from '@/lib/utils';

export function DailyForecast() {
  const { dailyForecast, weatherSettings } = useAppStore();

  if (!weatherSettings.showDailyForecast || dailyForecast.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <h3 className="text-white/60 text-sm uppercase tracking-wide mb-4">
        7-Day Forecast
      </h3>
      <div className="space-y-2">
        {dailyForecast.map((day, index) => (
          <motion.div
            key={day.dt}
            className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="w-24 text-white/80">
              {index === 0
                ? 'Today'
                : new Date(day.dt * 1000).toLocaleDateString('en-US', {
                    weekday: 'short',
                  })}
            </div>
            <div className="flex items-center gap-2">
              <WeatherIcon
                code={day.weather[0].icon}
                size="sm"
                animated={false}
              />
              {day.pop > 0 && (
                <span className="text-blue-400 text-sm w-12">
                  {Math.round(day.pop * 100)}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white font-medium w-14 text-right">
                {formatTemperature(day.temp.max, weatherSettings.units)}
              </span>
              <span className="text-white/50 w-14 text-right">
                {formatTemperature(day.temp.min, weatherSettings.units)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
