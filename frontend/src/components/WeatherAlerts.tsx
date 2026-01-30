'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppStore } from '@/store';

export function WeatherAlerts() {
  const { alerts, weatherSettings } = useAppStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  if (!weatherSettings.showAlerts || alerts.length === 0) return null;

  const visibleAlerts = alerts.filter((_, i) => !dismissed.has(i));

  if (visibleAlerts.length === 0) return null;

  return (
    <motion.div
      className="fixed top-4 right-4 z-30 max-w-sm space-y-2"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <AnimatePresence>
        {visibleAlerts.map((alert, index) => (
          <motion.div
            key={`${alert.event}-${alert.start}`}
            className="bg-red-900/90 backdrop-blur-sm rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start gap-3 p-4">
              <AlertTriangle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-red-100 font-medium">{alert.event}</h4>
                  <button
                    onClick={() =>
                      setDismissed((prev) => new Set([...prev, index]))
                    }
                    className="text-red-300/60 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-red-200/70 text-sm mt-1">
                  {alert.sender_name}
                </div>
                <div className="text-red-200/50 text-xs mt-1">
                  {new Date(alert.start * 1000).toLocaleString()} -{' '}
                  {new Date(alert.end * 1000).toLocaleString()}
                </div>

                <button
                  onClick={() =>
                    setExpandedIndex(expandedIndex === index ? null : index)
                  }
                  className="flex items-center gap-1 text-red-300/60 hover:text-red-300 text-xs mt-2 transition-colors"
                >
                  {expandedIndex === index ? (
                    <>
                      <ChevronUp className="w-3 h-3" /> Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" /> More details
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {expandedIndex === index && (
                    <motion.div
                      className="text-red-200/70 text-sm mt-2"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {alert.description}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
