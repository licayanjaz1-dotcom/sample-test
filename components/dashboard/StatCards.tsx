'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  UserCheck,
  Activity,
  CheckCheck,
  Archive,
} from 'lucide-react';
import { DashboardStats } from '@/lib/types';

interface StatCardsProps {
  stats: DashboardStats;
}

export default function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      label: 'Total Complaints',
      value: stats.totalComplaints,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50',
      filterHref: '/complaints',
      desc: 'All recorded concerns',
    },
    {
      label: 'Pending',
      value: stats.pendingComplaints,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',
      filterHref: '/complaints?status=Pending',
      desc: 'Awaiting verification',
    },
    {
      label: 'Verified',
      value: stats.verifiedComplaints,
      icon: CheckCircle2,
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/50',
      filterHref: '/complaints?status=Verified',
      desc: 'Validated for action',
    },
    {
      label: 'Assigned',
      value: stats.assignedComplaints,
      icon: UserCheck,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50',
      filterHref: '/complaints?status=Assigned',
      desc: 'Delegated to staff',
    },
    {
      label: 'In Progress',
      value: stats.inProgressComplaints,
      icon: Activity,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50',
      filterHref: '/complaints?status=In Progress',
      desc: 'Field team active',
    },
    {
      label: 'Resolved',
      value: stats.resolvedComplaints,
      icon: CheckCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50',
      filterHref: '/complaints?status=Resolved',
      desc: 'Issue addressed',
    },
    {
      label: 'Closed',
      value: stats.closedComplaints,
      icon: Archive,
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800',
      filterHref: '/complaints?status=Closed',
      desc: 'Validated & completed',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.label}
            href={card.filterHref}
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.bgColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                {card.label}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {card.value}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {card.desc}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
