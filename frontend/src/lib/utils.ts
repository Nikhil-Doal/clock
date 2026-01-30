import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTemperature(
  temp: number,
  unit: 'celsius' | 'fahrenheit'
): string {
  if (unit === 'fahrenheit') {
    return `${Math.round((temp * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(temp)}°C`;
}

export function getWeatherGradient(
  weatherCode: string,
  isNight: boolean
): string {
  const code = weatherCode?.toLowerCase() || '';

  if (isNight) {
    if (code.includes('clear')) {
      return 'from-indigo-950 via-purple-950 to-slate-950';
    }
    if (code.includes('cloud')) {
      return 'from-slate-900 via-gray-900 to-slate-950';
    }
    if (code.includes('rain') || code.includes('drizzle')) {
      return 'from-slate-950 via-blue-950 to-indigo-950';
    }
    if (code.includes('thunder')) {
      return 'from-purple-950 via-slate-950 to-indigo-950';
    }
    if (code.includes('snow')) {
      return 'from-slate-800 via-blue-950 to-indigo-950';
    }
    return 'from-slate-950 via-indigo-950 to-purple-950';
  }

  // Daytime colors - more vibrant
  if (code.includes('clear') || code.includes('sun')) {
    return 'from-sky-400 via-blue-500 to-cyan-600';
  }
  if (code.includes('cloud') && code.includes('few')) {
    return 'from-sky-400 via-blue-400 to-indigo-500';
  }
  if (code.includes('cloud') && code.includes('scattered')) {
    return 'from-blue-400 via-slate-400 to-blue-500';
  }
  if (code.includes('cloud') || code.includes('overcast')) {
    return 'from-slate-500 via-gray-500 to-slate-600';
  }
  if (code.includes('rain') || code.includes('drizzle')) {
    return 'from-slate-600 via-blue-700 to-indigo-800';
  }
  if (code.includes('thunder')) {
    return 'from-slate-700 via-purple-800 to-indigo-900';
  }
  if (code.includes('snow')) {
    return 'from-slate-400 via-blue-300 to-slate-500';
  }
  if (code.includes('mist') || code.includes('fog') || code.includes('haze')) {
    return 'from-gray-500 via-slate-500 to-gray-600';
  }

  // Default daytime
  return 'from-sky-500 via-blue-600 to-indigo-700';
}

export function getWeatherIcon(code: string, isNight: boolean): string {
  const iconMap: Record<string, string> = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '☁️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌦️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '❄️',
    '13n': '❄️',
    '50d': '🌫️',
    '50n': '🌫️',
  };

  return iconMap[code] || (isNight ? '🌙' : '☀️');
}

export function getMoonPhaseIcon(phase: number): string {
  if (phase < 0.0625 || phase >= 0.9375) return '🌑';
  if (phase < 0.1875) return '🌒';
  if (phase < 0.3125) return '🌓';
  if (phase < 0.4375) return '🌔';
  if (phase < 0.5625) return '🌕';
  if (phase < 0.6875) return '🌖';
  if (phase < 0.8125) return '🌗';
  return '🌘';
}

export function isNightTime(
  currentHour: number,
  sunrise?: number,
  sunset?: number
): boolean {
  if (sunrise && sunset) {
    const sunriseHour = new Date(sunrise * 1000).getHours();
    const sunsetHour = new Date(sunset * 1000).getHours();
    return currentHour < sunriseHour || currentHour >= sunsetHour;
  }
  return currentHour < 6 || currentHour >= 20;
}

export function shouldDim(
  currentHour: number,
  startHour: number,
  endHour: number,
  enabled: boolean
): boolean {
  if (!enabled) return false;
  if (startHour > endHour) {
    return currentHour >= startHour || currentHour < endHour;
  }
  return currentHour >= startHour && currentHour < endHour;
}

export function formatTime(
  date: Date,
  format: '12h' | '24h',
  showSeconds: boolean,
  timezone?: string
): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12h',
    timeZone: timezone,
  };

  if (showSeconds) {
    options.second = '2-digit';
  }

  return date.toLocaleTimeString('en-US', options);
}

export function formatDate(date: Date, timezone?: string): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  });
}

export function getAQILevel(aqi: number): { label: string; color: string } {
  if (aqi === 1) return { label: 'Good', color: 'text-green-400' };
  if (aqi === 2) return { label: 'Fair', color: 'text-yellow-400' };
  if (aqi === 3) return { label: 'Moderate', color: 'text-orange-400' };
  if (aqi === 4) return { label: 'Poor', color: 'text-red-400' };
  return { label: 'Very Poor', color: 'text-purple-400' };
}

export function getUVLevel(uvi: number): { label: string; color: string } {
  if (uvi <= 2) return { label: 'Low', color: 'text-green-400' };
  if (uvi <= 5) return { label: 'Moderate', color: 'text-yellow-400' };
  if (uvi <= 7) return { label: 'High', color: 'text-orange-400' };
  if (uvi <= 10) return { label: 'Very High', color: 'text-red-400' };
  return { label: 'Extreme', color: 'text-purple-400' };
}

export const TIMEZONES = [
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Chicago', label: 'Chicago (CST)' },
  { value: 'America/Denver', label: 'Denver (MST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'America/Anchorage', label: 'Anchorage (AKST)' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (HST)' },
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
