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

// Weather background images - 5 per condition for variety (6 conditions × 2 day/night × 5 = 60 total)
const WEATHER_BACKGROUNDS = {
  // Night backgrounds - Clear (5)
  clearNight: [
    'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
    'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=1920&q=80',
    'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?w=1920&q=80',
    'https://images.unsplash.com/photo-1532074534361-bb09a38cf917?w=1920&q=80',
  ],
  // Night backgrounds - Cloudy (5)
  cloudyNight: [
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80',
    'https://images.unsplash.com/photo-1499956827185-0d63ee78a910?w=1920&q=80',
    'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1920&q=80',
    'https://images.unsplash.com/photo-1513996267097-1e00a7b5a5b7?w=1920&q=80',
    'https://images.unsplash.com/photo-1500740516770-92bd004b996e?w=1920&q=80',
  ],
  // Night backgrounds - Rainy (5)
  rainyNight: [
    'https://images.unsplash.com/photo-1501999635878-71cb5379c2d8?w=1920&q=80',
    'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=80',
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=80',
    'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?w=1920&q=80',
    'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1920&q=80',
  ],
  // Night backgrounds - Thunder (5)
  thunderNight: [
    'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1920&q=80',
    'https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?w=1920&q=80',
    'https://images.unsplash.com/photo-1429552077091-836152271555?w=1920&q=80',
    'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?w=1920&q=80',
    'https://images.unsplash.com/photo-1594156596782-656c93e4d504?w=1920&q=80',
  ],
  // Night backgrounds - Snow (5)
  snowNight: [
    'https://images.unsplash.com/photo-1478265409131-1f65c88f965c?w=1920&q=80',
    'https://images.unsplash.com/photo-1516715094483-75da7dee9758?w=1920&q=80',
    'https://images.unsplash.com/photo-1511131341194-24e2eeeebb09?w=1920&q=80',
    'https://images.unsplash.com/photo-1548777123-e216912df7d8?w=1920&q=80',
    'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=1920&q=80',
  ],
  // Night backgrounds - Foggy (5)
  foggyNight: [
    'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1920&q=80',
    'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?w=1920&q=80',
    'https://images.unsplash.com/photo-1544084944-15269ec7b5a0?w=1920&q=80',
    'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=1920&q=80',
    'https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=1920&q=80',
  ],
  // Day backgrounds - Clear (5)
  clearDay: [
    'https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1920&q=80',
    'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=1920&q=80',
    'https://images.unsplash.com/photo-1558418294-9da149757efe?w=1920&q=80',
    'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?w=1920&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
  ],
  // Day backgrounds - Partly Cloudy (5)
  partlyCloudyDay: [
    'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80',
    'https://images.unsplash.com/photo-1500740516770-92bd004b996e?w=1920&q=80',
    'https://images.unsplash.com/photo-1504253163759-c23fccaebb55?w=1920&q=80',
    'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1920&q=80',
    'https://images.unsplash.com/photo-1530908295418-a12e326966ba?w=1920&q=80',
  ],
  // Day backgrounds - Cloudy (5)
  cloudyDay: [
    'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=1920&q=80',
    'https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?w=1920&q=80',
    'https://images.unsplash.com/photo-1536244636800-a3f74db0f3cf?w=1920&q=80',
    'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=1920&q=80',
    'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80',
  ],
  // Day backgrounds - Rainy (5)
  rainyDay: [
    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=80',
    'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=80',
    'https://images.unsplash.com/photo-1433863448220-78aaa064ff47?w=1920&q=80',
    'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1920&q=80',
    'https://images.unsplash.com/photo-1438449805896-28a666819a20?w=1920&q=80',
  ],
  // Day backgrounds - Thunder (5)
  thunderDay: [
    'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1920&q=80',
    'https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?w=1920&q=80',
    'https://images.unsplash.com/photo-1429552077091-836152271555?w=1920&q=80',
    'https://images.unsplash.com/photo-1492011221367-f47e3ccd77a0?w=1920&q=80',
    'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1920&q=80',
  ],
  // Day backgrounds - Snow (5)
  snowDay: [
    'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80',
    'https://images.unsplash.com/photo-1457269449834-928af64c684d?w=1920&q=80',
    'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1920&q=80',
    'https://images.unsplash.com/photo-1478265409131-1f65c88f965c?w=1920&q=80',
    'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=1920&q=80',
  ],
  // Day backgrounds - Foggy (5)
  foggyDay: [
    'https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1920&q=80',
    'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?w=1920&q=80',
    'https://images.unsplash.com/photo-1544084944-15269ec7b5a0?w=1920&q=80',
    'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=1920&q=80',
    'https://images.unsplash.com/photo-1543968996-ee822b8176ba?w=1920&q=80',
  ],
};

// Get session-based index that changes every 5 minutes (for background images)
function getBackgroundSessionIndex(): number {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  return Math.floor(now / fiveMinutes);
}

// Get unique image without repetition
function pickUniqueImage(images: string[], weatherCode: string, sessionIndex: number): string {
  // Use session index to ensure change every 6 hours
  const hash = (sessionIndex + weatherCode.charCodeAt(0)) % images.length;
  return images[hash];
}

