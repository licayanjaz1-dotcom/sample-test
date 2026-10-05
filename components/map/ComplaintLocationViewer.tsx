'use client';

import React, { useEffect, useRef } from 'react';
import { BUTUAN_CITY_CENTER } from '@/lib/constants';
import { MapPin, Navigation2 } from 'lucide-react';

interface ComplaintLocationViewerProps {
  latitude?: number | null;
  longitude?: number | null;
  barangayName?: string;
  landmark?: string | null;
  street?: string | null;
}

export default function ComplaintLocationViewer({
  latitude,
  longitude,
  barangayName,
  landmark,
  street,
}: ComplaintLocationViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
  const displayLat = hasCoords ? latitude! : BUTUAN_CITY_CENTER.lat;
  const displayLng = hasCoords ? longitude! : BUTUAN_CITY_CENTER.lng;

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current, {
        center: [displayLat, displayLng],
        zoom: hasCoords ? 16 : BUTUAN_CITY_CENTER.zoom,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      if (hasCoords) {
        const marker = L.marker([displayLat, displayLng]).addTo(map);
        const popupContent = `
          <div style="font-family: inherit; font-size: 13px;">
            <strong style="color: #0f172a;">${barangayName || 'Complaint Site'}</strong>
            ${landmark ? `<div style="color: #475569; margin-top: 4px;">Landmark: ${landmark}</div>` : ''}
            ${street ? `<div style="color: #64748b;">Street: ${street}</div>` : ''}
            <div style="color: #059669; font-weight: 500; font-size: 11px; margin-top: 4px;">
              Lat: ${displayLat}, Lng: ${displayLng}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent).openPopup();
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [displayLat, displayLng, hasCoords, barangayName, landmark, street]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {hasCoords
              ? `GPS Coordinates: ${displayLat}, ${displayLng}`
              : 'Approximate Barangay Location Map'}
          </span>
        </div>
        {hasCoords && (
          <a
            href={`https://www.openstreetmap.org/?mlat=${displayLat}&mlon=${displayLng}#map=17/${displayLat}/${displayLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
          >
            <Navigation2 className="w-3 h-3" />
            Open on OSM
          </a>
        )}
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
        <div
          ref={mapContainerRef}
          className="w-full h-[280px] bg-slate-100 dark:bg-slate-900 z-0"
        />
      </div>
    </div>
  );
}
