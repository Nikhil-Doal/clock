'use client';

import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useAppStore } from '@/store';
import { useWeather, useGeolocation, useClock } from '@/hooks';
import {
  Clock,
  WeatherDisplay,
  AstronomyPanel,
  SettingsPanel,
  AISummary,
  LocationSearch,
  WeatherAlerts,
} from '@/components';
import { getWeatherGradient, isNightTime } from '@/lib/utils';

export default function Home() {
  const {
    displaySettings,
    settingsOpen,
    setSettingsOpen,
    currentWeather,
    location,
    isLoading,
    error,
  } = useAppStore();

  const { currentHour, isDimmed, dimLevel } = useClock();
  useGeolocation();
  useWeather();

  // Keyboard shortcuts
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 's':
          setSettingsOpen(!settingsOpen);
          break;
        case 'f':
          useAppStore.getState().updateDisplaySettings({
            focusMode: !displaySettings.focusMode,
          });
          break;
        case 'escape':
          if (settingsOpen) {
            setSettingsOpen(false);
          }
          break;
      }
    },
    [settingsOpen, setSettingsOpen, displaySettings.focusMode]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Burn-in prevention
  useEffect(() => {
    if (!displaySettings.burnInPrevention) return;

    const interval = setInterval(() => {
      const main = document.querySelector('main');
      if (main) {
        const offsetX = Math.random() * 20 - 10;
        const offsetY = Math.random() * 20 - 10;
        main.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [displaySettings.burnInPrevention]);

  const isNight = isNightTime(
    currentHour,
    currentWeather?.sunrise,
    currentWeather?.sunset
  );

  // Always use weather/time-based gradient background
  const getBackground = () => {
    if (currentWeather) {
      return getWeatherGradient(currentWeather.description, isNight);
    }
    // Time-based gradient when no weather data yet
    return isNight
      ? 'from-slate-900 via-indigo-950 to-slate-900'
      : 'from-sky-400 via-blue-500 to-indigo-600';
  };

  const backgroundGradient = getBackground();

  const isFocusMode = displaySettings.focusMode;

  return (
    <div
      className={`h-screen overflow-hidden transition-all duration-1000 bg-gradient-to-br ${backgroundGradient}`}
      style={{
        opacity: isDimmed ? dimLevel : 1,
      }}
    >
      {/* Weather alerts */}
      <WeatherAlerts />

      {/* Settings panel */}
      <SettingsPanel />

      {/* Settings button */}
      <motion.button
        onClick={() => setSettingsOpen(true)}
        className="fixed top-4 right-4 z-30 p-3 bg-white/5 backdrop-blur-sm rounded-full text-white/40 hover:text-white/60 hover:bg-white/10 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Settings (S)"
      >
        <Settings className="w-5 h-5" />
      </motion.button>

      {/* Main content */}
      <main className="h-full flex flex-col items-center justify-between px-4 py-6 transition-transform duration-1000">
        {/* Loading/Error display */}
        {(isLoading || error || !location) && (
          <motion.div
            className={`fixed top-4 left-4 right-20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm ${
              error ? 'bg-red-500/20 text-red-200' : 'bg-white/10 text-white/60'
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error || (isLoading ? 'Loading weather data...' : 'Getting your location...')}
          </motion.div>
        )}

        {/* Top section - Location */}
        {!isFocusMode && (
          <div className="w-full flex justify-center pt-2">
            <LocationSearch />
          </div>
        )}

        {/* Center section - Clock and Weather */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl gap-4">
          {/* Clock - Always visible */}
          <Clock />

          {/* Compact Weather display */}
          {!isFocusMode && displaySettings.showWeather && (
            <WeatherDisplay />
          )}
        </div>

        {/* Bottom section - Astronomy and AI */}
        {!isFocusMode && (
          <div className="w-full max-w-4xl space-y-3 pb-2">
            {/* Astronomy panel */}
            {displaySettings.showAstronomy && (
              <div className="flex justify-center">
                <AstronomyPanel />
              </div>
            )}

            {/* AI Summary */}
            {displaySettings.showWeather && <AISummary />}
          </div>
        )}

        {/* Focus mode indicator */}
        {isFocusMode && (
          <motion.div
            className="text-white/30 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Focus mode · Press F to exit
          </motion.div>
        )}
      </main>
    </div>
  );
}
