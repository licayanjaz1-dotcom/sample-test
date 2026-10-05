'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Complaint } from '@/lib/types';
import { fetchComplaintsAction } from '@/lib/actions/complaints';
import CityOverviewMap from '@/components/map/CityOverviewMap';
import { MapPin, PlusCircle, RefreshCw, AlertCircle } from 'lucide-react';

export default function IncidentMapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetchComplaintsAction();
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Geographic Visualizer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Butuan City Incident Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial mapping and clustering of registered community complaints across Butuan City.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            title="Refresh Map"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/complaints/register"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Complaint</span>
          </Link>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Initializing city map & coordinates...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-xs">
              <span className="text-blue-800 dark:text-blue-300 font-medium">
                No complaints recorded yet. Registered complaints with GPS coordinates will appear here on the map.
              </span>
              <Link
                href="/complaints/register"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-2"
              >
                Register First Complaint &rarr;
              </Link>
            </div>
            <CityOverviewMap complaints={[]} />
          </div>
        ) : (
          <CityOverviewMap complaints={complaints} />
        )}
      </div>
    </div>
  );
}
