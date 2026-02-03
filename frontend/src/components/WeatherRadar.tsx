'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/store';

interface RadarFrame {
  time: number;
  path: string;
}

export function WeatherRadar() {
  const { location } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch radar data from RainViewer API
  useEffect(() => {
    if (!isExpanded || !location) return;

    const fetchRadarData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await response.json();

        if (data.radar?.past) {
          const frames = data.radar.past.map((frame: { time: number; path: string }) => ({
            time: frame.time,
            path: frame.path,
          }));

          // Add forecast frames if available
          if (data.radar?.nowcast) {
            frames.push(...data.radar.nowcast.map((frame: { time: number; path: string }) => ({
              time: frame.time,
              path: frame.path,
            })));
          }

          setRadarFrames(frames);
          setCurrentFrame(frames.length - 1);
        }
      } catch (error) {
        console.error('Failed to fetch radar data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRadarData();
    // Refresh every 10 minutes
    const interval = setInterval(fetchRadarData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isExpanded, location]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || radarFrames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % radarFrames.length);
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, radarFrames.length]);

  if (!location) return null;

  const currentTime = radarFrames[currentFrame]?.time
    ? new Date(radarFrames[currentFrame].time * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  if (!isExpanded) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Radar className="w-4 h-4" />
        <span className="text-sm">Weather Radar</span>
        <ChevronDown className="w-4 h-4" />
      </motion.button>
    );
  }

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-cyan-400" />
          <span className="text-white/70 text-sm font-medium">Precipitation Radar</span>
          {currentTime && (
            <span className="text-white/40 text-xs ml-2">{currentTime}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2 py-1 text-xs rounded ${
              isPlaying ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-white/50'
            }`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 text-white/40 hover:text-white/60 transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Radar Map */}
      <div className="relative h-64 sm:h-80 bg-slate-900/50">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-white/40 animate-spin" />
          </div>
        ) : radarFrames.length > 0 ? (
          <>
            {/* Base map layer - OpenStreetMap */}
            <img
              src={`https://tile.openstreetmap.org/6/${Math.floor((location.lon + 180) / 360 * 64)}/${Math.floor((1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * 64)}.png`}
              alt="Map"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            {/* Radar overlay */}
            <img
              src={`https://tilecache.rainviewer.com${radarFrames[currentFrame]?.path}/256/6/${Math.floor((location.lon + 180) / 360 * 64)}/${Math.floor((1 - Math.log(Math.tan(location.lat * Math.PI / 180) + 1 / Math.cos(location.lat * Math.PI / 180)) / Math.PI) / 2 * 64)}/2/1_1.png`}
              alt="Radar"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ mixBlendMode: 'screen' }}
            />
            {/* Center marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
            No radar data available
          </div>
        )}
      </div>

      {/* Timeline */}
      {radarFrames.length > 0 && (
        <div className="px-5 py-3 border-t border-white/10">
          <input
            type="range"
            min="0"
            max={radarFrames.length - 1}
            value={currentFrame}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentFrame(parseInt(e.target.value));
            }}
            className="w-full accent-cyan-500"
          />
          <div className="flex justify-between text-white/40 text-xs mt-1">
            <span>Past</span>
            <span>Now</span>
            <span>Forecast</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-5 pb-3 flex items-center justify-center gap-4 text-xs text-white/50">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/70" />
          <span>Light</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500/70" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/70" />
          <span>Heavy</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-purple-500/70" />
          <span>Extreme</span>
        </div>
      </div>
    </motion.div>
  );
}
