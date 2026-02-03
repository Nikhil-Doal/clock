'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sunrise, Sunset } from 'lucide-react';
import { useAppStore } from '@/store';
import { getMoonPhaseIcon } from '@/lib/utils';

export function AstronomyPanel() {
  const { astronomy, currentWeather, displaySettings } = useAppStore();

  if (!displaySettings.showAstronomy) return null;

  const sunrise = currentWeather?.sunrise
    ? new Date(currentWeather.sunrise * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  const sunset = currentWeather?.sunset
    ? new Date(currentWeather.sunset * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      {/* Sunrise */}
      {sunrise && (
        <div className="flex items-center gap-3 text-white/80">
          <Sunrise className="w-8 h-8 text-orange-400" />
          <span className="text-xl font-light">{sunrise}</span>
        </div>
      )}

      {/* Sun position indicator */}
      {sunrise && sunset && currentWeather && (
        <SunPositionIndicator
          sunrise={currentWeather.sunrise!}
          sunset={currentWeather.sunset!}
        />
      )}

      {/* Sunset */}
      {sunset && (
        <div className="flex items-center gap-3 text-white/80">
          <Sunset className="w-8 h-8 text-purple-400" />
          <span className="text-xl font-light">{sunset}</span>
        </div>
      )}

      {/* Moon phase */}
      {astronomy && (
        <div className="flex items-center gap-3 text-white/80">
          <span className="text-4xl">
            {getMoonPhaseIcon(astronomy.moon.phase)}
          </span>
          <div>
            <div className="text-xl font-light">{astronomy.moon.phase_name}</div>
            <div className="text-base text-white/50">
              {astronomy.moon.illumination}% illuminated
            </div>
          </div>
        </div>
      )}

      {/* Day length */}
      {astronomy && (
        <div className="text-white/80 text-xl font-light">
          <span className="text-white/50">Day: </span>
          {Math.floor(astronomy.sun.day_length_hours)}h{' '}
          {Math.round((astronomy.sun.day_length_hours % 1) * 60)}m
        </div>
      )}
    </motion.div>
  );
}

interface SunPositionIndicatorProps {
  sunrise: number;
  sunset: number;
}

function SunPositionIndicator({ sunrise, sunset }: SunPositionIndicatorProps) {
  const [now, setNow] = useState(() => Date.now() / 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now() / 1000);
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const dayLength = sunset - sunrise;
  const elapsed = now - sunrise;
  const progress = Math.max(0, Math.min(1, elapsed / dayLength));

  const isDay = now >= sunrise && now <= sunset;

  return (
    <div className="relative w-48 h-12">
      {/* Arc path */}
      <svg
        viewBox="0 0 100 50"
        className="w-full h-full"
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Background arc */}
        <path
          d="M 5 45 Q 50 0 95 45"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="3"
        />
        {/* Progress arc */}
        {isDay && (
          <path
            d="M 5 45 Q 50 0 95 45"
            fill="none"
            stroke="rgba(251,191,36,0.6)"
            strokeWidth="3"
            strokeDasharray={`${progress * 100} 100`}
          />
        )}
      </svg>
      {/* Sun position */}
      {isDay && (
        <motion.div
          className="absolute w-5 h-5 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
          style={{
            left: `${5 + progress * 90}%`,
            top: `${100 - Math.sin(progress * Math.PI) * 80}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
}
