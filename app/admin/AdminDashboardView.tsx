'use client';

import React, { useEffect, useState } from 'react';
import StatCards from '@/components/dashboard/StatCards';
import Charts from '@/components/dashboard/Charts';
import RecentComplaintsTable from '@/components/dashboard/RecentComplaintsTable';
import { DashboardStats } from '@/lib/types';
import { fetchDashboardStatsAction } from '@/lib/actions/management';
import {
  ShieldCheck,
  Building,
  RefreshCw,
  GitBranch,
  FileText,
  MapPin,
  Settings,
  Lock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

interface AdminDashboardViewProps {
  adminEmail: string;
  adminName: string;
}

export default function AdminDashboardView({
  adminEmail,
  adminName,
}: AdminDashboardViewProps) {
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

  return (
    <div className="space-y-6">
      {/* Executive Administrator Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-900/50 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Executive Administrator Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              City Government of Butuan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Complaints Management System • Administrative Command & Oversight Portal
            </p>
          </div>

          {/* Verified Admin Account Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md space-y-2 shrink-0 md:min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <UserCheck className="w-4 h-4" />
                <span>Authorized Administrator</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800 text-[10px] text-blue-300 font-mono">
                ROLE: ADMIN
              </span>
            </div>
            <div className="text-xs text-white font-bold truncate">{adminName}</div>
            <div className="text-[11px] font-mono text-slate-300 truncate">{adminEmail}</div>
            <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Security Check</span>
              <span className="text-emerald-400 font-semibold">Clerk Metadata Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Security Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Access Policy Active:</strong> Only <code className="bg-slate-950 px-1.5 py-0.5 rounded text-blue-300 font-mono">{adminEmail}</code> holds the Administrator role via Clerk metadata. Unprivileged accounts are restricted to <code className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-400 font-mono">/dashboard</code>.
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Administrator Quick Actions Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/complaints/process"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Complaint Processing
            </div>
            <p className="text-xs text-slate-500">
              Verify citizen reports, assign handling officers, and update case disposition.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>Open Workflow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/complaints"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Complaint Master List
            </div>
            <p className="text-xs text-slate-500">
              Filter by barangay, priority level, resolution timeline, or tracking ID.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Browse Master List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/map"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Spatial Incident Map
            </div>
            <p className="text-xs text-slate-500">
              Interactive GIS map of Butuan City displaying geo-tagged complaints.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Explore Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/settings"
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              System Settings
            </div>
            <p className="text-xs text-slate-500">
              Manage executive notification channels, department contacts, and privileges.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* KPI Stats & Charts */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">
            Loading Butuan City executive statistics...
          </p>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          <StatCards stats={stats} />
          <Charts stats={stats} />
          <RecentComplaintsTable complaints={stats.recentComplaints} />
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500">
          Unable to load administrative metrics.
        </div>
      )}
    </div>
  );
}
