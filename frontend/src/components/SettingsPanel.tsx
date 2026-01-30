'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  Cloud,
  Monitor,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { TIMEZONES } from '@/lib/utils';
import type { ClockFont, TimeFormat, TemperatureUnit } from '@/types';

export function SettingsPanel() {
  const {
    settingsOpen,
    setSettingsOpen,
    clockSettings,
    updateClockSettings,
    weatherSettings,
    updateWeatherSettings,
    displaySettings,
    updateDisplaySettings,
  } = useAppStore();

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900/95 backdrop-blur-md z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-light text-white">Settings</h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Clock Settings */}
              <SettingsSection icon={<Clock />} title="Clock">
                <SettingRow label="Time Format">
                  <ToggleGroup
                    options={[
                      { value: '12h', label: '12h' },
                      { value: '24h', label: '24h' },
                    ]}
                    value={clockSettings.timeFormat}
                    onChange={(v) =>
                      updateClockSettings({ timeFormat: v as TimeFormat })
                    }
                  />
                </SettingRow>

                <SettingRow label="Show Seconds">
                  <Toggle
                    checked={clockSettings.showSeconds}
                    onChange={(v) => updateClockSettings({ showSeconds: v })}
                  />
                </SettingRow>

                <SettingRow label="Show Date">
                  <Toggle
                    checked={clockSettings.showDate}
                    onChange={(v) => updateClockSettings({ showDate: v })}
                  />
                </SettingRow>

                <SettingRow label="Glow Effect">
                  <Toggle
                    checked={clockSettings.showGlow}
                    onChange={(v) => updateClockSettings({ showGlow: v })}
                  />
                </SettingRow>

                <SettingRow label="Font Style">
                  <select
                    value={clockSettings.font}
                    onChange={(e) =>
                      updateClockSettings({ font: e.target.value as ClockFont })
                    }
                    className="bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <option value="mono" className="bg-slate-800">
                      Monospace
                    </option>
                    <option value="rounded" className="bg-slate-800">
                      Rounded
                    </option>
                    <option value="futuristic" className="bg-slate-800">
                      Futuristic
                    </option>
                    <option value="default" className="bg-slate-800">
                      Default
                    </option>
                  </select>
                </SettingRow>

                <SettingRow label="Timezone">
                  <select
                    value={clockSettings.timezone}
                    onChange={(e) =>
                      updateClockSettings({ timezone: e.target.value })
                    }
                    className="bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20 max-w-[180px]"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value} className="bg-slate-800">
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </SettingRow>
              </SettingsSection>

              {/* Weather Settings */}
              <SettingsSection icon={<Cloud />} title="Weather">
                <SettingRow label="Temperature Unit">
                  <ToggleGroup
                    options={[
                      { value: 'celsius', label: '°C' },
                      { value: 'fahrenheit', label: '°F' },
                    ]}
                    value={weatherSettings.units}
                    onChange={(v) =>
                      updateWeatherSettings({ units: v as TemperatureUnit })
                    }
                  />
                </SettingRow>

                <SettingRow label="Feels Like">
                  <Toggle
                    checked={weatherSettings.showFeelsLike}
                    onChange={(v) =>
                      updateWeatherSettings({ showFeelsLike: v })
                    }
                  />
                </SettingRow>

                <SettingRow label="Hourly Forecast">
                  <Toggle
                    checked={weatherSettings.showHourlyForecast}
                    onChange={(v) =>
                      updateWeatherSettings({ showHourlyForecast: v })
                    }
                  />
                </SettingRow>

                <SettingRow label="Daily Forecast">
                  <Toggle
                    checked={weatherSettings.showDailyForecast}
                    onChange={(v) =>
                      updateWeatherSettings({ showDailyForecast: v })
                    }
                  />
                </SettingRow>

                <SettingRow label="Air Quality">
                  <Toggle
                    checked={weatherSettings.showAirQuality}
                    onChange={(v) =>
                      updateWeatherSettings({ showAirQuality: v })
                    }
                  />
                </SettingRow>
              </SettingsSection>

              {/* Display Settings */}
              <SettingsSection icon={<Monitor />} title="Display">
                <SettingRow label="Show Weather">
                  <Toggle
                    checked={displaySettings.showWeather}
                    onChange={(v) => updateDisplaySettings({ showWeather: v })}
                  />
                </SettingRow>

                <SettingRow label="Show Astronomy">
                  <Toggle
                    checked={displaySettings.showAstronomy}
                    onChange={(v) => updateDisplaySettings({ showAstronomy: v })}
                  />
                </SettingRow>

                <SettingRow label="Focus Mode">
                  <Toggle
                    checked={displaySettings.focusMode}
                    onChange={(v) => updateDisplaySettings({ focusMode: v })}
                  />
                </SettingRow>

                <SettingRow label="Background">
                  <select
                    value={displaySettings.backgroundMode}
                    onChange={(e) =>
                      updateDisplaySettings({
                        backgroundMode: e.target.value as 'solid' | 'gradient' | 'weather',
                      })
                    }
                    className="bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <option value="solid" className="bg-slate-800">
                      Solid Dark
                    </option>
                    <option value="gradient" className="bg-slate-800">
                      Gradient
                    </option>
                    <option value="weather" className="bg-slate-800">
                      Weather Based
                    </option>
                  </select>
                </SettingRow>

                <SettingRow label="Auto Dim at Night">
                  <Toggle
                    checked={displaySettings.autoDim}
                    onChange={(v) => updateDisplaySettings({ autoDim: v })}
                  />
                </SettingRow>

                {displaySettings.autoDim && (
                  <>
                    <SettingRow label="Dim Level">
                      <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.1"
                        value={displaySettings.dimLevel}
                        onChange={(e) =>
                          updateDisplaySettings({
                            dimLevel: parseFloat(e.target.value),
                          })
                        }
                        className="w-24 accent-white"
                      />
                    </SettingRow>

                    <SettingRow label="Dim Start">
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={displaySettings.dimStartHour}
                        onChange={(e) =>
                          updateDisplaySettings({
                            dimStartHour: parseInt(e.target.value),
                          })
                        }
                        className="w-16 bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
                      />
                    </SettingRow>

                    <SettingRow label="Dim End">
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={displaySettings.dimEndHour}
                        onChange={(e) =>
                          updateDisplaySettings({
                            dimEndHour: parseInt(e.target.value),
                          })
                        }
                        className="w-16 bg-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none"
                      />
                    </SettingRow>
                  </>
                )}

                <SettingRow label="Burn-in Prevention">
                  <Toggle
                    checked={displaySettings.burnInPrevention}
                    onChange={(v) =>
                      updateDisplaySettings({ burnInPrevention: v })
                    }
                  />
                </SettingRow>
              </SettingsSection>

              {/* Keyboard Shortcuts */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-white/60 text-sm uppercase tracking-wide mb-4">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/50">
                    <span>Toggle Settings</span>
                    <kbd className="bg-white/10 px-2 py-0.5 rounded">S</kbd>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Toggle Focus Mode</span>
                    <kbd className="bg-white/10 px-2 py-0.5 rounded">F</kbd>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Toggle Fullscreen</span>
                    <kbd className="bg-white/10 px-2 py-0.5 rounded">
                      Esc / F11
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface SettingsSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ icon, title, children }: SettingsSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-white/80 mb-4">
        <span className="text-white/40">{icon}</span>
        <h3 className="text-lg">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface SettingRowProps {
  label: string;
  children: React.ReactNode;
}

function SettingRow({ label, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/60">{label}</span>
      {children}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-blue-500' : 'bg-white/20'
      }`}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-md"
        animate={{ x: checked ? 26 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

interface ToggleGroupProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function ToggleGroup({ options, value, onChange }: ToggleGroupProps) {
  return (
    <div className="flex bg-white/10 rounded-lg p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            value === option.value
              ? 'bg-white/20 text-white'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
