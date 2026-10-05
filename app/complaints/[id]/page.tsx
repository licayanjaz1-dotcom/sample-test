'use client';

import React, { useEffect, useState, useTransition, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Complaint, ComplaintStatus } from '@/lib/types';
import {
  fetchComplaintByIdAction,
  updateStatusAction,
  deleteComplaintAction,
} from '@/lib/actions/complaints';
import { STATUS_CONFIG, PRIORITY_CONFIG, COMPLAINT_STATUSES } from '@/lib/constants';
import { formatDateTime, formatDateOnly } from '@/lib/utils';
import ComplaintLocationViewer from '@/components/map/ComplaintLocationViewer';
import {
  ArrowLeft,
  FileText,
  User,
  MapPin,
  Calendar,
  Clock,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Send,
  History,
} from 'lucide-react';

export default function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>('Pending');
  const [remarks, setRemarks] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadComplaint = async () => {
    try {
      const res = await fetchComplaintByIdAction(resolvedParams.id);
      if (res.success && res.data) {
        setComplaint(res.data);
        setSelectedStatus(res.data.status);
      } else {
        setError(res.error || 'Complaint not found');
      }
    } catch {
      setError('Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaint();
  }, [resolvedParams.id]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    startTransition(async () => {
      const res = await updateStatusAction(
        complaint.id,
        selectedStatus,
        'Officer',
        'Staff Officer',
        remarks || undefined
      );

      if (res.success && res.data) {
        setComplaint(res.data);
        setRemarks('');
        setFeedback({
          type: 'success',
          message: `Status successfully updated to "${selectedStatus}".`,
        });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to update status.',
        });
      }
    });
  };

  const handleDelete = async () => {
    if (!complaint) return;
    if (!window.confirm(`Delete complaint ${complaint.complaint_number}? This action cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteComplaintAction(complaint.id);
      if (res.success) {
        router.push('/complaints');
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to delete complaint.',
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading complaint record...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested complaint does not exist.'}</p>
        <Link
          href="/complaints"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>
      </div>
    );
  }

  const statusMeta = STATUS_CONFIG[complaint.status];
  const priorityMeta = PRIORITY_CONFIG[complaint.priority];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/complaints"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Complaint</span>
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

      {/* Main Details Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                {complaint.complaint_number}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${priorityMeta.badgeClass}`}
              >
                {priorityMeta.label} Priority
              </span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {complaint.category?.name || 'General Concern'}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Reported: {formatDateOnly(complaint.date_reported)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{complaint.location?.barangay_name || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div className="text-[11px] uppercase font-semibold tracking-wider text-slate-400">
              Current Status
            </div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
          </div>
        </div>

        {/* Grid: Complainant Info & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Complainant Info */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <User className="w-4 h-4 text-blue-600" />
              <span>Complainant Information</span>
            </div>
            {complaint.complainant?.is_anonymous ? (
              <div className="text-xs text-slate-500 italic">
                Reported anonymously. Complainant identity is protected.
              </div>
            ) : (
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-slate-400">Name:</span>{' '}
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {complaint.complainant?.full_name || 'Not provided'}
                  </span>
                </div>
                {complaint.complainant?.contact_number && (
                  <div>
                    <span className="text-slate-400">Contact:</span>{' '}
                    <span>{complaint.complainant.contact_number}</span>
                  </div>
                )}
                {complaint.complainant?.email && (
                  <div>
                    <span className="text-slate-400">Email:</span>{' '}
                    <span>{complaint.complainant.email}</span>
                  </div>
                )}
                {complaint.complainant?.address && (
                  <div>
                    <span className="text-slate-400">Address:</span>{' '}
                    <span>{complaint.complainant.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Location Details</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400">Barangay:</span>{' '}
                <span className="font-semibold text-slate-800 dark:text-white">
                  {complaint.location?.barangay_name || 'N/A'}
                </span>
              </div>
              {complaint.location?.purok_zone && (
                <div>
                  <span className="text-slate-400">Purok/Zone:</span>{' '}
                  <span>{complaint.location.purok_zone}</span>
                </div>
              )}
              {complaint.location?.street && (
                <div>
                  <span className="text-slate-400">Street:</span>{' '}
                  <span>{complaint.location.street}</span>
                </div>
              )}
              {complaint.location?.landmark && (
                <div>
                  <span className="text-slate-400">Landmark:</span>{' '}
                  <span>{complaint.location.landmark}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Problem Description */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Problem Description
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {complaint.description}
          </div>
        </div>

        {/* Photo Evidence */}
        {complaint.photo_path && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Incident Photo Evidence</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black/5 max-w-xl">
              <img
                src={complaint.photo_path}
                alt="Complaint photo evidence"
                className="w-full max-h-96 object-contain rounded-2xl"
              />
            </div>
          </div>
        )}

        {/* Incident Map Viewer */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Incident Map Location
          </div>
          <ComplaintLocationViewer
            latitude={complaint.location?.latitude}
            longitude={complaint.location?.longitude}
            barangayName={complaint.location?.barangay_name}
            landmark={complaint.location?.landmark}
            street={complaint.location?.street}
          />
        </div>

        {/* Fast Status Update Form */}
        <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
            <RefreshCw className="w-4 h-4 text-blue-600" />
            <span>Update Complaint Status</span>
          </div>

          <form onSubmit={handleStatusUpdate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Change Status To
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {COMPLAINT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Resolution Notes / Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Dispatched cleanup truck, road patched, verified on-site..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending || selectedStatus === complaint.status && !remarks}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPending ? 'Updating...' : 'Save Status Update'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Status History Timeline */}
        {complaint.status_history && complaint.status_history.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <History className="w-4 h-4 text-purple-600" />
              <span>Status History & Audit Trail</span>
            </div>
            <div className="space-y-2 border-l-2 border-slate-200 dark:border-slate-800 pl-4 ml-2">
              {complaint.status_history.map((sh, idx) => (
                <div key={sh.id || idx} className="relative text-xs space-y-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -left-[21px] top-1" />
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {sh.new_status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(sh.created_at)}
                    </span>
                  </div>
                  {sh.remarks && (
                    <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                      {sh.remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
