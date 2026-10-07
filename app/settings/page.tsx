'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { OFFICIAL_BUTUAN_BARANGAYS } from '@/lib/constants';
import {
  User,
  Shield,
  Settings,
  Mail,
  Phone,
  Building,
  MapPin,
  Lock,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  Clock,
  ShieldAlert,
  HelpCircle,
  KeyRound,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, role, pov, isAdmin, isClient, updateProfile, logout } = useAuth();

  // Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [contactNumber, setContactNumber] = useState(user?.contact_number || '');
  const [department, setDepartment] = useState(user?.department || 'City Mayor\'s Office - Complaints Unit');
  const [assignedBarangay, setAssignedBarangay] = useState(user?.assigned_barangay || 'Doongan');

  // Preferences
  const [notifyEmail, setNotifyEmail] = useState(user?.notification_email ?? true);
  const [notifySms, setNotifySms] = useState(user?.notification_sms ?? true);
  const [urgentAlerts, setUrgentAlerts] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  // Admin security credentials
  const [adminPassword, setAdminPassword] = useState('••••••••');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setContactNumber(user.contact_number || '');
      setDepartment(user.department || (isAdmin ? 'City Administration Office' : 'Citizen Assistance'));
      setAssignedBarangay(user.assigned_barangay || 'Doongan');
      setNotifyEmail(user.notification_email ?? true);
      setNotifySms(user.notification_sms ?? true);
    }
  }, [user, isAdmin]);

  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isClient) return; // Prevent any edits if client

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await updateProfile({
        full_name: fullName.trim(),
        email: email.trim(),
        contact_number: contactNumber.trim(),
        department: department.trim(),
        assigned_barangay: assignedBarangay,
        notification_email: notifyEmail,
        notification_sms: notifySms,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Profile and system settings successfully updated.',
        });
        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to save settings.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'An unexpected error occurred while saving profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Account & Configuration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Settings & Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Manage administrator profile information, office credentials, and system alerts.'
              : 'View verified resident credentials and alert preferences for your citizen account.'}
          </p>
        </div>

        {/* Account Role Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${
              isAdmin
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {isAdmin ? (
              <Shield className="w-4 h-4 text-blue-600" />
            ) : (
              <User className="w-4 h-4 text-emerald-600" />
            )}
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                Account Type
              </div>
              <div className="text-xs font-bold leading-tight">
                {isAdmin ? 'Administrator (Editable)' : 'Citizen (Read-Only)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
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

      {/* Citizen Read-Only Notice Banner */}
      {isClient && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-xs">Citizen Profile Locked by Official Registry</h4>
            <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
              Your profile information is verified and linked to your citizen account logon (<strong>{user?.email || 'citizen@gmail.com'}</strong>). As per city municipal policy, citizen profile fields are non-editable online to preserve public records integrity.
            </p>
          </div>
        </div>
      )}

      {/* SETTINGS FORM */}
      <form onSubmit={handleAdminSave} className="space-y-6">
        {/* ============================================================= */}
        {/* SECTION 1: PROFILE INFORMATION */}
        {/* ============================================================= */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Profile Information
              </h2>
            </div>
            {isClient ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Read-Only</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <Save className="w-3 h-3" />
                <span>Editable</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  disabled={isClient}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border ${
                    isClient
                      ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 cursor-not-allowed select-none'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  disabled={isClient}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border ${
                    isClient
                      ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 cursor-not-allowed select-none'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Contact Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={isClient}
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="0917-000-0000"
                  className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border ${
                    isClient
                      ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 cursor-not-allowed select-none'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Department / Jurisdiction */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isAdmin ? 'Assigned Office / Department' : 'Resident Barangay Jurisdiction'}
              </label>
              <div className="relative">
                {isAdmin ? (
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                ) : (
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                )}
                {isAdmin ? (
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                ) : (
                  <input
                    type="text"
                    disabled
                    value={assignedBarangay}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 cursor-not-allowed select-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* SECTION 2: NOTIFICATIONS & ALERTS */}
        {/* ============================================================= */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Notification & Status Alerts
            </h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Email Status Updates
                </div>
                <div className="text-[11px] text-slate-500">
                  Receive instant notifications when complaints advance stages (e.g. In Progress, Resolved).
                </div>
              </div>
              <input
                type="checkbox"
                disabled={isClient}
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  SMS Mobile Alerts
                </div>
                <div className="text-[11px] text-slate-500">
                  Send SMS dispatches for high-priority emergency incidents and public announcements.
                </div>
              </div>
              <input
                type="checkbox"
                disabled={isClient}
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  City Disaster & Flooding Advisories
                </div>
                <div className="text-[11px] text-slate-500">
                  Broadcasts from CDRRMO Butuan City for Agusan River water levels and weather warnings.
                </div>
              </div>
              <input
                type="checkbox"
                disabled={isClient}
                checked={urgentAlerts}
                onChange={(e) => setUrgentAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* ============================================================= */}
        {/* SECTION 3: SYSTEM & REGIONAL PREFERENCES */}
        {/* ============================================================= */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3. System & Regional Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Portal Language
              </label>
              <select
                disabled={isClient}
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="English">English (Official Government)</option>
                <option value="Bisaya">Bisaya (Cebuano / Butuanon)</option>
                <option value="Filipino">Filipino (Tagalog)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Timezone Standard
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>PST (UTC+08:00) Asia/Manila</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Municipal Jurisdiction
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>86 Barangays • Butuan City</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* SECTION 4: SECURITY & ACCESS PRIVILEGES */}
        {/* ============================================================= */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              4. Security & Authentication Credentials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Privilege Tier
              </label>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">
                  {isAdmin ? 'System Administrator Tier' : 'Citizen Resident Tier'}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isAdmin
                    ? 'Grants access to Dashboard KPIs, Complaint Master List, and Complaint Process Workflow.'
                    : 'Grants access to file complaints, inspect incident map, and track resolution timeline.'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Session Account ID
              </label>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                {user?.id || 'guest-session'}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="text-xs text-slate-500">
            {isAdmin ? (
              <span>Modifications apply immediately across your administrative console.</span>
            ) : (
              <span>Your citizen account is verified. To switch accounts, use the switch account button below.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={logout}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold text-center transition-colors"
            >
              Sign Out of Clerk
            </button>

            {isAdmin && (
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all hover:scale-102"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
