'use client';

import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';
import { useAppStore } from '@/store';
import { getAQILevel } from '@/lib/utils';

export function AirQualityDisplay() {
  const { airQuality, displaySettings } = useAppStore();

  if (!displaySettings.showAirQuality || !airQuality) return null;

  const { label, color } = getAQILevel(airQuality.aqi);

  return (
    <motion.div
      className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Wind className={`w-6 h-6 ${color}`} />
      <div>
        <div className="text-white/50 text-xs uppercase tracking-wide">Air Quality</div>
        <div className={`text-lg font-medium ${color}`}>{label}</div>
      </div>
      <div className="ml-2 text-white/40 text-sm">
        PM2.5: {airQuality.components.pm2_5?.toFixed(1) || 'N/A'}
      </div>
    </motion.div>
  );
}
