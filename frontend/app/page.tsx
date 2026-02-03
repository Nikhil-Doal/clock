'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, BarChart3 } from 'lucide-react';
import { useAppStore } from '@/store';
import { useWeather, useGeolocation, useClock } from '@/hooks';
import {
  Clock,
  WeatherDisplay,
  AstronomyPanel,
  AirQualityDisplay,
  SettingsPanel,
  LocationSearch,
  WeatherAlerts,
  WorldClocks,
  Pomodoro,
  AmbientSounds,
  DailyQuote,
  BreathingExercise,
  WordOfTheDay,
  WeatherSidePanel,
} from '@/components';
import { getWeatherBackgroundImage, isNightTime } from '@/lib/utils';

export default function Home() {
  const {
    displaySettings,
    settingsOpen,
    setSettingsOpen,
    currentWeather,
    location,
    isLoading,
    error,
    updateDisplaySettings,
  } = useAppStore();

  const { currentHour, isDimmed, dimLevel } = useClock();
  useGeolocation();
  useWeather();

  // Force background refresh every 5 minutes
  const [backgroundRefreshKey, setBackgroundRefreshKey] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundRefreshKey(k => k + 1);
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

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
          updateDisplaySettings({ focusMode: !displaySettings.focusMode });
          break;
        case 'w':
          updateDisplaySettings({ showWeatherPanel: !displaySettings.showWeatherPanel });
          break;
        case 'escape':
          if (settingsOpen) {
            setSettingsOpen(false);
          } else if (displaySettings.showWeatherPanel) {
            updateDisplaySettings({ showWeatherPanel: false });
          }
          break;
      }
    },
    [settingsOpen, setSettingsOpen, displaySettings.focusMode, displaySettings.showWeatherPanel, updateDisplaySettings]
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
    }, 60000);

    return () => clearInterval(interval);
  }, [displaySettings.burnInPrevention]);

  const isNight = isNightTime(
    currentHour,
    currentWeather?.sunrise,
    currentWeather?.sunset,
    currentWeather?.timezoneOffset
  );

  const backgroundImage = getWeatherBackgroundImage(
    currentWeather?.description || '',
    isNight
  );

  const isFocusMode = displaySettings.focusMode;
  const useSolidBackground = displaySettings.backgroundMode === 'solid';
  const showWeatherPanel = displaySettings.showWeatherPanel;

  return (
    <div
      className="h-screen overflow-hidden relative"
      style={{
        opacity: isDimmed ? dimLevel : 1,
      }}
    >
      {/* Background */}
      {useSolidBackground ? (
        <div
          className="fixed inset-0"
          style={{ backgroundColor: displaySettings.solidBackgroundColor || '#0a0a1a' }}
        />
      ) : (
        <>
          {/* Base background color as fallback */}
          <div className="fixed inset-0 bg-slate-900" />
          {/* Weather image */}
          <div
            key={`bg-${backgroundRefreshKey}`}
            className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          />
          {/* Dark overlay */}
          <div
            className="fixed inset-0 bg-black transition-opacity duration-500"
            style={{ opacity: (displaySettings.backgroundOpacity ?? 50) / 100 }}
          />
        </>
      )}

      {/* Content layer */}
      <div className="relative z-10 h-full">
        {/* Weather alerts */}
        <WeatherAlerts />

        {/* Settings panel */}
        <SettingsPanel />

        {/* Weather Side Panel */}
        <AnimatePresence>
          {showWeatherPanel && <WeatherSidePanel />}
        </AnimatePresence>

        {/* Top buttons */}
        <div className="fixed top-4 right-4 z-30 flex items-center gap-2">
          {/* Weather Panel toggle */}
          {!isFocusMode && (
            <motion.button
              onClick={() => updateDisplaySettings({ showWeatherPanel: !showWeatherPanel })}
              className={`p-3 backdrop-blur-sm rounded-full transition-all ${
                showWeatherPanel
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Weather Panel (W)"
            >
              <BarChart3 className="w-5 h-5" />
            </motion.button>
          )}

          {/* Settings button */}
          <motion.button
            onClick={() => setSettingsOpen(true)}
            className="p-3 bg-white/5 backdrop-blur-sm rounded-full text-white/40 hover:text-white/60 hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Settings (S)"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Main content */}
        <main
          className="h-full flex flex-col items-center justify-between px-4 py-4 transition-all duration-300"
          style={{
            marginRight: showWeatherPanel ? '420px' : '0',
          }}
        >
          {/* Loading/Error display */}
          {(isLoading || error || !location) && (
            <motion.div
              className={`fixed top-4 left-4 backdrop-blur-sm px-4 py-2 rounded-xl text-sm z-20 ${
                error ? 'bg-red-500/20 text-red-200' : 'bg-white/10 text-white/60'
              }`}
              style={{ right: showWeatherPanel ? '500px' : '100px' }}
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
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl gap-4">
            <Clock />

            {/* Compact Weather display */}
            {!isFocusMode && displaySettings.showWeather && (
              <WeatherDisplay />
            )}
          </div>

          {/* Bottom section */}
          {!isFocusMode && (
            <div className="w-full max-w-6xl space-y-4 pb-2 flex-shrink-0">
              {/* World Clocks */}
              <div className="flex justify-center">
                <WorldClocks />
              </div>

              {/* Astronomy & Air Quality Row */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {displaySettings.showAstronomy && <AstronomyPanel />}
                <AirQualityDisplay />
              </div>

              {/* Quote and Word of the Day */}
              <div className="flex flex-col lg:flex-row gap-6 px-4">
                <div className="lg:w-2/3">
                  <DailyQuote />
                </div>
                <div className="lg:w-1/3">
                  <WordOfTheDay />
                </div>
              </div>

              {/* Ambient Features Row */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 px-4">
                <Pomodoro />
                <AmbientSounds />
                <BreathingExercise />
              </div>
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
    </div>
  );
}
