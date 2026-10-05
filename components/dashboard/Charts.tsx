'use client';

import React from 'react';
import { DashboardStats } from '@/lib/types';
import { BarChart3, PieChart, TrendingUp, MapPin } from 'lucide-react';

interface ChartsProps {
  stats: DashboardStats;
}

export default function Charts({ stats }: ChartsProps) {
  const maxOverTime = Math.max(...stats.overTime.map((o) => o.count), 1);
  const maxCategory = Math.max(...stats.byCategory.map((c) => c.count), 1);
  const maxBarangay = Math.max(...stats.byBarangay.map((b) => b.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Complaints Over Time (Weekly Trend) */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Complaints Over Time (Last 7 Days)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Daily Inflow</span>
        </div>

        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
          {stats.overTime.map((item, idx) => {
            const heightPercent =
              stats.totalComplaints > 0
                ? Math.round((item.count / maxOverTime) * 100)
                : 0;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.count}
                </span>
                <div className="w-full max-w-[32px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-full">
                  <div
                    style={{ height: `${item.count > 0 ? Math.max(heightPercent, 14) : 6}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      item.count > 0
                        ? 'bg-linear-to-t from-blue-700 to-blue-500 group-hover:brightness-110'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[42px]">
                  {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Complaints by Status (Distribution) */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Complaints by Status
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {stats.totalComplaints} Active Total
          </span>
        </div>

        <div className="space-y-2.5">
          {stats.byStatus.map((item) => {
            const percent =
              stats.totalComplaints > 0
                ? Math.round((item.count / stats.totalComplaints) * 100)
                : 0;

            let colorBar = 'bg-amber-500';
            if (item.status === 'Verified') colorBar = 'bg-blue-500';
            if (item.status === 'Assigned') colorBar = 'bg-purple-500';
            if (item.status === 'In Progress') colorBar = 'bg-indigo-500';
            if (item.status === 'Resolved') colorBar = 'bg-emerald-500';
            if (item.status === 'Closed') colorBar = 'bg-slate-400';

            return (
              <div key={item.status} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {item.status}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {item.count} ({percent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${percent}%` }}
                    className={`h-full ${colorBar} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Complaints by Category */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Complaints by Category
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Top Concerns</span>
        </div>

        {stats.byCategory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No complaints categorized yet.
          </div>
        ) : (
          <div className="space-y-3">
            {stats.byCategory.slice(0, 5).map((cat) => {
              const percent = Math.round((cat.count / maxCategory) * 100);
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate pr-2">
                      {cat.name}
                    </span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 shrink-0">
                      {cat.count}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(percent, 8)}%` }}
                      className="h-full bg-linear-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Complaints by Barangay */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Complaints by Barangay
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Highest Reporting</span>
        </div>

        {stats.byBarangay.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No barangay incidents recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {stats.byBarangay.slice(0, 5).map((brgy) => {
              const percent = Math.round((brgy.count / maxBarangay) * 100);
              return (
                <div key={brgy.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate pr-2">
                      {brgy.name}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                      {brgy.count}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(percent, 8)}%` }}
                      className="h-full bg-linear-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
