'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Globe } from 'lucide-react';
import { useAppStore } from '@/store';
import { TIMEZONES, formatTime } from '@/lib/utils';

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
            <div className="text-white/50 text-xs">{clock.label}</div>
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

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[200px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="text-white/60 text-sm mb-2">Select timezone</div>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
      >
        <option value="" className="bg-slate-800">
          Choose...
        </option>
        {TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value} className="bg-slate-800">
            {tz.label}
          </option>
        ))}
      </select>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onClose}
          className="flex-1 px-3 py-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (selected) {
              const tz = TIMEZONES.find((t) => t.value === selected);
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
