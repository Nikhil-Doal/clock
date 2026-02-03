'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, MessageSquare, FlaskConical, Baby, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/store';
import { getWeatherSummary } from '@/lib/api';
import type { AISummaryStyle } from '@/types';

export function AISummary() {
  const { currentWeather, aiSummary, setAiSummary, location } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [style, setStyle] = useState<AISummaryStyle>('friendly');
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async (summaryStyle: AISummaryStyle, retryCount = 0) => {
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
      // Auto-retry up to 2 times
      if (retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchSummary(summaryStyle, retryCount + 1);
      }
      setError('AI summary unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentWeather) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="summary"
            className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-white/70 text-sm font-medium">AI Weather Summary</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-white/40 hover:text-white/60 transition-colors"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>

            {/* Style Buttons */}
            <div className="flex gap-2 px-5 py-3 border-b border-white/10">
              <StyleButton
                icon={<MessageSquare className="w-3.5 h-3.5" />}
                label="Friendly"
                active={style === 'friendly'}
                onClick={() => fetchSummary('friendly')}
                disabled={isLoading}
              />
              <StyleButton
                icon={<FlaskConical className="w-3.5 h-3.5" />}
                label="Scientific"
                active={style === 'scientific'}
                onClick={() => fetchSummary('scientific')}
                disabled={isLoading}
              />
              <StyleButton
                icon={<Baby className="w-3.5 h-3.5" />}
                label="ELI5"
                active={style === 'eli5'}
                onClick={() => fetchSummary('eli5')}
                disabled={isLoading}
              />
            </div>

            {/* Content */}
            <div className="px-5 py-4 max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center gap-3 py-4 text-white/50">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating summary...</span>
                </div>
              ) : error ? (
                <div className="text-center py-4">
                  <p className="text-red-400/80 text-sm">{error}</p>
                  <p className="text-white/30 text-xs mt-1">Check your Gemini API key</p>
                </div>
              ) : (
                <p className="text-white/90 text-base leading-relaxed">
                  {aiSummary || 'Click a style above to generate a summary.'}
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="button"
            onClick={() => {
              setIsExpanded(true);
              if (!aiSummary) fetchSummary('friendly');
            }}
            className="flex items-center gap-2 mx-auto px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 transition-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm">
              {aiSummary ? 'Show AI Summary' : 'Get AI Weather Summary'}
            </span>
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StyleButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function StyleButton({ icon, label, active, onClick, disabled }: StyleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
        active
          ? 'bg-purple-500/30 text-purple-300'
          : 'text-white/50 hover:text-white/70 hover:bg-white/5'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
