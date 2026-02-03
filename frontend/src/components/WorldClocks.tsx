'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Globe, Sun, Moon, CloudSun, CloudMoon } from 'lucide-react';
import { useAppStore } from '@/store';
import { formatTime } from '@/lib/utils';

// Complete list of timezones
const ALL_TIMEZONES = [
  // Americas
  { value: 'America/New_York', label: 'New York (EST)', region: 'Americas' },
  { value: 'America/Chicago', label: 'Chicago (CST)', region: 'Americas' },
  { value: 'America/Denver', label: 'Denver (MST)', region: 'Americas' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)', region: 'Americas' },
  { value: 'America/Anchorage', label: 'Anchorage (AKST)', region: 'Americas' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (HST)', region: 'Americas' },
  { value: 'America/Toronto', label: 'Toronto (EST)', region: 'Americas' },
  { value: 'America/Vancouver', label: 'Vancouver (PST)', region: 'Americas' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST)', region: 'Americas' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', region: 'Americas' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)', region: 'Americas' },
  { value: 'America/Lima', label: 'Lima (PET)', region: 'Americas' },
  { value: 'America/Bogota', label: 'Bogotá (COT)', region: 'Americas' },
  { value: 'America/Santiago', label: 'Santiago (CLT)', region: 'Americas' },
  { value: 'America/Caracas', label: 'Caracas (VET)', region: 'Americas' },
  { value: 'America/Halifax', label: 'Halifax (AST)', region: 'Americas' },
  { value: 'America/Phoenix', label: 'Phoenix (MST)', region: 'Americas' },
  // Europe
  { value: 'Europe/London', label: 'London (GMT)', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris (CET)', region: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', region: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome (CET)', region: 'Europe' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)', region: 'Europe' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET)', region: 'Europe' },
  { value: 'Europe/Brussels', label: 'Brussels (CET)', region: 'Europe' },
  { value: 'Europe/Vienna', label: 'Vienna (CET)', region: 'Europe' },
  { value: 'Europe/Zurich', label: 'Zurich (CET)', region: 'Europe' },
  { value: 'Europe/Stockholm', label: 'Stockholm (CET)', region: 'Europe' },
  { value: 'Europe/Oslo', label: 'Oslo (CET)', region: 'Europe' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen (CET)', region: 'Europe' },
  { value: 'Europe/Helsinki', label: 'Helsinki (EET)', region: 'Europe' },
  { value: 'Europe/Warsaw', label: 'Warsaw (CET)', region: 'Europe' },
  { value: 'Europe/Prague', label: 'Prague (CET)', region: 'Europe' },
  { value: 'Europe/Budapest', label: 'Budapest (CET)', region: 'Europe' },
  { value: 'Europe/Athens', label: 'Athens (EET)', region: 'Europe' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', region: 'Europe' },
  { value: 'Europe/Istanbul', label: 'Istanbul (TRT)', region: 'Europe' },
  { value: 'Europe/Lisbon', label: 'Lisbon (WET)', region: 'Europe' },
  { value: 'Europe/Dublin', label: 'Dublin (GMT)', region: 'Europe' },
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST)', region: 'Asia' },
  { value: 'Asia/Kolkata', label: 'Mumbai/Delhi (IST)', region: 'Asia' },
  { value: 'Asia/Shanghai', label: 'Shanghai/Beijing (CST)', region: 'Asia' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', region: 'Asia' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', region: 'Asia' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', region: 'Asia' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', region: 'Asia' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', region: 'Asia' },
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB)', region: 'Asia' },
  { value: 'Asia/Manila', label: 'Manila (PHT)', region: 'Asia' },
  { value: 'Asia/Taipei', label: 'Taipei (CST)', region: 'Asia' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (MYT)', region: 'Asia' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh (ICT)', region: 'Asia' },
  { value: 'Asia/Karachi', label: 'Karachi (PKT)', region: 'Asia' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)', region: 'Asia' },
  { value: 'Asia/Tehran', label: 'Tehran (IRST)', region: 'Asia' },
  { value: 'Asia/Baghdad', label: 'Baghdad (AST)', region: 'Asia' },
  { value: 'Asia/Riyadh', label: 'Riyadh (AST)', region: 'Asia' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem (IST)', region: 'Asia' },
  { value: 'Asia/Kathmandu', label: 'Kathmandu (NPT)', region: 'Asia' },
  { value: 'Asia/Yangon', label: 'Yangon (MMT)', region: 'Asia' },
  // Oceania
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', region: 'Oceania' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST)', region: 'Oceania' },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST)', region: 'Oceania' },
  { value: 'Australia/Perth', label: 'Perth (AWST)', region: 'Oceania' },
  { value: 'Australia/Adelaide', label: 'Adelaide (ACST)', region: 'Oceania' },
  { value: 'Australia/Darwin', label: 'Darwin (ACST)', region: 'Oceania' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)', region: 'Oceania' },
  { value: 'Pacific/Fiji', label: 'Fiji (FJT)', region: 'Oceania' },
  { value: 'Pacific/Guam', label: 'Guam (ChST)', region: 'Oceania' },
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo (EET)', region: 'Africa' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', region: 'Africa' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)', region: 'Africa' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)', region: 'Africa' },
  { value: 'Africa/Casablanca', label: 'Casablanca (WET)', region: 'Africa' },
  { value: 'Africa/Algiers', label: 'Algiers (CET)', region: 'Africa' },
  // UTC
  { value: 'UTC', label: 'UTC', region: 'UTC' },
];

