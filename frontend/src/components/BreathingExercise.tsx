'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, X, Pause, Play } from 'lucide-react';

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASE_CONFIG: Record<BreathPhase, { duration: number; instruction: string; scale: number }> = {
  inhale: { duration: 4, instruction: 'Breathe In', scale: 1.4 },
  hold: { duration: 4, instruction: 'Hold', scale: 1.4 },
  exhale: { duration: 4, instruction: 'Breathe Out', scale: 1 },
  rest: { duration: 2, instruction: 'Rest', scale: 1 },
};

const PHASE_SEQUENCE: BreathPhase[] = ['inhale', 'hold', 'exhale', 'rest'];

export function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentConfig = PHASE_CONFIG[phase];

  const stopExercise = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setPhase('inhale');
    setPhaseIndex(0);
    setCycles(0);
    setProgress(0);
  }, []);

  // Phase timer
  useEffect(() => {
    if (!isActive || isPaused) return;

    const duration = currentConfig.duration * 1000;
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      setProgress(newProgress);
    }, 50);

    const phaseTimeout = setTimeout(() => {
      const nextIndex = (phaseIndex + 1) % PHASE_SEQUENCE.length;
      setPhaseIndex(nextIndex);
      setPhase(PHASE_SEQUENCE[nextIndex]);
      setProgress(0);

      if (nextIndex === 0) {
        setCycles(c => c + 1);
      }
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(phaseTimeout);
    };
  }, [isActive, isPaused, phase, phaseIndex, currentConfig.duration]);

  // Handle escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        stopExercise();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isActive, stopExercise]);

  if (!isActive) {
    return (
      <motion.button
        onClick={() => {
          setIsActive(true);
          setPhase('inhale');
          setPhaseIndex(0);
          setCycles(0);
          setProgress(0);
        }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Wind className="w-4 h-4" />
        <span className="text-sm">Breathing Exercise</span>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) stopExercise();
        }}
      >
        {/* Close button */}
        <button
          onClick={stopExercise}
          className="absolute top-6 right-6 p-2 text-white/40 hover:text-white/60 transition-colors rounded-full hover:bg-white/10"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="text-center">
          {/* Breathing circle */}
          <div className="relative w-64 h-64 mx-auto mb-10">
            {/* Background ring */}
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />

            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="124"
                fill="none"
                stroke="rgba(96, 165, 250, 0.3)"
                strokeWidth="4"
                strokeDasharray={780}
                strokeDashoffset={780 * (1 - progress)}
                strokeLinecap="round"
                className="transition-all duration-100"
              />
            </svg>

            {/* Animated breathing circle */}
            <motion.div
              className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-400/30 to-purple-500/30 backdrop-blur-sm"
              animate={{
                scale: currentConfig.scale,
                opacity: phase === 'hold' ? 0.8 : 0.6,
              }}
              transition={{
                duration: currentConfig.duration,
                ease: 'easeInOut',
              }}
            />

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-light text-white mb-2"
              >
                {currentConfig.instruction}
              </motion.div>
              <div className="text-4xl font-light text-white/80">
                {Math.ceil(currentConfig.duration * (1 - progress))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            </button>
          </div>

          {/* Stats */}
          <div className="text-white/50 text-lg">
            {cycles} {cycles === 1 ? 'cycle' : 'cycles'} completed
          </div>

          <div className="mt-6 text-white/30 text-sm">
            Press Escape or click outside to exit
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
