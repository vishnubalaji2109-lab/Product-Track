import { useCallback, useEffect, useState } from 'react';
import { LocationData } from '../types/qr';

interface GeolocationState {
  location: LocationData | null;
  error: string | null;
  isLoading: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unsupported';
}

export const useGeolocation = (autoCapture: boolean = false) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false,
    permissionStatus: 'prompt',
  });

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        permissionStatus: 'unsupported',
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
          timestamp: new Date(position.timestamp).toISOString(),
        };

        setState({
          location: locationData,
          error: null,
          isLoading: false,
          permissionStatus: 'granted',
        });
      },
      (geoError) => {
        let errorMsg = 'Failed to capture location.';
        let permission: 'denied' | 'prompt' = 'prompt';

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorMsg =
              'Location permission was denied. Please allow location access in your browser settings to continue.';
            permission = 'denied';
            break;
          case geoError.POSITION_UNAVAILABLE:
            errorMsg =
              'Location information is currently unavailable. Please check your network or GPS.';
            break;
          case geoError.TIMEOUT:
            errorMsg = 'The request to obtain user location timed out. Please retry.';
            break;
        }

        setState({
          location: null,
          error: errorMsg,
          isLoading: false,
          permissionStatus: permission,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Helper to inject mock coordinates for desktop testing or if user desires simulated location
  const setSimulatedLocation = useCallback(
    (coords?: { lat: number; lng: number; accuracy?: number }) => {
      const defaultCoords = coords || { lat: 12.9716, lng: 77.5946, accuracy: 15 };
      const simulated: LocationData = {
        latitude: defaultCoords.lat,
        longitude: defaultCoords.lng,
        accuracy: defaultCoords.accuracy || 15,
        timestamp: new Date().toISOString(),
      };
      setState({
        location: simulated,
        error: null,
        isLoading: false,
        permissionStatus: 'granted',
      });
    },
    []
  );

  useEffect(() => {
    if (autoCapture) {
      captureLocation();
    }
  }, [autoCapture, captureLocation]);

  return {
    ...state,
    captureLocation,
    setSimulatedLocation,
  };
};

export default useGeolocation;
