'use client';

import React from 'react';
import Link from 'next/link';
import { Complaint } from '@/lib/types';
import { formatDateOnly } from '@/lib/utils';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/lib/constants';
import { Eye, ArrowRight, PlusCircle, FileText } from 'lucide-react';

interface RecentComplaintsTableProps {
  complaints: Complaint[];
}

export default function RecentComplaintsTable({ complaints }: RecentComplaintsTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Incident Reports
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest citizen complaints logged into the system
          </p>
        </div>
        {complaints.length > 0 && (
          <Link
            href="/complaints"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>View All ({complaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        {complaints.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No Complaints Recorded
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
                The database is clean with no mock data. Click below to register the first community complaint.
              </p>
            </div>
            <Link
              href="/complaints/register"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register Complaint</span>
            </Link>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Tracking ID</th>
                <th className="py-3 px-4">Category / Concern</th>
                <th className="py-3 px-4">Barangay</th>
                <th className="py-3 px-4">Date Reported</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {complaints.map((c) => {
                const statusMeta = STATUS_CONFIG[c.status];
                const priorityMeta = PRIORITY_CONFIG[c.priority];

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      <Link href={`/complaints/${c.id}`} className="hover:underline">
                        {c.complaint_number}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                      {c.category?.name || 'General Concern'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {c.location?.barangay_name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDateOnly(c.date_reported)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityMeta.badgeClass}`}
                      >
                        {priorityMeta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/complaints/${c.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
