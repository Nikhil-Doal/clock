'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/store';
import * as api from '@/lib/api';
import type { WeatherData, HourlyForecast, DailyForecast } from '@/types';

const WEATHER_UPDATE_INTERVAL = 10 * 60 * 1000; // 10 minutes

export function useWeather() {
  const {
    location,
    weatherSettings,
    currentWeather,
    setCurrentWeather,
    setHourlyForecast,
    setDailyForecast,
    setAstronomy,
    setAirQuality,
    setIsLoading,
    setError,
  } = useAppStore();

  const fetchInProgress = useRef(false);
  const lastLocationRef = useRef<string | null>(null);

  const fetchWeatherData = useCallback(async (force = false) => {
    if (!location || fetchInProgress.current) return;

    // Create location key to detect changes
    const locationKey = `${location.lat},${location.lon}`;

    // Skip if same location and not forced and we have weather data
    if (!force && lastLocationRef.current === locationKey && currentWeather) {
      return;
    }

    lastLocationRef.current = locationKey;
    fetchInProgress.current = true;
    setIsLoading(true);
    setError(null);

    const units = weatherSettings.units === 'fahrenheit' ? 'imperial' : 'metric';

    try {
      // Fetch current weather
      const currentData = await api.getCurrentWeather(location.lat, location.lon, units);

      const weather: WeatherData = {
        temp: currentData.main.temp,
        feels_like: currentData.main.feels_like,
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        wind_speed: currentData.wind.speed,
        wind_deg: currentData.wind.deg,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        visibility: currentData.visibility,
        clouds: currentData.clouds?.all,
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset,
      };
      setCurrentWeather(weather);

      // Fetch forecast
      const forecastData = await api.getForecast(location.lat, location.lon, units);

      const hourly: HourlyForecast[] = forecastData.list.slice(0, 24).map((item: {
        dt: number;
        main: { temp: number; feels_like: number; humidity: number };
        weather: { description: string; icon: string }[];
        pop: number;
      }) => ({
        dt: item.dt,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        humidity: item.main.humidity,
        weather: item.weather,
        pop: item.pop,
      }));
      setHourlyForecast(hourly);

      // Extract daily forecast from 3-hour data
      const dailyMap = new Map<string, DailyForecast>();
      forecastData.list.forEach((item: {
        dt: number;
        main: { temp: number; feels_like: number; humidity: number };
        weather: { description: string; icon: string }[];
        pop: number;
      }) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            dt: item.dt,
            temp: { min: item.main.temp, max: item.main.temp, day: item.main.temp },
            feels_like: { day: item.main.feels_like },
            humidity: item.main.humidity,
            weather: item.weather,
            pop: item.pop,
            uvi: 0,
            sunrise: 0,
            sunset: 0,
          });
        } else {
          const existing = dailyMap.get(date)!;
          existing.temp.min = Math.min(existing.temp.min, item.main.temp);
          existing.temp.max = Math.max(existing.temp.max, item.main.temp);
          existing.pop = Math.max(existing.pop, item.pop);
        }
      });
      setDailyForecast(Array.from(dailyMap.values()).slice(0, 7));

      // Fetch astronomy data
      try {
        const astronomyData = await api.getAstronomy(location.lat, location.lon);
        setAstronomy(astronomyData);
      } catch {
        // Astronomy is optional
      }

      // Fetch air quality if enabled
      if (weatherSettings.showAirQuality) {
        try {
          const aqData = await api.getAirQuality(location.lat, location.lon);
          if (aqData.list?.[0]) {
            setAirQuality({
              aqi: aqData.list[0].main.aqi,
              components: aqData.list[0].components,
            });
          }
        } catch {
          // Air quality is optional
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [
    location,
    currentWeather,
    weatherSettings.units,
    weatherSettings.showAirQuality,
    setCurrentWeather,
    setHourlyForecast,
    setDailyForecast,
    setAstronomy,
    setAirQuality,
    setIsLoading,
    setError,
  ]);

  // Fetch when location changes
  useEffect(() => {
    if (location) {
      fetchWeatherData(true); // Force fetch on location change
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lon]);

  // Periodic updates
  useEffect(() => {
    if (location && currentWeather) {
      const interval = setInterval(() => fetchWeatherData(true), WEATHER_UPDATE_INTERVAL);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, currentWeather]);

  return {
    currentWeather,
    fetchWeatherData,
  };
}
