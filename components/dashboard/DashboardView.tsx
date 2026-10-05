'use client';

import React, { useEffect, useState } from 'react';
import StatCards from './StatCards';
import Charts from './Charts';
import RecentComplaintsTable from './RecentComplaintsTable';
import { DashboardStats } from '@/lib/types';
import { fetchDashboardStatsAction } from '@/lib/actions/management';
import { PlusCircle, RefreshCw, MapPin, Building, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';

export default function DashboardView() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetchDashboardStatsAction();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Loading Butuan City Complaints Dashboard...
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        Unable to load dashboard metrics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold tracking-wide">
              <Building className="w-3.5 h-3.5" />
              <span>City Government of Butuan • Agusan del Norte</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Officer'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Centralized complaints intake, spatial mapping, and resolution tracking system
              for all 86 barangays of Butuan City.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Live City Map</span>
            </Link>
            <Link
              href="/complaints/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Complaint</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <section aria-label="Key Performance Indicators">
        <StatCards stats={stats} />
      </section>

      {/* Charts Section */}
      <section aria-label="Analytics and Charts">
        <Charts stats={stats} />
      </section>

      {/* Recent Incidents Table */}
      <section aria-label="Recent Incidents">
        <RecentComplaintsTable complaints={stats.recentComplaints} />
      </section>
    </div>
  );
}
