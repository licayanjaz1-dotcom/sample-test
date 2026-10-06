'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Complaint, ComplaintStatus, ComplaintPriority } from '@/lib/types';
import {
  fetchComplaintsAction,
  updateStatusAction,
  assignComplaintAction,
  addActionRecordAction,
} from '@/lib/actions/complaints';
import { STATUS_CONFIG, PRIORITY_CONFIG, COMPLAINT_STATUSES } from '@/lib/constants';
import { formatDateOnly, formatDateTime } from '@/lib/utils';
import {
  GitBranch,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Shield,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Building,
  User,
  MapPin,
  Calendar,
  Send,
  PlusCircle,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function ComplaintProcessPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [isPending, startTransition] = useTransition();

  // Modal / Action state
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [targetStatus, setTargetStatus] = useState<ComplaintStatus | null>(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [assigneeName, setAssigneeName] = useState('City Engineering Office');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      const res = await fetchComplaintsAction();
      if (res.success && res.data) {
        setComplaints(res.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.complaint_number.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.location?.barangay_name?.toLowerCase().includes(q) ||
      c.category?.name?.toLowerCase().includes(q);

    const matchPriority = selectedPriority === 'ALL' || c.priority === selectedPriority;
    return matchSearch && matchPriority;
  });

  // Group complaints by status stages
  const stageMap: Record<ComplaintStatus, Complaint[]> = {
    Pending: filteredComplaints.filter((c) => c.status === 'Pending'),
    Verified: filteredComplaints.filter((c) => c.status === 'Verified'),
    Assigned: filteredComplaints.filter((c) => c.status === 'Assigned'),
    'In Progress': filteredComplaints.filter((c) => c.status === 'In Progress'),
    Resolved: filteredComplaints.filter((c) => c.status === 'Resolved'),
    Closed: filteredComplaints.filter((c) => c.status === 'Closed'),
  };

  const handleQuickAdvance = (complaint: Complaint, nextStatus: ComplaintStatus) => {
    setActiveComplaint(complaint);
    setTargetStatus(nextStatus);
    setActionRemarks(`Moving complaint to ${nextStatus} stage.`);
  };

  const submitStatusTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint || !targetStatus) return;

    startTransition(async () => {
      // If moving to Assigned, assign it as well
      if (targetStatus === 'Assigned') {
        await assignComplaintAction(
          activeComplaint.id,
          assigneeName,
          'usr-admin-01',
          actionRemarks
        );
      }

      const res = await updateStatusAction(
        activeComplaint.id,
        targetStatus,
        'usr-admin-01',
        'Complaints Administrator',
        actionRemarks
      );

      if (res.success && res.data) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === activeComplaint.id ? res.data! : c))
        );
        setFeedback({
          type: 'success',
          message: `Complaint ${activeComplaint.complaint_number} advanced to "${targetStatus}".`,
        });
        setActiveComplaint(null);
        setTargetStatus(null);
        setActionRemarks('');
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to update complaint stage.',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* FLOW HERO & NAVIGATIONAL FLOW BAR */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Administrator POV • Lifecycle Process</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              The Process of the Complaint
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Official 6-stage lifecycle flow: Intake &rarr; Verification &rarr; Department Assignment &rarr; In Progress &rarr; Resolution &rarr; Closure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/complaints"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              <span>View Complaint List</span>
            </Link>
            <button
              onClick={() => {
                setLoading(true);
                loadData();
              }}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              title="Refresh Pipeline"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 6-Stage Flow Diagram Breadcrumb */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto pb-1">
          <div className="flex items-center justify-between min-w-[700px] gap-2">
            {COMPLAINT_STATUSES.map((status, index) => {
              const count = stageMap[status]?.length || 0;
              const config = STATUS_CONFIG[status];

              return (
                <React.Fragment key={status}>
                  <div className="flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">
                        Step {index + 1}
                      </span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                        {count}
                      </span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {status}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">
                      {config.description}
                    </div>
                  </div>

                  {index < COMPLAINT_STATUSES.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaint pipeline by ID, category, or barangay..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* KANBAN PIPELINE COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
        {COMPLAINT_STATUSES.map((status) => {
          const list = stageMap[status];
          const config = STATUS_CONFIG[status];

          // Determine next logical status
          let nextStatus: ComplaintStatus | null = null;
          if (status === 'Pending') nextStatus = 'Verified';
          else if (status === 'Verified') nextStatus = 'Assigned';
          else if (status === 'Assigned') nextStatus = 'In Progress';
          else if (status === 'In Progress') nextStatus = 'Resolved';
          else if (status === 'Resolved') nextStatus = 'Closed';

          return (
            <div
              key={status}
              className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-col min-h-[450px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status === 'Pending'
                        ? 'bg-amber-500'
                        : status === 'Verified'
                        ? 'bg-blue-500'
                        : status === 'Assigned'
                        ? 'bg-purple-500'
                        : status === 'In Progress'
                        ? 'bg-indigo-500'
                        : status === 'Resolved'
                        ? 'bg-emerald-500'
                        : 'bg-slate-500'
                    }`}
                  />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {status}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  {list.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
                {list.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-slate-400 italic">
                    No complaints in {status}
                  </div>
                ) : (
                  list.map((c) => {
                    const priorityInfo = PRIORITY_CONFIG[c.priority];

                    return (
                      <div
                        key={c.id}
                        className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-2.5"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-400">
                              {c.complaint_number}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${priorityInfo.badgeClass}`}
                            >
                              {c.priority}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {c.category?.name || 'General Concern'}
                          </div>

                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {c.description}
                          </p>

                          <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">
                                {c.location?.barangay_name || 'Butuan'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">
                                {c.complainant?.full_name || 'Anonymous Complainant'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Workflow Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-1.5">
                          {nextStatus && (
                            <button
                              type="button"
                              onClick={() => handleQuickAdvance(c, nextStatus!)}
                              className="w-full py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
                            >
                              <span>Advance to {nextStatus}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          <div className="flex items-center justify-between text-[10px]">
                            <Link
                              href={`/complaints/${c.id}`}
                              className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1"
                            >
                              <span>Inspect Details</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveComplaint(c);
                                setTargetStatus(c.status);
                                setActionRemarks('');
                              }}
                              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            >
                              Edit Status
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* STAGE TRANSITION & ACTION MODAL */}
      {activeComplaint && targetStatus && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Process Workflow Action
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Complaint {activeComplaint.complaint_number}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveComplaint(null);
                  setTargetStatus(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitStatusTransition} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Change Status Stage To:
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as ComplaintStatus)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  {COMPLAINT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st} — {STATUS_CONFIG[st].description}
                    </option>
                  ))}
                </select>
              </div>

              {targetStatus === 'Assigned' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Responsible Department / Personnel:
                  </label>
                  <select
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                  >
                    <option value="City Engineering Office">City Engineering Office (Roads & Drainage)</option>
                    <option value="City Environment & Natural Resources (ENRO)">City ENRO (Waste & Pollution)</option>
                    <option value="City Transportation Management (CTMO)">City Traffic Management (CTMO)</option>
                    <option value="City Disaster Risk Reduction (CDRRMO)">City Disaster Risk Reduction (CDRRMO)</option>
                    <option value="Barangay Local Affairs Office">Barangay Local Affairs Office</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Remarks / Investigation Notes:
                </label>
                <textarea
                  required
                  rows={3}
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter official action details, validation notes, or instructions for field officers..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveComplaint(null);
                    setTargetStatus(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isPending ? 'Updating...' : 'Confirm Stage Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
