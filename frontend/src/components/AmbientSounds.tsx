'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, CloudRain, Wind, Waves, Bird, Coffee } from 'lucide-react';

interface Sound {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
}

const SOUNDS: Sound[] = [
  {
    id: 'rain',
    name: 'Rain',
    icon: <CloudRain className="w-4 h-4" />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3',
  },
  {
    id: 'wind',
    name: 'Wind',
    icon: <Wind className="w-4 h-4" />,
    url: 'https://assets.mixkit.co/active_storage/sfx/1186/1186-preview.mp3',
  },
  {
    id: 'waves',
    name: 'Waves',
    icon: <Waves className="w-4 h-4" />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2469/2469-preview.mp3',
  },
  {
    id: 'birds',
    name: 'Birds',
    icon: <Bird className="w-4 h-4" />,
    url: 'https://assets.mixkit.co/active_storage/sfx/2430/2430-preview.mp3',
  },
  {
    id: 'cafe',
    name: 'Cafe',
    icon: <Coffee className="w-4 h-4" />,
    url: 'https://assets.mixkit.co/active_storage/sfx/1232/1232-preview.mp3',
  },
];

export function AmbientSounds() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set());
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Initialize audio elements
    SOUNDS.forEach((sound) => {
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio(sound.url);
        audio.loop = true;
        audio.volume = 0.5;
        audioRefs.current[sound.id] = audio;
      }
    });

    // Capture ref value for cleanup
    const refs = audioRefs.current;
    return () => {
      // Cleanup
      Object.values(refs).forEach((audio) => {
        audio.pause();
      });
    };
  }, []);

  const toggleSound = (soundId: string) => {
    const audio = audioRefs.current[soundId];
    if (!audio) return;

    if (activeSounds.has(soundId)) {
      audio.pause();
      setActiveSounds((prev) => {
        const next = new Set(prev);
        next.delete(soundId);
        return next;
      });
    } else {
      audio.play().catch(() => {
        // Autoplay might be blocked
        console.log('Audio autoplay blocked');
      });
      setActiveSounds((prev) => new Set([...prev, soundId]));
    }
  };

  const setVolume = (soundId: string, volume: number) => {
    const audio = audioRefs.current[soundId];
    if (audio) {
      audio.volume = volume;
      setVolumes((prev) => ({ ...prev, [soundId]: volume }));
    }
  };

  const stopAll = () => {
    Object.values(audioRefs.current).forEach((audio) => {
      audio.pause();
    });
    setActiveSounds(new Set());
  };

  const hasActiveSounds = activeSounds.size > 0;

  if (!isExpanded) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {hasActiveSounds ? (
          <Volume2 className="w-4 h-4 text-green-400" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
        <span className="text-sm">Ambient Sounds</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsExpanded(false);
      }}
    >
      <motion.div
        className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 min-w-[300px] border border-white/10"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white/80 font-medium">Ambient Sounds</h3>
          <div className="flex items-center gap-2">
            {hasActiveSounds && (
              <button
                onClick={stopAll}
                className="text-white/40 hover:text-white/60 text-xs"
              >
                Stop All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white/40 hover:text-white/60 text-sm"
            >
              Close
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {SOUNDS.map((sound) => {
            const isActive = activeSounds.has(sound.id);
            const volume = volumes[sound.id] ?? 0.5;

            return (
              <div
                key={sound.id}
                className="flex items-center gap-3"
              >
                <motion.button
                  onClick={() => toggleSound(sound.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {sound.icon}
                  <span className="text-sm">{sound.name}</span>
                </motion.button>

                <AnimatePresence>
                  {isActive && (
                    <motion.input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(sound.id, parseFloat(e.target.value))}
                      className="flex-1 accent-green-400 h-1"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-white/30 text-xs">
          Mix multiple sounds together
        </div>
      </motion.div>
    </motion.div>
  );
}
