'use client';

import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintCategory, ComplaintStatus } from '@/lib/types';
import { fetchComplaintsAction } from '@/lib/actions/complaints';
import { fetchCategoriesAction } from '@/lib/actions/management';
import { STATUS_CONFIG, PRIORITY_CONFIG, COMPLAINT_STATUSES } from '@/lib/constants';
import { formatDateOnly, formatDateTime } from '@/lib/utils';
import ComplaintRegistrationForm from './ComplaintRegistrationForm';
import CityOverviewMap from '../map/CityOverviewMap';
import {
  FileText,
  Search,
  PlusCircle,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  RefreshCw,
  Sparkles,
  Layers,
  ChevronRight,
  Building,
  Info,
  Compass,
} from 'lucide-react';
import Link from 'next/link';

interface ClientComplaintsPortalProps {
  initialTab?: 'track' | 'register' | 'map';
}

export default function ClientComplaintsPortal({
  initialTab = 'track',
}: ClientComplaintsPortalProps) {
  const [activeTab, setActiveTab] = useState<'track' | 'register' | 'map'>(initialTab);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filters for citizen tracking
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter complaints for citizen
  const filtered = complaints.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.complaint_number.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.location?.barangay_name?.toLowerCase().includes(q) ||
      c.category?.name?.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchesCategory =
      selectedCategory === 'ALL' || c.category_id === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* CITIZEN PORTAL HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold tracking-wide">
            <Building className="w-3.5 h-3.5" />
            <span>Client POV • Public Assistance & Citizen Service</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Butuan Citizen Complaints Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Report community concerns, monitor ongoing resolutions, and inspect incidents across Butuan City. All registration and incident mapping tools are merged directly into this portal.
          </p>
        </div>
      </div>

      {/* MERGED TABS NAVIGATION */}
      <div className="p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-1">
        <button
          onClick={() => setActiveTab('track')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'track'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Track Complaints ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'register'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>File / Register New Complaint</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'map'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>City Incident Map</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: TRACK & BROWSE COMPLAINTS */}
      {/* =================================================================== */}
      {activeTab === 'track' && (
        <div className="space-y-4">
          {/* Search & Filter Header */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter tracking reference (e.g. BTC-2026-7750), barangay, or keyword..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
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
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium max-w-[170px] truncate"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setLoading(true);
                    loadData();
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick CTA to register if empty */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No complaints found matching your filter
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try searching for a different tracking number or register a new complaint to report an issue in your barangay.
              </p>
              <button
                onClick={() => setActiveTab('register')}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>File a Complaint Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((c) => {
                const statusInfo = STATUS_CONFIG[c.status];
                const priorityInfo = PRIORITY_CONFIG[c.priority];
                const step = statusInfo?.step || 1;

                return (
                  <div
                    key={c.id}
                    className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top Bar: Number + Status */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                            {c.complaint_number}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityInfo.badgeClass}`}
                          >
                            {c.priority}
                          </span>
                        </div>

                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusInfo.badgeClass}`}
                        >
                          {c.status}
                        </span>
                      </div>

                      {/* Title / Category */}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {c.category?.name || 'General Concern'}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                        {c.description}
                      </p>

                      {/* Location & Date */}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {c.location?.barangay_name || 'Butuan City'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDateOnly(c.date_reported)}</span>
                        </div>
                      </div>

                      {/* 6-Stage Progress Indicator */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1.5">
                          <span>Progress: Stage {step} of 6</span>
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {c.status}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(step / 6) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Links */}
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <Link
                        href={`/complaints/${c.id}`}
                        className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-semibold"
                      >
                        <span>View Status History & Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {typeof c.location?.latitude === 'number' && (
                        <button
                          onClick={() => setActiveTab('map')}
                          className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1"
                        >
                          <Compass className="w-3 h-3" />
                          <span>View on Map</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: MERGED FILE / REGISTER COMPLAINT FORM */}
      {/* =================================================================== */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Integrated Intake Form:</strong> Submit your complaint below. You will receive an official reference code to track its progress.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('track')}
              className="text-xs font-bold underline hover:no-underline text-emerald-700 dark:text-emerald-300"
            >
              Back to Tracking
            </button>
          </div>

          {/* Embedded Registration Form */}
          <ComplaintRegistrationForm />
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: MERGED CITY INCIDENT MAP */}
      {/* =================================================================== */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-center justify-between text-xs text-blue-800 dark:text-blue-200">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Integrated Butuan City Incident Map:</strong> Spatial view of reported public infrastructure and utility concerns across Butuan City.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('track')}
              className="text-xs font-bold underline hover:no-underline text-blue-700 dark:text-blue-300"
            >
              Back to List View
            </button>
          </div>

          {/* Embedded Interactive City Map */}
          <CityOverviewMap complaints={complaints} />
        </div>
      )}
    </div>
  );
}
