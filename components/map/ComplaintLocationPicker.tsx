'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BUTUAN_CITY_CENTER } from '@/lib/constants';
import { MapPin, Navigation, RotateCcw, AlertCircle } from 'lucide-react';

interface ComplaintLocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  barangayCoordinates?: { lat: number; lng: number } | null;
  onChange: (lat: number | null, lng: number | null) => void;
}

export default function ComplaintLocationPicker({
  initialLat,
  initialLng,
  barangayCoordinates,
  onChange,
}: ComplaintLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Leaflet map dynamically
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      // Load Leaflet CSS dynamically if not present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      // Avoid re-initializing if map already exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Fix Leaflet marker icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const startLat = initialLat || BUTUAN_CITY_CENTER.lat;
      const startLng = initialLng || BUTUAN_CITY_CENTER.lng;

      const map = L.map(mapContainerRef.current, {
        center: [startLat, startLng],
        zoom: BUTUAN_CITY_CENTER.zoom,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsMapReady(true);

      // Create initial marker if coordinates provided
      if (initialLat && initialLng) {
        const marker = L.marker([initialLat, initialLng], {
          draggable: true,
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          const newCoords = {
            lat: Number(pos.lat.toFixed(6)),
            lng: Number(pos.lng.toFixed(6)),
          };
          setCoords(newCoords);
          onChange(newCoords.lat, newCoords.lng);
        });

        markerRef.current = marker;
      }

      // Handle map clicks
      map.on('click', (e: any) => {
        const clickedLat = Number(e.latlng.lat.toFixed(6));
        const clickedLng = Number(e.latlng.lng.toFixed(6));

        if (markerRef.current) {
          markerRef.current.setLatLng([clickedLat, clickedLng]);
        } else {
          const marker = L.marker([clickedLat, clickedLng], {
            draggable: true,
          }).addTo(map);

          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            const newCoords = {
              lat: Number(pos.lat.toFixed(6)),
              lng: Number(pos.lng.toFixed(6)),
            };
            setCoords(newCoords);
            onChange(newCoords.lat, newCoords.lng);
          });

          markerRef.current = marker;
        }

        setCoords({ lat: clickedLat, lng: clickedLng });
        onChange(clickedLat, clickedLng);
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Pan when barangay changes in dropdown
  useEffect(() => {
    if (barangayCoordinates && mapInstanceRef.current && isMapReady) {
      mapInstanceRef.current.setView(
        [barangayCoordinates.lat, barangayCoordinates.lng],
        15,
        { animate: true }
      );
    }
  }, [barangayCoordinates, isMapReady]);

  // Geolocation button handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeoLoading(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setCoords({ lat, lng });
        onChange(lat, lng);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16, { animate: true });

          const L = await import('leaflet');
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            const marker = L.marker([lat, lng], { draggable: true }).addTo(
              mapInstanceRef.current
            );
            marker.on('dragend', () => {
              const p = marker.getLatLng();
              const c = {
                lat: Number(p.lat.toFixed(6)),
                lng: Number(p.lng.toFixed(6)),
              };
              setCoords(c);
              onChange(c.lat, c.lng);
            });
            markerRef.current = marker;
          }
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError(
            'Location access was denied. You can still click or drag on the map manually.'
          );
        } else {
          setGeoError('Unable to retrieve your location. Please select on the map.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleClearLocation = () => {
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    setCoords(null);
    onChange(null, null);
    setGeoError(null);
  };

  return (
    <div className="space-y-3">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          {coords ? (
            <span className="font-mono text-slate-700 dark:text-slate-200">
              Selected: <strong className="text-emerald-700 dark:text-emerald-400">{coords.lat}</strong>,{' '}
              <strong className="text-emerald-700 dark:text-emerald-400">{coords.lng}</strong>
            </span>
          ) : (
            <span className="text-slate-500 italic">
              Click anywhere on the map or drag the pin to set location (Optional)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium shadow-xs transition-colors disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 text-blue-600 ${geoLoading ? 'animate-spin' : ''}`} />
            {geoLoading ? 'Detecting...' : 'Use My Location'}
          </button>

          {coords && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {geoError && (
        <div className="flex items-center gap-2 p-2 text-xs rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map Element */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
        <div
          ref={mapContainerRef}
          className="w-full h-[320px] sm:h-[380px] bg-slate-100 dark:bg-slate-900 z-0"
        />
        <div className="absolute bottom-2 left-2 z-1000 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 pointer-events-none">
          Click or drag marker to pinpoint concern area
        </div>
      </div>
    </div>
  );
}
