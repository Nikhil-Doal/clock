'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, X } from 'lucide-react';

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASE_DURATIONS: Record<BreathPhase, number> = {
  inhale: 4000,
  hold: 4000,
  exhale: 4000,
  rest: 2000,
};

const PHASE_INSTRUCTIONS: Record<BreathPhase, string> = {
  inhale: 'Breathe In',
  hold: 'Hold',
  exhale: 'Breathe Out',
  rest: 'Rest',
};

export function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const sequence: BreathPhase[] = ['inhale', 'hold', 'exhale', 'rest'];
    let currentIndex = 0;

    const advancePhase = () => {
      currentIndex = (currentIndex + 1) % sequence.length;
      const nextPhase = sequence[currentIndex];
      setPhase(nextPhase);

      if (nextPhase === 'inhale') {
        setCycles((prev) => prev + 1);
      }
    };

    const getTimeout = () => {
      return setTimeout(advancePhase, PHASE_DURATIONS[phase]);
    };

    const timeout = getTimeout();
    return () => clearTimeout(timeout);
  }, [isActive, phase]);

  if (!isActive) {
    return (
      <motion.button
        onClick={() => {
          setIsActive(true);
          setPhase('inhale');
          setCycles(0);
        }}
        className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Wind className="w-4 h-4" />
        <span className="text-sm">Breathing Exercise</span>
      </motion.button>
    );
  }

  const scale = phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        onClick={() => setIsActive(false)}
        className="absolute top-6 right-6 text-white/40 hover:text-white/60 transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="text-center">
        <motion.div
          className="relative mx-auto mb-8"
          style={{ width: 200, height: 200 }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400/30"
            animate={{ scale }}
            transition={{ duration: PHASE_DURATIONS[phase] / 1000, ease: 'easeInOut' }}
          />

          {/* Middle ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-blue-400/50"
            animate={{ scale }}
            transition={{
              duration: PHASE_DURATIONS[phase] / 1000,
              ease: 'easeInOut',
              delay: 0.1,
            }}
          />

          {/* Inner circle */}
          <motion.div
            className="absolute inset-8 rounded-full bg-blue-400/20"
            animate={{
              scale,
              backgroundColor:
                phase === 'inhale'
                  ? 'rgba(96, 165, 250, 0.3)'
                  : phase === 'hold'
                  ? 'rgba(96, 165, 250, 0.4)'
                  : 'rgba(96, 165, 250, 0.2)',
            }}
            transition={{ duration: PHASE_DURATIONS[phase] / 1000, ease: 'easeInOut' }}
          />

          {/* Center dot */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full bg-blue-400"
            animate={{ scale: phase === 'hold' ? 1.2 : 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            className="text-3xl text-white font-light mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {PHASE_INSTRUCTIONS[phase]}
          </motion.div>
        </AnimatePresence>

        <div className="text-white/40 text-sm">
          {cycles} {cycles === 1 ? 'cycle' : 'cycles'} completed
        </div>

        <div className="mt-8 text-white/30 text-xs">
          Press anywhere outside or X to exit
        </div>
      </div>
    </motion.div>
  );
}
