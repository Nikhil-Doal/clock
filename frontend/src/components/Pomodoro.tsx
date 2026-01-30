'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const TIMER_DURATIONS: Record<TimerMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function Pomodoro() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const completedRef = useRef(completedPomodoros);

  // Keep ref in sync with state
  useEffect(() => {
    completedRef.current = completedPomodoros;
  }, [completedPomodoros]);

  const resetTimer = useCallback((newMode?: TimerMode) => {
    const targetMode = newMode || mode;
    setTimeLeft(TIMER_DURATIONS[targetMode]);
    setIsRunning(false);
    if (newMode) setMode(newMode);
  }, [mode]);

  const handleTimerComplete = useCallback(() => {
    if (mode === 'work') {
      const newCount = completedRef.current + 1;
      setCompletedPomodoros(newCount);
      // Auto switch to break
      const nextMode = newCount % 4 === 0 ? 'longBreak' : 'shortBreak';
      resetTimer(nextMode);
      // Play notification sound
      if (typeof window !== 'undefined' && 'Notification' in window) {
        new Notification('Pomodoro Complete!', {
          body: `Time for a ${nextMode === 'longBreak' ? 'long' : 'short'} break`,
        });
      }
    } else {
      resetTimer('work');
    }
  }, [mode, resetTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Timer completed - use callback instead of inline setState
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleTimerComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - timeLeft / TIMER_DURATIONS[mode];

  if (!isExpanded) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain className="w-4 h-4" />
        <span className="text-sm">Focus Timer</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 min-w-[280px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/80 font-medium">Focus Timer</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-white/40 hover:text-white/60 text-sm"
        >
          Hide
        </button>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 mb-6">
        <ModeButton
          icon={<Brain className="w-3 h-3" />}
          label="Work"
          active={mode === 'work'}
          onClick={() => resetTimer('work')}
        />
        <ModeButton
          icon={<Coffee className="w-3 h-3" />}
          label="Short"
          active={mode === 'shortBreak'}
          onClick={() => resetTimer('shortBreak')}
        />
        <ModeButton
          icon={<Coffee className="w-3 h-3" />}
          label="Long"
          active={mode === 'longBreak'}
          onClick={() => resetTimer('longBreak')}
        />
      </div>

      {/* Timer display */}
      <div className="relative flex items-center justify-center mb-6">
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={mode === 'work' ? '#ef4444' : '#22c55e'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={440}
            initial={{ strokeDashoffset: 440 }}
            animate={{ strokeDashoffset: 440 * (1 - progress) }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute text-4xl font-mono text-white">
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button
          onClick={() => setIsRunning(!isRunning)}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            isRunning ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </motion.button>
        <motion.button
          onClick={() => resetTimer()}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Completed count */}
      <div className="text-center mt-4 text-white/40 text-sm">
        {completedPomodoros} pomodoros completed
      </div>
    </motion.div>
  );
}

interface ModeButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function ModeButton({ icon, label, active, onClick }: ModeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-white/20 text-white'
          : 'text-white/40 hover:text-white/60 hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
