'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  User,
  Shield,
  ClipboardList,
  Building,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';

type LoginFormType = 'client' | 'admin' | 'clerk';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const initialTab = (searchParams.get('tab') as LoginFormType) || 'client';
  const [activeTab, setActiveTab] = useState<LoginFormType>(initialTab);

  // Client form state
  const [clientEmail, setClientEmail] = useState('citizen@gmail.com');
  const [clientName, setClientName] = useState('Juan Dela Cruz');

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('admin@butuan.gov.ph');
  const [adminPassword, setAdminPassword] = useState('admin2026');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Clerk form state
  const [clerkEmail, setClerkEmail] = useState('clerk@butuan.gov.ph');
  const [clerkPin, setClerkPin] = useState('8600');
  const [showClerkPin, setShowClerkPin] = useState(false);

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab') as LoginFormType;
    if (tab && ['client', 'admin', 'clerk'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(clientEmail, undefined, 'CLIENT');
      if (res.success) {
        router.push('/complaints');
      } else {
        setError(res.error || 'Failed to login as Citizen');
      }
    } catch {
      setError('An unexpected error occurred during citizen login.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(adminEmail, adminPassword, 'ADMIN');
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Failed to authenticate administrator');
      }
    } catch {
      setError('An unexpected error occurred during admin authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleClerkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(clerkEmail, clerkPin, 'CLERK');
      if (res.success) {
        router.push('/complaints/process');
      } else {
        setError(res.error || 'Failed to authenticate intake clerk');
      }
    } catch {
      setError('An unexpected error occurred during clerk authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-700 via-blue-600 to-emerald-500 shadow-xl shadow-blue-900/30 text-white font-black text-2xl tracking-wider mx-auto">
          BC
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            City of Butuan
          </h2>
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold mt-0.5">
            Complaints Management System
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Select your portal to sign in with appropriate role permissions
          </p>
        </div>
      </div>

      {/* Portal Tabs Switcher */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10">
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md shadow-lg">
          {/* Client Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('client');
              setError(null);
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'client'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Citizen / Client</span>
          </button>

          {/* Admin Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setError(null);
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>Administrator</span>
          </button>

          {/* Clerk Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('clerk');
              setError(null);
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'clerk'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span>Intake Clerk</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORMS CONTAINER */}
        <div className="mt-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
          {/* ========================================================= */}
          {/* 1. CITIZEN / CLIENT LOGIN FORM */}
          {/* ========================================================= */}
          {activeTab === 'client' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-[11px] font-semibold mb-1">
                    <User className="w-3 h-3" />
                    <span>Citizen Portal (Client POV)</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Citizen Access</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sign in to track your registered complaints, view city incidents, or submit new reports.
                  </p>
                </div>
              </div>

              <form onSubmit={handleClientLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Full Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Juan Dela Cruz"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Citizen Email Address or Mobile Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="citizen@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Signing in...' : 'Sign In to Citizen Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setClientEmail('citizen@gmail.com');
                      setClientName('Juan Dela Cruz');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-400 text-xs font-semibold border border-slate-700/60 transition-colors text-center"
                  >
                    ⚡ One-Click Demo Citizen Login
                  </button>
                </div>
              </form>

              {/* Guest / Direct filing option */}
              <div className="pt-4 border-t border-slate-800/80 text-center">
                <Link
                  href="/complaints?tab=register"
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Want to file anonymously without signing in?</span>
                  <span className="font-semibold text-emerald-400 underline">
                    File Complaint Directly &rarr;
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. ADMINISTRATOR LOGIN FORM */}
          {/* ========================================================= */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/80 text-blue-400 text-[11px] font-semibold mb-1">
                    <Shield className="w-3 h-3" />
                    <span>Administrator Console (Admin POV)</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Administrator Access</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Authorized personnel sign in to access city analytics, full complaints log, and complaint processing.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Official Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@butuan.gov.ph"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Administrative Password / Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                    >
                      {showAdminPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-300/80">
                  🛡️ Restricted city governance portal. Grants full access to executive metrics, complaint assignments, and case disposition.
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-900/40 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In as Administrator'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmail('admin@butuan.gov.ph');
                      setAdminPassword('admin2026');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-blue-400 text-xs font-semibold border border-slate-700/60 transition-colors text-center"
                  >
                    ⚡ One-Click Demo Admin Login
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. FRONT-DESK CLERK LOGIN FORM */}
          {/* ========================================================= */}
          {activeTab === 'clerk' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/80 text-purple-400 text-[11px] font-semibold mb-1">
                    <ClipboardList className="w-3 h-3" />
                    <span>Intake & Front Desk Clerk Portal</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Desk Clerk Access</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Municipal complaints desk officer sign in for intake recording and workflow dispatching.
                  </p>
                </div>
              </div>

              <form onSubmit={handleClerkLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Clerk / Staff Email or Officer ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={clerkEmail}
                      onChange={(e) => setClerkEmail(e.target.value)}
                      placeholder="clerk@butuan.gov.ph"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Desk Terminal PIN / Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showClerkPin ? 'text' : 'password'}
                      required
                      value={clerkPin}
                      onChange={(e) => setClerkPin(e.target.value)}
                      placeholder="8600"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClerkPin(!showClerkPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                    >
                      {showClerkPin ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-[11px] text-purple-300/80">
                  📋 Public Assistance & Complaints Desk (PACD) Terminal. Direct access to verify citizen submissions and update complaint pipeline.
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/40 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In as Desk Clerk'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setClerkEmail('clerk@butuan.gov.ph');
                      setClerkPin('8600');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-purple-400 text-xs font-semibold border border-slate-700/60 transition-colors text-center"
                  >
                    ⚡ One-Click Demo Clerk Login
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-slate-500">
          Republic of the Philippines • City Government of Butuan • Agusan del Norte
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Loading login portal...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
