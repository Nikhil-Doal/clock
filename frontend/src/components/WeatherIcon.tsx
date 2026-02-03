'use client';

import { motion } from 'framer-motion';

interface WeatherIconProps {
  code: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
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
          className="w-full h-full"
        >
          {getIcon()}
        </motion.div>
      ) : (
        getIcon()
      )}
    </div>
  );
}

// Realistic Sun Icon
function SunIcon() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
    >
      {/* Sun rays */}
      {[...Array(12)].map((_, i) => (
        <motion.line
          key={i}
          x1="50"
          y1="10"
          x2="50"
          y2="20"
          stroke="#FCD34D"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transformOrigin: '50px 50px', transform: `rotate(${i * 30}deg)` }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
      {/* Sun body */}
      <circle cx="50" cy="50" r="22" fill="url(#sunGradient)" />
      <defs>
        <radialGradient id="sunGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="50%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>
    </motion.svg>
  );
}

// Realistic Moon Icon
function MoonIcon() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Moon glow */}
      <circle cx="50" cy="50" r="35" fill="url(#moonGlow)" opacity="0.3" />
      {/* Moon body */}
      <circle cx="50" cy="50" r="25" fill="url(#moonGradient)" />
      {/* Moon craters */}
      <circle cx="40" cy="42" r="4" fill="#94A3B8" opacity="0.3" />
      <circle cx="55" cy="55" r="3" fill="#94A3B8" opacity="0.3" />
      <circle cx="48" cy="60" r="2" fill="#94A3B8" opacity="0.2" />
      <defs>
        <radialGradient id="moonGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </radialGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </motion.svg>
  );
}

// Partly Cloudy Icon
function PartlyCloudyIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Small sun behind */}
      <g transform="translate(-5, -10) scale(0.5)">
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="15"
            x2="50"
            y2="25"
            stroke="#FCD34D"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ transformOrigin: '50px 50px', transform: `rotate(${i * 45}deg)` }}
          />
        ))}
        <circle cx="50" cy="50" r="18" fill="url(#sunGradient2)" />
      </g>
      {/* Cloud */}
      <g transform="translate(10, 20)">
        <ellipse cx="55" cy="55" rx="30" ry="20" fill="#E2E8F0" />
        <ellipse cx="35" cy="55" rx="22" ry="18" fill="#F1F5F9" />
        <ellipse cx="65" cy="50" rx="18" ry="15" fill="#F8FAFC" />
        <ellipse cx="45" cy="45" rx="20" ry="16" fill="#FFFFFF" />
      </g>
      <defs>
        <radialGradient id="sunGradient2" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Cloudy Night Icon
function CloudyNightIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Moon behind */}
      <circle cx="25" cy="25" r="15" fill="url(#moonGradient2)" />
      {/* Cloud */}
      <g transform="translate(10, 20)">
        <ellipse cx="55" cy="55" rx="30" ry="20" fill="#64748B" />
        <ellipse cx="35" cy="55" rx="22" ry="18" fill="#94A3B8" />
        <ellipse cx="65" cy="50" rx="18" ry="15" fill="#94A3B8" />
        <ellipse cx="45" cy="45" rx="20" ry="16" fill="#CBD5E1" />
      </g>
      <defs>
        <radialGradient id="moonGradient2" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Cloud Icon
function CloudIcon() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      animate={{ x: [-2, 2, -2] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ellipse cx="60" cy="60" rx="32" ry="22" fill="#94A3B8" />
      <ellipse cx="38" cy="60" rx="25" ry="20" fill="#CBD5E1" />
      <ellipse cx="70" cy="52" rx="20" ry="16" fill="#CBD5E1" />
      <ellipse cx="50" cy="48" rx="24" ry="18" fill="#E2E8F0" />
      <ellipse cx="55" cy="55" rx="28" ry="18" fill="#F1F5F9" />
    </motion.svg>
  );
}

// Rain Icon
function RainIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Cloud */}
      <ellipse cx="55" cy="35" rx="28" ry="18" fill="#64748B" />
      <ellipse cx="35" cy="35" rx="22" ry="15" fill="#94A3B8" />
      <ellipse cx="65" cy="30" rx="16" ry="13" fill="#94A3B8" />
      <ellipse cx="48" cy="28" rx="20" ry="14" fill="#CBD5E1" />
      {/* Rain drops */}
      {[25, 40, 55, 70].map((x, i) => (
        <motion.line
          key={i}
          x1={x}
          y1="55"
          x2={x - 5}
          y2="75"
          stroke="#60A5FA"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </svg>
  );
}

// Thunder Icon
function ThunderIcon() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
    >
      {/* Dark cloud */}
      <ellipse cx="55" cy="32" rx="28" ry="18" fill="#475569" />
      <ellipse cx="35" cy="32" rx="22" ry="15" fill="#64748B" />
      <ellipse cx="65" cy="27" rx="16" ry="13" fill="#64748B" />
      <ellipse cx="48" cy="25" rx="20" ry="14" fill="#94A3B8" />
      {/* Lightning bolt */}
      <motion.path
        d="M50 45 L42 60 L50 60 L45 80 L60 55 L52 55 L58 45 Z"
        fill="#FCD34D"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
      />
    </motion.svg>
  );
}

// Snow Icon
function SnowIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Cloud */}
      <ellipse cx="55" cy="30" rx="28" ry="18" fill="#94A3B8" />
      <ellipse cx="35" cy="30" rx="22" ry="15" fill="#CBD5E1" />
      <ellipse cx="65" cy="25" rx="16" ry="13" fill="#CBD5E1" />
      <ellipse cx="48" cy="22" rx="20" ry="14" fill="#E2E8F0" />
      {/* Snowflakes */}
      {[
        { x: 30, y: 55, delay: 0 },
        { x: 45, y: 65, delay: 0.3 },
        { x: 60, y: 55, delay: 0.6 },
        { x: 75, y: 70, delay: 0.9 },
        { x: 35, y: 75, delay: 1.2 },
        { x: 55, y: 80, delay: 1.5 },
      ].map((flake, i) => (
        <motion.g
          key={i}
          animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: flake.delay }}
        >
          <circle cx={flake.x} cy={flake.y} r="3" fill="#E2E8F0" />
        </motion.g>
      ))}
    </svg>
  );
}

// Fog Icon
function FogIcon() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {[25, 40, 55, 70].map((y, i) => (
        <motion.rect
          key={i}
          x={10 + i * 5}
          y={y}
          width={80 - i * 10}
          height="8"
          rx="4"
          fill={`rgba(148, 163, 184, ${0.4 + i * 0.15})`}
          animate={{ x: [-3, 3, -3] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </motion.svg>
  );
}
