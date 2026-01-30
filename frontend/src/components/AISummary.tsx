'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, MessageSquare, FlaskConical, Baby } from 'lucide-react';
import { useAppStore } from '@/store';
import { getWeatherSummary } from '@/lib/api';
import type { AISummaryStyle } from '@/types';

export function AISummary() {
  const { currentWeather, aiSummary, setAiSummary, location } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [style, setStyle] = useState<AISummaryStyle>('friendly');
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async (summaryStyle: AISummaryStyle) => {
    if (!currentWeather || !location) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await getWeatherSummary(
        {
          temp: currentWeather.temp,
          feels_like: currentWeather.feels_like,
          description: currentWeather.description,
          humidity: currentWeather.humidity,
          wind_speed: currentWeather.wind_speed,
          uvi: currentWeather.uvi,
          location: location.name,
        },
        summaryStyle
      );
      setAiSummary(result.summary);
      setStyle(summaryStyle);
    } catch {
      setError('AI summary unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentWeather) return null;

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
    >
      <AnimatePresence mode="wait">
        {aiSummary && isExpanded ? (
          <motion.div
            key="summary"
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 text-white/60">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm">AI Weather Summary</span>
              </div>
              <div className="flex gap-2">
                <StyleButton
                  icon={<MessageSquare className="w-3 h-3" />}
                  label="Friendly"
                  active={style === 'friendly'}
                  onClick={() => fetchSummary('friendly')}
                />
                <StyleButton
                  icon={<FlaskConical className="w-3 h-3" />}
                  label="Scientific"
                  active={style === 'scientific'}
                  onClick={() => fetchSummary('scientific')}
                />
                <StyleButton
                  icon={<Baby className="w-3 h-3" />}
                  label="ELI5"
                  active={style === 'eli5'}
                  onClick={() => fetchSummary('eli5')}
                />
              </div>
            </div>

            <motion.p
              className="text-white/80 text-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2 text-white/50">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating summary...
                </span>
              ) : error ? (
                <span className="text-white/40 text-base">
                  {error} — AI features require a valid Gemini API key
                </span>
              ) : (
                aiSummary
              )}
            </motion.p>

            <button
              onClick={() => setIsExpanded(false)}
              className="mt-4 text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Collapse
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="button"
            onClick={() => {
              setIsExpanded(true);
              if (!aiSummary) fetchSummary('friendly');
            }}
            className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">
              {aiSummary ? 'Show AI summary' : 'Get AI weather summary'}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface StyleButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function StyleButton({ icon, label, active, onClick }: StyleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
        active
          ? 'bg-purple-500/30 text-purple-300'
          : 'text-white/40 hover:text-white/60 hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