export function getWeatherBackgroundImage(
  weatherCode: string,
  isNight: boolean
): string {
  const code = weatherCode?.toLowerCase() || '';
  const sessionIndex = getBackgroundSessionIndex();

  // Night backgrounds
  if (isNight) {
    if (code.includes('clear')) {
      return pickUniqueImage(WEATHER_BACKGROUNDS.clearNight, code, sessionIndex);
    }
    if (code.includes('cloud')) {
      return pickUniqueImage(WEATHER_BACKGROUNDS.cloudyNight, code, sessionIndex);
    }
    if (code.includes('rain') || code.includes('drizzle')) {
      return pickUniqueImage(WEATHER_BACKGROUNDS.rainyNight, code, sessionIndex);
    }
    if (code.includes('thunder')) {
      return pickUniqueImage(WEATHER_BACKGROUNDS.thunderNight, code, sessionIndex);
    }
    if (code.includes('snow')) {
      return pickUniqueImage(WEATHER_BACKGROUNDS.snowNight, code, sessionIndex);
    }
    if (code.includes('mist') || code.includes('fog') || code.includes('haze')) {
      return pickUniqueImage(WEATHER_BACKGROUNDS.foggyNight, code, sessionIndex);
    }
    // Default night
    return pickUniqueImage(WEATHER_BACKGROUNDS.clearNight, code, sessionIndex);
  }

  // Day backgrounds
  if (code.includes('clear') || code.includes('sun')) {
    return pickUniqueImage(WEATHER_BACKGROUNDS.clearDay, code, sessionIndex);
  }
  if (code.includes('few') || code.includes('scattered')) {
    return pickUniqueImage(WEATHER_BACKGROUNDS.partlyCloudyDay, code, sessionIndex);
  }
  if (code.includes('cloud') || code.includes('overcast') || code.includes('broken')) {
    return pickUniqueImage(WEATHER_BACKGROUNDS.cloudyDay, code, sessionIndex);
  }
  if (code.includes('rain') || code.includes('drizzle')) {
    return pickUniqueImage(WEATHER_BACKGROUNDS.rainyDay, code, sessionIndex);
  }
  if (code.includes('thunder')) {
    return pickUniqueImage(WEATHER_BACKGROUNDS.thunderDay, code, sessionIndex);
  }
  if (code.includes('snow')) {
    return pickUniqueImage(WEATHER_BACKGROUNDS.snowDay, code, sessionIndex);
  }
  if (code.includes('mist') || code.includes('fog') || code.includes('haze')) {
    return pickUniqueImage(WEATHER_BACKGROUNDS.foggyDay, code, sessionIndex);
  }

  // Default day
  return pickUniqueImage(WEATHER_BACKGROUNDS.clearDay, code, sessionIndex);
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
  sunset?: number,
  timezoneOffset?: number
): boolean {
  if (sunrise && sunset) {
    // Use actual UTC timestamps for accurate comparison
    const now = Date.now() / 1000; // Current time in seconds
    const sunriseTime = sunrise;
    const sunsetTime = sunset;

    // It's night if current time is before sunrise or after sunset
    return now < sunriseTime || now >= sunsetTime;
  }

  // Fallback: use hour-based check with timezone offset if available
  if (timezoneOffset !== undefined) {
    const utcHour = new Date().getUTCHours();
    const localHour = (utcHour + Math.round(timezoneOffset / 3600) + 24) % 24;
    return localHour < 6 || localHour >= 20;
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

// Map timezone offset to IANA timezone name
export function getTimezoneFromOffset(offsetHours: number, lat: number): string {
  // Common timezone mappings based on offset and rough latitude
  const timezoneMap: Record<number, string[]> = {
    [-12]: ['Etc/GMT+12'],
    [-11]: ['Pacific/Midway'],
    [-10]: ['Pacific/Honolulu'],
    [-9]: ['America/Anchorage'],
    [-8]: ['America/Los_Angeles'],
    [-7]: ['America/Denver', 'America/Phoenix'],
    [-6]: ['America/Chicago', 'America/Mexico_City'],
    [-5]: ['America/New_York', 'America/Toronto'],
    [-4]: ['America/Halifax', 'America/Caracas'],
    [-3]: ['America/Sao_Paulo', 'America/Buenos_Aires'],
    [-2]: ['Etc/GMT+2'],
    [-1]: ['Atlantic/Azores'],
    [0]: ['Europe/London', 'UTC'],
    [1]: ['Europe/Paris', 'Europe/Berlin'],
    [2]: ['Europe/Helsinki', 'Africa/Cairo'],
    [3]: ['Europe/Moscow', 'Asia/Baghdad'],
    [3.5]: ['Asia/Tehran'],
    [4]: ['Asia/Dubai', 'Asia/Baku'],
    [4.5]: ['Asia/Kabul'],
    [5]: ['Asia/Karachi', 'Asia/Tashkent'],
    [5.5]: ['Asia/Kolkata', 'Asia/Colombo'],
    [5.75]: ['Asia/Kathmandu'],
    [6]: ['Asia/Dhaka', 'Asia/Almaty'],
    [6.5]: ['Asia/Yangon'],
    [7]: ['Asia/Bangkok', 'Asia/Jakarta'],
    [8]: ['Asia/Shanghai', 'Asia/Singapore', 'Asia/Hong_Kong'],
    [9]: ['Asia/Tokyo', 'Asia/Seoul'],
    [9.5]: ['Australia/Darwin', 'Australia/Adelaide'],
    [10]: ['Australia/Sydney', 'Pacific/Guam'],
    [11]: ['Pacific/Noumea'],
    [12]: ['Pacific/Auckland', 'Pacific/Fiji'],
  };

  const zones = timezoneMap[offsetHours];
  if (zones && zones.length > 0) {
    // Try to pick based on hemisphere using latitude
    if (lat < -20 && zones.some(z => z.includes('Australia') || z.includes('Pacific'))) {
      return zones.find(z => z.includes('Australia') || z.includes('Pacific')) || zones[0];
    }
    return zones[0];
  }

  // Fallback: construct Etc/GMT timezone (note: Etc/GMT signs are inverted)
  const sign = offsetHours >= 0 ? '-' : '+';
  return `Etc/GMT${sign}${Math.abs(Math.round(offsetHours))}`;
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
