'use client';

import { motion } from 'framer-motion';

interface WeatherIconProps {
  code: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const sizeClasses = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
  xl: 'text-8xl',
};

export function WeatherIcon({ code, size = 'md', animated = true }: WeatherIconProps) {
  const iconCode = code?.slice(0, 2) || '01';
  const isDay = code?.endsWith('d');

  const getIcon = () => {
    switch (iconCode) {
      case '01': // Clear
        return isDay ? <SunIcon /> : <MoonIcon />;
      case '02': // Few clouds
        return isDay ? <PartlyCloudyIcon /> : <CloudyNightIcon />;
      case '03': // Scattered clouds
      case '04': // Broken/overcast
        return <CloudIcon />;
      case '09': // Shower rain
      case '10': // Rain
        return <RainIcon />;
      case '11': // Thunderstorm
        return <ThunderIcon />;
      case '13': // Snow
        return <SnowIcon />;
      case '50': // Mist/fog
        return <FogIcon />;
      default:
        return isDay ? <SunIcon /> : <MoonIcon />;
    }
  };

  return (
    <div className={sizeClasses[size]}>
      {animated ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {getIcon()}
        </motion.div>
      ) : (
        getIcon()
      )}
    </div>
  );
}

function SunIcon() {
  return (
    <motion.div
      className="relative"
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
    >
      <span className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
        ☀️
      </span>
    </motion.div>
  );
}

function MoonIcon() {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="text-blue-200 drop-shadow-[0_0_15px_rgba(191,219,254,0.5)]">
        🌙
      </span>
    </motion.div>
  );
}

function PartlyCloudyIcon() {
  return (
    <motion.div className="relative">
      <motion.span
        className="absolute -left-2 -top-2 text-yellow-400"
        style={{ fontSize: '0.6em' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        ☀️
      </motion.span>
      <span className="text-gray-300">☁️</span>
    </motion.div>
  );
}

function CloudyNightIcon() {
  return (
    <motion.div className="relative">
      <motion.span
        className="absolute -left-2 -top-2 text-blue-200"
        style={{ fontSize: '0.5em' }}
      >
        🌙
      </motion.span>
      <span className="text-gray-400">☁️</span>
    </motion.div>
  );
}

function CloudIcon() {
  return (
    <motion.div
      animate={{ x: [-2, 2, -2] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="text-gray-400">☁️</span>
    </motion.div>
  );
}

function RainIcon() {
  return (
    <motion.div className="relative">
      <span className="text-gray-400">🌧️</span>
      <motion.div
        className="absolute inset-0 flex justify-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.div>
  );
}

function ThunderIcon() {
  return (
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
    >
      <span className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]">
        ⛈️
      </span>
    </motion.div>
  );
}

function SnowIcon() {
  return (
    <motion.div
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="text-blue-200">❄️</span>
    </motion.div>
  );
}

function FogIcon() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="text-gray-400">🌫️</span>
    </motion.div>
  );
}
