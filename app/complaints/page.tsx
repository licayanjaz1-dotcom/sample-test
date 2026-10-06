'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@/lib/types';
import {
  fetchComplaintsAction,
  updateStatusAction,
  deleteComplaintAction,
} from '@/lib/actions/complaints';
import { fetchCategoriesAction } from '@/lib/actions/management';
import { STATUS_CONFIG, PRIORITY_CONFIG, COMPLAINT_STATUSES } from '@/lib/constants';
import { formatDateOnly } from '@/lib/utils';
import ClientComplaintsPortal from '@/components/complaints/ClientComplaintsPortal';
import {
  FileText,
  Search,
  PlusCircle,
  Eye,
  Trash2,
  RefreshCw,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  Shield,
  ArrowRight,
} from 'lucide-react';

function ComplaintsPageContent() {
  const { pov } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as 'track' | 'register' | 'map' | null;

  // =========================================================================
  // IF CLIENT POV: RENDER MERGED CLIENT PORTAL
  // =========================================================================
  if (pov === 'CLIENT') {
    return <ClientComplaintsPortal initialTab={tabParam || 'track'} />;
  }

  // =========================================================================
  // ADMINISTRATOR POV: RENDER ADMINISTRATIVE COMPLAINT LIST
  // =========================================================================
  return <AdminComplaintListView />;
}

function AdminComplaintListView() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    try {
      const [compRes, catRes] = await Promise.all([
        fetchComplaintsAction(),
        fetchCategoriesAction(),
      ]);

      if (compRes.success && compRes.data) {
        setComplaints(compRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
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

  const handleStatusChange = async (id: string, newStatus: ComplaintStatus) => {
    startTransition(async () => {
      const res = await updateStatusAction(id, newStatus, 'usr-admin-01', 'Complaints Administrator');
      if (res.success && res.data) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
        setFeedback({
          type: 'success',
          message: `Complaint status updated to "${newStatus}".`,
        });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to update status.',
        });
      }
    });
  };

  const handleDelete = async (id: string, complaintNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete complaint ${complaintNumber}?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteComplaintAction(id);
      if (res.success) {
        setComplaints((prev) => prev.filter((c) => c.id !== id));
        setFeedback({
          type: 'success',
          message: `Complaint ${complaintNumber} deleted.`,
        });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to delete complaint.',
        });
      }
    });
  };

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.complaint_number.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.location?.barangay_name?.toLowerCase().includes(q) ||
      c.complainant?.full_name?.toLowerCase().includes(q) ||
      c.category?.name?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category_id === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Administrator POV Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator POV • Step 2 of Flow</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Complaint List
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administrative record of all citizen submissions with inline status updates and actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/complaints/process"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all hover:scale-102"
          >
            <GitBranch className="w-4 h-4" />
            <span>Process Workflow &rarr;</span>
          </Link>
          <button
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            title="Refresh Complaints"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

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

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, keyword, barangay, or complainant..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="ALL">All Statuses</option>
              {COMPLAINT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium max-w-[180px] truncate"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>

            {(search || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                  setCategoryFilter('ALL');
                  setPriorityFilter('ALL');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <div className="text-xs">Loading complaints records...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Matching Complaints Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your filter criteria or search keyword.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-semibold text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tracking ID</th>
                  <th className="py-3 px-4">Concern / Category</th>
                  <th className="py-3 px-4">Complainant</th>
                  <th className="py-3 px-4">Barangay</th>
                  <th className="py-3 px-4">Date Reported</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((c) => {
                  const statusMeta = STATUS_CONFIG[c.status];
                  const priorityMeta = PRIORITY_CONFIG[c.priority];

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        <Link
                          href={`/complaints/${c.id}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          {c.complaint_number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {c.category?.name || 'General'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {c.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 dark:text-slate-200 font-medium">
                          {c.complainant?.full_name || 'Anonymous'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {c.complainant?.contact_number || 'No contact'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                          <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{c.location?.barangay_name || 'N/A'}</span>
                        </div>
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
                        <select
                          value={c.status}
                          disabled={isPending}
                          onChange={(e) =>
                            handleStatusChange(c.id, e.target.value as ComplaintStatus)
                          }
                          className={`text-[11px] font-semibold rounded-lg px-2 py-1 border transition-colors cursor-pointer ${statusMeta.badgeClass}`}
                        >
                          {COMPLAINT_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/complaints/${c.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-medium transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                          <Link
                            href="/complaints/process"
                            className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 transition-colors"
                            title="Open in Workflow Process"
                          >
                            <GitBranch className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id, c.complaint_number)}
                            disabled={isPending}
                            className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComplaintsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs">
          Loading complaints portal...
        </div>
      }
    >
      <ComplaintsPageContent />
    </Suspense>
  );
}
