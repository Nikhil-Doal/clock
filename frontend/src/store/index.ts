import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WeatherData,
  HourlyForecast,
  DailyForecast,
  WeatherAlert,
  Location,
  AstronomyData,
  AirQuality,
  ClockSettings,
  WeatherSettings,
  DisplaySettings,
  WorldClock,
} from '@/types';

interface AppState {
  // Location
  location: Location | null;
  setLocation: (location: Location) => void;

  // Weather data
  currentWeather: WeatherData | null;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  alerts: WeatherAlert[];
  astronomy: AstronomyData | null;
  airQuality: AirQuality | null;
  aiSummary: string | null;
  lastWeatherUpdate: number | null;
  setCurrentWeather: (weather: WeatherData) => void;
  setHourlyForecast: (forecast: HourlyForecast[]) => void;
  setDailyForecast: (forecast: DailyForecast[]) => void;
  setAlerts: (alerts: WeatherAlert[]) => void;
  setAstronomy: (astronomy: AstronomyData) => void;
  setAirQuality: (airQuality: AirQuality) => void;
  setAiSummary: (summary: string | null) => void;

  // Clock settings
  clockSettings: ClockSettings;
  updateClockSettings: (settings: Partial<ClockSettings>) => void;

  // Weather settings
  weatherSettings: WeatherSettings;
  updateWeatherSettings: (settings: Partial<WeatherSettings>) => void;

  // Display settings
  displaySettings: DisplaySettings;
  updateDisplaySettings: (settings: Partial<DisplaySettings>) => void;

  // World clocks
  worldClocks: WorldClock[];
  addWorldClock: (clock: WorldClock) => void;
  removeWorldClock: (id: string) => void;

  // UI state
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const defaultClockSettings: ClockSettings = {
  font: 'mono',
  showSeconds: false,
  timeFormat: '12h',
  showDate: true,
  showGlow: true,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  size: 5,
  color: '#ffffff',
  glowColor: '#ffffff',
};

const defaultWeatherSettings: WeatherSettings = {
  units: 'celsius',
  showFeelsLike: true,
  showHourlyForecast: true,
  showDailyForecast: true,
  showAirQuality: false,
  showAlerts: true,
};

const defaultDisplaySettings: DisplaySettings = {
  autoDim: false,
  dimStartHour: 22,
  dimEndHour: 6,
  dimLevel: 0.7,
  focusMode: false,
  showWeather: true,
  showAstronomy: true,
  showAirQuality: true,
  showWeatherPanel: false,
  burnInPrevention: false,
  backgroundMode: 'weather',
  backgroundOpacity: 50,
  solidBackgroundColor: '#0a0a1a',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Location
      location: null,
      setLocation: (location) => set({ location }),

      // Weather data
      currentWeather: null,
      hourlyForecast: [],
      dailyForecast: [],
      alerts: [],
      astronomy: null,
      airQuality: null,
      aiSummary: null,
      lastWeatherUpdate: null,
      setCurrentWeather: (weather) =>
        set({ currentWeather: weather, lastWeatherUpdate: Date.now() }),
      setHourlyForecast: (forecast) => set({ hourlyForecast: forecast }),
      setDailyForecast: (forecast) => set({ dailyForecast: forecast }),
      setAlerts: (alerts) => set({ alerts }),
      setAstronomy: (astronomy) => set({ astronomy }),
      setAirQuality: (airQuality) => set({ airQuality }),
      setAiSummary: (summary) => set({ aiSummary: summary }),

      // Clock settings
      clockSettings: defaultClockSettings,
      updateClockSettings: (settings) =>
        set((state) => ({
          clockSettings: { ...state.clockSettings, ...settings },
        })),

      // Weather settings
      weatherSettings: defaultWeatherSettings,
      updateWeatherSettings: (settings) =>
        set((state) => ({
          weatherSettings: { ...state.weatherSettings, ...settings },
        })),

      // Display settings
      displaySettings: defaultDisplaySettings,
      updateDisplaySettings: (settings) =>
        set((state) => ({
          displaySettings: { ...state.displaySettings, ...settings },
        })),

      // World clocks
      worldClocks: [],
      addWorldClock: (clock) =>
        set((state) => ({
          worldClocks: [...state.worldClocks, clock],
        })),
      removeWorldClock: (id) =>
        set((state) => ({
          worldClocks: state.worldClocks.filter((c) => c.id !== id),
        })),

      // UI state
      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'ambient-clock-storage',
      version: 8, // Added clock size/color, AQI, background opacity, world clock icons
      partialize: (state) => ({
        location: state.location,
        clockSettings: state.clockSettings,
        weatherSettings: state.weatherSettings,
        displaySettings: state.displaySettings,
        worldClocks: state.worldClocks,
      }),
      migrate: (persistedState, version) => {
        // Handle migrations from older versions
        const state = persistedState as Partial<AppState>;
        // Always return full state structure
        return {
          location: state.location ?? null,
          clockSettings: { ...defaultClockSettings, ...state.clockSettings },
          weatherSettings: { ...defaultWeatherSettings, ...state.weatherSettings },
          displaySettings: { ...defaultDisplaySettings, ...state.displaySettings },
          worldClocks: state.worldClocks || [],
        };
      },
    }
  )
);
