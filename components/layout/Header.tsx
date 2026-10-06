'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Menu,
  CheckCircle,
  User,
  Shield,
  Settings,
  LogIn,
  LogOut,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const { user, pov, logout } = useAuth();

  // Determine readable page title from route and POV
  let pageTitle = 'Complaints';
  if (pathname.startsWith('/settings')) {
    pageTitle = 'System & Profile Settings';
  } else if (pov === 'CLIENT') {
    pageTitle = 'Citizen Complaints Portal';
  } else {
    if (pathname.startsWith('/complaints/process')) {
      pageTitle = 'Complaint Processing Flow';
    } else if (pathname === '/dashboard' || pathname === '/') {
      pageTitle = 'Administrator Dashboard';
    } else if (pathname.startsWith('/complaints/')) {
      pageTitle = 'Complaint Details & Disposition';
    } else if (pathname.startsWith('/complaints')) {
      pageTitle = 'Administrative Complaint List';
    } else if (pathname.startsWith('/map')) {
      pageTitle = 'City Incident Spatial Map';
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
              {pageTitle}
            </h1>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
            City Government of Butuan • Citizen Complaints Management System
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Active POV Badge based strictly on logged in role (No switch button) */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            pov === 'CLIENT'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
          }`}
        >
          {pov === 'CLIENT' ? (
            <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          )}
          <span className="hidden xs:inline">
            {pov === 'CLIENT' ? 'Citizen Account (Client POV)' : 'Admin Account (Admin POV)'}
          </span>
        </div>

        {/* Quick Settings Icon Button */}
        <Link
          href="/settings"
          title="Profile & Settings"
          className={`p-2 rounded-xl border transition-colors ${
            pathname === '/settings'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* User Account / Profile Info */}
        {user ? (
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
            <Link
              href="/settings"
              title="View Profile Settings"
              className="text-right hidden md:block hover:opacity-80 transition-opacity"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user.full_name}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">
                {user.role.toLowerCase()}
              </div>
            </Link>
            <button
              onClick={logout}
              title="Log Out"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-semibold transition-all hover:opacity-90"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
