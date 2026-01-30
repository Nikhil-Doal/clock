export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  description: string;
  icon: string;
  uvi?: number;
  visibility?: number;
  clouds?: number;
  sunrise?: number;
  sunset?: number;
}

export interface HourlyForecast {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  weather: { description: string; icon: string }[];
  pop: number;
}

export interface DailyForecast {
  dt: number;
  temp: { min: number; max: number; day: number };
  feels_like: { day: number };
  humidity: number;
  weather: { description: string; icon: string }[];
  pop: number;
  uvi: number;
  sunrise: number;
  sunset: number;
}

export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
}

export interface Location {
  lat: number;
  lon: number;
  name: string;
  country?: string;
}

export interface AstronomyData {
  sun: {
    declination: number;
    day_length_hours: number;
  };
  moon: {
    phase: number;
    age_days: number;
    phase_name: string;
    illumination: number;
  };
}

export interface AirQuality {
  aqi: number;
  components: {
    co: number;
    no2: number;
    o3: number;
    pm2_5: number;
    pm10: number;
  };
}

export type ClockFont = 'mono' | 'rounded' | 'futuristic' | 'default';
export type TimeFormat = '12h' | '24h';
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type AISummaryStyle = 'friendly' | 'scientific' | 'eli5';

export interface ClockSettings {
  font: ClockFont;
  showSeconds: boolean;
  timeFormat: TimeFormat;
  showDate: boolean;
  showGlow: boolean;
  timezone: string;
}

export interface WeatherSettings {
  units: TemperatureUnit;
  showFeelsLike: boolean;
  showHourlyForecast: boolean;
  showDailyForecast: boolean;
  showAirQuality: boolean;
  showAlerts: boolean;
}

export interface DisplaySettings {
  autoDim: boolean;
  dimStartHour: number;
  dimEndHour: number;
  dimLevel: number;
  focusMode: boolean;
  showWeather: boolean;
  showAstronomy: boolean;
  burnInPrevention: boolean;
  backgroundMode: 'solid' | 'gradient' | 'weather';
}

export interface WorldClock {
  id: string;
  timezone: string;
  label: string;
}
