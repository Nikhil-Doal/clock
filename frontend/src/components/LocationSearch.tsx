'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { geocode } from '@/lib/api';

interface SearchResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export function LocationSearch() {
  const { location, setLocation } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await geocode(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced auto-search as user types
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length >= 2) {
      // Longer debounce for better multi-word city support
      debounceRef.current = setTimeout(() => {
        handleSearch(trimmedQuery);
      }, 500);
    } else {
      setResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, handleSearch]);

  const selectLocation = (result: SearchResult) => {
    setLocation({
      lat: result.lat,
      lon: result.lon,
      name: result.name,
      country: result.country,
    });
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MapPin className="w-4 h-4" />
        <span className="text-sm">
          {location ? `${location.name}` : 'Set location'}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-slate-900/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg">Search Location</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/40 hover:text-white/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                  placeholder="Start typing a city name..."
                  className="w-full bg-white/10 text-white rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-white/20 placeholder-white/30"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/40">
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </div>
              </div>
              {query.length > 0 && query.length < 2 && (
                <p className="text-white/30 text-xs mt-2">Type at least 2 characters to search</p>
              )}

              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    className="mt-4 space-y-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {results.map((result, index) => (
                      <motion.button
                        key={`${result.lat}-${result.lon}`}
                        onClick={() => selectLocation(result)}
                        className="w-full text-left bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="text-white">{result.name}</div>
                        <div className="text-white/50 text-sm">
                          {result.state ? `${result.state}, ` : ''}
                          {result.country}
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                          setLocation({
                            lat: pos.coords.latitude,
                            lon: pos.coords.longitude,
                            name: 'Current Location',
                          });
                          setIsOpen(false);
                        },
                        (err) => console.error(err)
                      );
                    }
                  }}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Use current location</span>
                </button>
                <p className="text-white/30 text-xs">
                  Search powered by OpenWeatherMap. Best results for major cities worldwide.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
