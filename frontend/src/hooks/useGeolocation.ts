'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/store';

export function useGeolocation() {
  const { location, setLocation, setError } = useAppStore();
  const hasRequested = useRef(false);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      // Set a default location (Mississauga) as fallback
      setLocation({
        lat: 43.5890,
        lon: -79.6441,
        name: 'Mississauga',
        country: 'CA',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try to get city name from reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                'User-Agent': 'AmbientClock/1.0',
              },
            }
          );
          const data = await response.json();
          const city = data.address?.city ||
                       data.address?.town ||
                       data.address?.village ||
                       data.address?.municipality ||
                       data.address?.county ||
                       'Current Location';
          const country = data.address?.country_code?.toUpperCase();

          setLocation({
            lat: latitude,
            lon: longitude,
            name: city,
            country,
          });
        } catch {
          // Fallback without city name
          setLocation({
            lat: latitude,
            lon: longitude,
            name: 'Current Location',
          });
        }
      },
      (error) => {
        // Set default location on error
        const defaultLocation = {
          lat: 43.5890,
          lon: -79.6441,
          name: 'Mississauga',
          country: 'CA',
        };

        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log('Location permission denied, using default');
            setLocation(defaultLocation);
            break;
          case error.POSITION_UNAVAILABLE:
            console.log('Location unavailable, using default');
            setLocation(defaultLocation);
            break;
          case error.TIMEOUT:
            console.log('Location timeout, using default');
            setLocation(defaultLocation);
            break;
          default:
            setLocation(defaultLocation);
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [setLocation, setError]);

  // Request location on mount
  useEffect(() => {
    if (!hasRequested.current) {
      hasRequested.current = true;
      // Always request fresh location on app load
      requestLocation();
    }
  }, [requestLocation]);

  return {
    location,
    requestLocation,
  };
}
