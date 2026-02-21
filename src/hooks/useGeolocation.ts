import { useState, useEffect } from 'react';

interface GeoData {
  lat: number;
  lng: number;
  address: string;
  mapsLink: string;
}

export function useGeolocation() {
  const [geo, setGeo] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;
      const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

      // Reverse geocoding via free API
      let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await res.json();
        if (data.display_name) {
          address = data.display_name;
        }
      } catch {
        // Use coordinate fallback
      }

      setGeo({ lat, lng, address, mapsLink });
    } catch (err: any) {
      setError(err.message || 'Location unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    const interval = setInterval(fetchLocation, 30000);
    return () => clearInterval(interval);
  }, []);

  return { geo, loading, error, refresh: fetchLocation };
}