// Get hour in a timezone
function getHourInTimezone(timezone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    });
    return parseInt(formatter.format(new Date()));
  } catch {
    return new Date().getHours();
  }
}

// Get time-based weather icon
function getTimeIcon(timezone: string) {
  const hour = getHourInTimezone(timezone);
  const isNight = hour < 6 || hour >= 20;
  const isDawn = hour >= 6 && hour < 8;
  const isDusk = hour >= 18 && hour < 20;

  if (isNight) {
    return <Moon className="w-4 h-4 text-indigo-300" />;
  }
  if (isDawn || isDusk) {
    return <CloudSun className="w-4 h-4 text-orange-400" />;
  }
  return <Sun className="w-4 h-4 text-yellow-400" />;
}

export function WorldClocks() {
  const { worldClocks, addWorldClock, removeWorldClock, clockSettings } =
    useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (worldClocks.length === 0 && !showAdd) {
    return (
      <motion.button
        onClick={() => setShowAdd(true)}
        className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Globe className="w-4 h-4" />
        <span>Add world clock</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence>
        {worldClocks.map((clock) => (
          <motion.div
            key={clock.id}
            className="group relative bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <button
              onClick={() => removeWorldClock(clock.id)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-white" />
            </button>
            <div className="flex items-center gap-2">
              {getTimeIcon(clock.timezone)}
              <div className="text-white/50 text-xs">{clock.label}</div>
            </div>
            <div className="text-white text-lg font-mono">
              {formatTime(time, clockSettings.timeFormat, false, clock.timezone)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {showAdd ? (
        <AddClockModal
          onAdd={(tz, label) => {
            addWorldClock({
              id: `clock-${Date.now()}`,
              timezone: tz,
              label,
            });
            setShowAdd(false);
          }}
          onClose={() => setShowAdd(false)}
        />
      ) : (
        <motion.button
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 hover:text-white/60 hover:bg-white/10 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      )}
    </motion.div>
  );
}

interface AddClockModalProps {
  onAdd: (timezone: string, label: string) => void;
  onClose: () => void;
}

function AddClockModal({ onAdd, onClose }: AddClockModalProps) {
  const [selected, setSelected] = useState('');
  const [filter, setFilter] = useState('');

  const filteredTimezones = ALL_TIMEZONES.filter(
    (tz) =>
      tz.label.toLowerCase().includes(filter.toLowerCase()) ||
      tz.value.toLowerCase().includes(filter.toLowerCase())
  );

  const groupedTimezones = filteredTimezones.reduce(
    (acc, tz) => {
      if (!acc[tz.region]) acc[tz.region] = [];
      acc[tz.region].push(tz);
      return acc;
    },
    {} as Record<string, typeof ALL_TIMEZONES>
  );

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[280px] max-h-[400px] flex flex-col"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="text-white/60 text-sm mb-2">Select timezone</div>
      <input
        type="text"
        placeholder="Search timezones..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20 mb-2 placeholder-white/30"
      />
      <div className="flex-1 overflow-y-auto max-h-[200px] mb-3">
        {Object.entries(groupedTimezones).map(([region, tzs]) => (
          <div key={region}>
            <div className="text-white/40 text-xs uppercase tracking-wide py-1 sticky top-0 bg-white/5">
              {region}
            </div>
            {tzs.map((tz) => (
              <button
                key={tz.value}
                onClick={() => setSelected(tz.value)}
                className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                  selected === tz.value
                    ? 'bg-blue-500/30 text-white'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                {tz.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (selected) {
              const tz = ALL_TIMEZONES.find((t) => t.value === selected);
              onAdd(selected, tz?.label || selected);
            }
          }}
          disabled={!selected}
          className="flex-1 px-3 py-1.5 text-sm bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </motion.div>
  );
}
