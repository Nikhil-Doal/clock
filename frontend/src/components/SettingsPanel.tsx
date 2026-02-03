'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  Cloud,
  Monitor,
  Keyboard,
  Palette,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { ClockFont, TimeFormat, TemperatureUnit } from '@/types';

// Complete timezone list for settings
const TIMEZONES = [
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Chicago', label: 'Chicago (CST)' },
  { value: 'America/Denver', label: 'Denver (MST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'America/Toronto', label: 'Toronto (EST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)' },
];

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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSettingsOpen(false)}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900/98 backdrop-blur-xl z-50 shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-light text-white">Settings</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Clock Settings */}
              <SettingsSection icon={<Clock className="w-5 h-5" />} title="Clock">
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
                  <Select
                    value={clockSettings.font}
                    onChange={(v) => updateClockSettings({ font: v as ClockFont })}
                    options={[
                      { value: 'segment', label: '7-Segment' },
                      { value: 'mono', label: 'Monospace' },
                      { value: 'rounded', label: 'Rounded' },
                      { value: 'futuristic', label: 'Futuristic' },
                      { value: 'default', label: 'Default' },
                    ]}
                  />
                </SettingRow>

                <SettingRow label="Clock Size">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={clockSettings.size || 5}
                      onChange={(e) =>
                        updateClockSettings({ size: parseInt(e.target.value) })
                      }
                      className="w-24 accent-blue-500"
                    />
                    <span className="text-white/50 text-sm w-6">
                      {clockSettings.size || 5}
                    </span>
                  </div>
                </SettingRow>

                <SettingRow label="Timezone">
                  <Select
                    value={clockSettings.timezone}
                    onChange={(v) => updateClockSettings({ timezone: v })}
                    options={TIMEZONES.map(tz => ({ value: tz.value, label: tz.label }))}
                    wide
                  />
                </SettingRow>
              </SettingsSection>

              {/* Color Settings */}
              <SettingsSection icon={<Palette className="w-5 h-5" />} title="Colors">
                <SettingRow label="Clock Color">
                  <ColorPicker
                    value={clockSettings.color || '#ffffff'}
                    onChange={(v) => updateClockSettings({ color: v })}
                  />
                </SettingRow>

                <SettingRow label="Glow Color">
                  <ColorPicker
                    value={clockSettings.glowColor || '#ffffff'}
                    onChange={(v) => updateClockSettings({ glowColor: v })}
                  />
                </SettingRow>

                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="text-white/40 text-xs mb-2">Color Presets</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { color: '#ffffff', name: 'White' },
                      { color: '#00ff88', name: 'Green LCD' },
                      { color: '#ff6b6b', name: 'Red' },
                      { color: '#4dabf7', name: 'Blue' },
                      { color: '#ffd43b', name: 'Amber' },
                      { color: '#da77f2', name: 'Purple' },
                      { color: '#69db7c', name: 'Lime' },
                      { color: '#ffa94d', name: 'Orange' },
                    ].map((preset) => (
                      <button
                        key={preset.color}
                        onClick={() => {
                          updateClockSettings({ color: preset.color, glowColor: preset.color });
                        }}
                        className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-white/50 transition-colors"
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              </SettingsSection>

              {/* Weather Settings */}
              <SettingsSection icon={<Cloud className="w-5 h-5" />} title="Weather">
                <SettingRow label="Temperature">
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
                    onChange={(v) => updateWeatherSettings({ showFeelsLike: v })}
                  />
                </SettingRow>

                <SettingRow label="Hourly Forecast">
                  <Toggle
                    checked={weatherSettings.showHourlyForecast}
                    onChange={(v) => updateWeatherSettings({ showHourlyForecast: v })}
                  />
                </SettingRow>

                <SettingRow label="Daily Forecast">
                  <Toggle
                    checked={weatherSettings.showDailyForecast}
                    onChange={(v) => updateWeatherSettings({ showDailyForecast: v })}
                  />
                </SettingRow>

                <SettingRow label="Weather Alerts">
                  <Toggle
                    checked={weatherSettings.showAlerts}
                    onChange={(v) => updateWeatherSettings({ showAlerts: v })}
                  />
                </SettingRow>
              </SettingsSection>

              {/* Display Settings */}
              <SettingsSection icon={<Monitor className="w-5 h-5" />} title="Display">
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

                <SettingRow label="Show Air Quality">
                  <Toggle
                    checked={displaySettings.showAirQuality}
                    onChange={(v) => updateDisplaySettings({ showAirQuality: v })}
                  />
                </SettingRow>

                <SettingRow label="Weather Panel">
                  <Toggle
                    checked={displaySettings.showWeatherPanel}
                    onChange={(v) => updateDisplaySettings({ showWeatherPanel: v })}
                  />
                </SettingRow>

                <SettingRow label="Focus Mode">
                  <Toggle
                    checked={displaySettings.focusMode}
                    onChange={(v) => updateDisplaySettings({ focusMode: v })}
                  />
                </SettingRow>

                <SettingRow label="Background Mode">
                  <ToggleGroup
                    options={[
                      { value: 'weather', label: 'Weather' },
                      { value: 'solid', label: 'Solid' },
                    ]}
                    value={displaySettings.backgroundMode || 'weather'}
                    onChange={(v) =>
                      updateDisplaySettings({ backgroundMode: v as 'weather' | 'solid' })
                    }
                  />
                </SettingRow>

                {displaySettings.backgroundMode === 'solid' && (
                  <div className="ml-4 pl-4 border-l-2 border-white/10">
                    <SettingRow label="Background Color">
                      <ColorPicker
                        value={displaySettings.solidBackgroundColor || '#0a0a1a'}
                        onChange={(v) => updateDisplaySettings({ solidBackgroundColor: v })}
                      />
                    </SettingRow>
                    <div className="mt-3">
                      <div className="text-white/40 text-xs mb-2">Color Presets</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { color: '#0a0a1a', name: 'Deep Blue' },
                          { color: '#000000', name: 'Black' },
                          { color: '#1a1a2e', name: 'Dark Navy' },
                          { color: '#16213e', name: 'Midnight' },
                          { color: '#0f3460', name: 'Ocean' },
                          { color: '#1b1b1b', name: 'Charcoal' },
                          { color: '#2d132c', name: 'Dark Purple' },
                          { color: '#0d1b2a', name: 'Night Sky' },
                        ].map((preset) => (
                          <button
                            key={preset.color}
                            onClick={() => updateDisplaySettings({ solidBackgroundColor: preset.color })}
                            className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-white/50 transition-colors"
                            style={{ backgroundColor: preset.color }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {displaySettings.backgroundMode !== 'solid' && (
                  <SettingRow label="Background Opacity">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={displaySettings.backgroundOpacity ?? 50}
                        onChange={(e) =>
                          updateDisplaySettings({ backgroundOpacity: parseInt(e.target.value) })
                        }
                        className="w-20 accent-blue-500"
                      />
                      <span className="text-white/50 text-sm w-10">
                        {displaySettings.backgroundOpacity ?? 50}%
                      </span>
                    </div>
                  </SettingRow>
                )}

                <SettingRow label="Auto Dim">
                  <Toggle
                    checked={displaySettings.autoDim}
                    onChange={(v) => updateDisplaySettings({ autoDim: v })}
                  />
                </SettingRow>

                {displaySettings.autoDim && (
                  <div className="ml-4 pl-4 border-l-2 border-white/10 space-y-4">
                    <SettingRow label="Dim Level">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.2"
                          max="0.9"
                          step="0.1"
                          value={displaySettings.dimLevel}
                          onChange={(e) =>
                            updateDisplaySettings({ dimLevel: parseFloat(e.target.value) })
                          }
                          className="w-20 accent-blue-500"
                        />
                        <span className="text-white/50 text-sm w-10">
                          {Math.round(displaySettings.dimLevel * 100)}%
                        </span>
                      </div>
                    </SettingRow>

                    <SettingRow label="Hours">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={displaySettings.dimStartHour}
                          onChange={(e) =>
                            updateDisplaySettings({ dimStartHour: parseInt(e.target.value) })
                          }
                          className="w-14 bg-white/10 text-white text-center rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <span className="text-white/40">to</span>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={displaySettings.dimEndHour}
                          onChange={(e) =>
                            updateDisplaySettings({ dimEndHour: parseInt(e.target.value) })
                          }
                          className="w-14 bg-white/10 text-white text-center rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </SettingRow>
                  </div>
                )}

                <SettingRow label="Burn-in Prevention">
                  <Toggle
                    checked={displaySettings.burnInPrevention}
                    onChange={(v) => updateDisplaySettings({ burnInPrevention: v })}
                  />
                </SettingRow>
              </SettingsSection>

              {/* Keyboard Shortcuts */}
              <SettingsSection icon={<Keyboard className="w-5 h-5" />} title="Shortcuts">
                <div className="space-y-3">
                  <ShortcutRow label="Toggle Settings" keys="S" />
                  <ShortcutRow label="Toggle Focus Mode" keys="F" />
                  <ShortcutRow label="Close / Exit" keys="Esc" />
                </div>
              </SettingsSection>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 text-center">
              <p className="text-white/30 text-xs">Ambient Clock v1.0</p>
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
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-blue-400">{icon}</span>
        <h3 className="text-lg font-medium text-white">{title}</h3>
      </div>
      <div className="space-y-4 pl-8">{children}</div>
    </div>
  );
}

interface SettingRowProps {
  label: string;
  children: React.ReactNode;
}

function SettingRow({ label, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/70 text-sm">{label}</span>
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
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-blue-500' : 'bg-white/20'
      }`}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
        animate={{ left: checked ? 22 : 2 }}
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
    <div className="flex bg-white/10 rounded-lg p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
            value === option.value
              ? 'bg-blue-500 text-white'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  wide?: boolean;
}

function Select({ value, onChange, options, wide }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-white/10 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer ${
        wide ? 'w-44' : 'w-32'
      }`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-slate-800">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border-2 border-white/20"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
            onChange(e.target.value);
          }
        }}
        className="w-20 bg-white/10 text-white text-xs rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
        placeholder="#ffffff"
      />
    </div>
  );
}

interface ShortcutRowProps {
  label: string;
  keys: string;
}

function ShortcutRow({ label, keys }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50 text-sm">{label}</span>
      <kbd className="px-2 py-1 bg-white/10 rounded text-white/70 text-xs font-mono">
        {keys}
      </kbd>
    </div>
  );
}
