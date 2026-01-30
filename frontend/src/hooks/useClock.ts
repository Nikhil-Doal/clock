'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import { formatTime, formatDate, shouldDim } from '@/lib/utils';

export function useClock() {
  const { clockSettings, displaySettings } = useAppStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, clockSettings.showSeconds ? 1000 : 1000);

    return () => clearInterval(interval);
  }, [clockSettings.showSeconds]);

  const formattedTime = formatTime(
    time,
    clockSettings.timeFormat,
    clockSettings.showSeconds,
    clockSettings.timezone
  );

  const formattedDate = formatDate(time, clockSettings.timezone);

  const getCurrentHour = useCallback(() => {
    return new Date().toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: clockSettings.timezone,
    });
  }, [clockSettings.timezone]);

  const currentHour = parseInt(getCurrentHour());

  const isDimmed = shouldDim(
    currentHour,
    displaySettings.dimStartHour,
    displaySettings.dimEndHour,
    displaySettings.autoDim
  );

  return {
    time,
    formattedTime,
    formattedDate,
    currentHour,
    isDimmed,
    dimLevel: displaySettings.dimLevel,
  };
}
