'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Complaint, ComplaintStatus } from '@/lib/types';
import { BUTUAN_CITY_CENTER } from '@/lib/constants';
import Link from 'next/link';
import { MapPin, Filter, Layers, ExternalLink } from 'lucide-react';

interface CityOverviewMapProps {
  complaints: Complaint[];
}

export default function CityOverviewMap({ complaints }: CityOverviewMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const complaintsWithCoords = complaints.filter(
    (c) =>
      typeof c.location?.latitude === 'number' &&
      typeof c.location?.longitude === 'number'
  );

  const filteredComplaints =
    statusFilter === 'ALL'
      ? complaintsWithCoords
      : complaintsWithCoords.filter((c) => c.status === statusFilter);

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
        center: [BUTUAN_CITY_CENTER.lat, BUTUAN_CITY_CENTER.lng],
        zoom: BUTUAN_CITY_CENTER.zoom,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      renderMarkers(L, map, markersLayer, filteredComplaints);
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

  // Update markers when filtered complaints change
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      const L = await import('leaflet');
      markersLayerRef.current.clearLayers();
      renderMarkers(L, mapInstanceRef.current, markersLayerRef.current, filteredComplaints);
    }
    updateMarkers();
  }, [filteredComplaints]);

  function renderMarkers(L: any, map: any, layer: any, list: Complaint[]) {
    list.forEach((complaint) => {
      const lat = complaint.location?.latitude;
      const lng = complaint.location?.longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number') return;

      // Status color coding for marker halo
      let markerColor = '#f59e0b'; // Amber
      if (complaint.status === 'Verified') markerColor = '#3b82f6'; // Blue
      if (complaint.status === 'Assigned') markerColor = '#a855f7'; // Purple
      if (complaint.status === 'In Progress') markerColor = '#6366f1'; // Indigo
      if (complaint.status === 'Resolved') markerColor = '#10b981'; // Emerald
      if (complaint.status === 'Closed') markerColor = '#64748b'; // Slate

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${markerColor};
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background-color: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(layer);

      marker.on('click', () => {
        setSelectedComplaint(complaint);
      });

      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 2px;">
          <div style="font-weight: 700; color: #1e3a8a; font-size: 14px;">${complaint.complaint_number}</div>
          <div style="font-weight: 600; color: #1e293b; margin-top: 2px;">${complaint.category?.name || 'Concern'}</div>
          <div style="color: #64748b; font-size: 12px; margin-top: 4px;">
            📍 ${complaint.location?.barangay_name || 'Butuan City'}
            ${complaint.location?.landmark ? `• ${complaint.location.landmark}` : ''}
          </div>
          <div style="display: flex; gap: 6px; align-items: center; margin-top: 6px;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #e0f2fe; color: #0369a1;">
              ${complaint.status}
            </span>
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: #fef3c7; color: #b45309;">
              ${complaint.priority}
            </span>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);
    });
  }

  return (
    <div className="space-y-4">
      {/* Top Filter and Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Butuan City Concerns Map
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
            {filteredComplaints.length} mapped incidents
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Map + Detail Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative">
          <div
            ref={mapContainerRef}
            className="w-full h-[520px] bg-slate-100 dark:bg-slate-900 z-0"
          />
        </div>

        {/* Selected Complaint Card / Legend */}
        <div className="space-y-4">
          {selectedComplaint ? (
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {selectedComplaint.complaint_number}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {selectedComplaint.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selectedComplaint.category?.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="text-xs space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <div>
                  <strong>Barangay:</strong> {selectedComplaint.location?.barangay_name}
                </div>
                {selectedComplaint.location?.landmark && (
                  <div>
                    <strong>Landmark:</strong> {selectedComplaint.location?.landmark}
                  </div>
                )}
                <div>
                  <strong>Coordinates:</strong>{' '}
                  <span className="font-mono">
                    {selectedComplaint.location?.latitude},{' '}
                    {selectedComplaint.location?.longitude}
                  </span>
                </div>
              </div>

              <Link
                href={`/complaints/${selectedComplaint.id}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Open Full Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center py-8">
              <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Click any pin on the map to inspect incident details
              </p>
            </div>
          )}

          {/* Color Legend */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status Markers
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-700 dark:text-slate-300">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-slate-700 dark:text-slate-300">Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-slate-700 dark:text-slate-300">Assigned</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span className="text-slate-700 dark:text-slate-300">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-700 dark:text-slate-300">Resolved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                <span className="text-slate-700 dark:text-slate-300">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
