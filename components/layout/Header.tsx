'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, PlusCircle, CheckCircle } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();

  // Determine readable page title from route
  let pageTitle = 'Dashboard';
  if (pathname.includes('/complaints/register')) pageTitle = 'Register New Complaint';
  else if (pathname.includes('/complaints/')) pageTitle = 'Complaint Details';
  else if (pathname.startsWith('/complaints')) pageTitle = 'Complaints Management';
  else if (pathname.startsWith('/map')) pageTitle = 'City Incident Map';

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

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>System Online</span>
        </div>

        {pathname !== '/complaints/register' && (
          <Link
            href="/complaints/register"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all hover:scale-102"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Register Complaint</span>
            <span className="xs:hidden">New</span>
          </Link>
        )}
      </div>
    </header>
  );
}
