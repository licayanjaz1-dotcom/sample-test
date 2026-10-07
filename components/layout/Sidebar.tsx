'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Settings,
  ChevronRight,
  ShieldCheck,
  User,
  Shield,
  LogOut,
  LogIn,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, pov, logout } = useAuth();

  // Client POV navigation: Only Complaints and Settings
  const clientNavigation = [
    {
      name: 'Complaints',
      href: '/complaints',
      icon: FileText,
      badge: 'Portal',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  // Administrator POV navigation: Admin Console, Dashboard, Complaint List, Complaint Process, and Settings
  const adminNavigation = [
    {
      name: 'Admin Console',
      href: '/admin',
      icon: ShieldCheck,
      badge: 'Executive',
    },
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Complaint List',
      href: '/complaints',
      icon: FileText,
      badge: null,
    },
    {
      name: 'Complaint Process',
      href: '/complaints/process',
      icon: GitBranch,
      badge: 'Workflow',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  const navigation = pov === 'CLIENT' ? clientNavigation : adminNavigation;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-700 via-blue-600 to-emerald-500 flex items-center justify-center shadow-md font-extrabold text-white text-base tracking-wider shrink-0">
            BC
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
              City of Butuan
            </div>
            <div className="text-sm font-bold text-white tracking-tight leading-tight truncate">
              Complaints System
            </div>
            <div className="text-[10px] text-slate-400">
              {pov === 'CLIENT' ? 'Citizen Client Portal' : 'Administrator Console'}
            </div>
          </div>
        </div>

        {/* Authenticated Account Badge (No manual switch button) */}
        <div className="px-4 pt-4 pb-1">
          <div
            className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
              pov === 'CLIENT'
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                : 'bg-blue-950/40 border-blue-800/80 text-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {pov === 'CLIENT' ? (
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
              )}
              <div>
                <div className="font-bold text-[11px] uppercase tracking-wider text-white">
                  {pov === 'CLIENT' ? 'Client POV' : 'Admin POV'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {pov === 'CLIENT' ? 'Citizen Resident' : 'System Administration'}
                </div>
              </div>
            </div>

            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 font-mono font-medium text-slate-300">
              {user?.role || 'Guest'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            {pov === 'CLIENT' ? 'Citizen Menu' : 'Administrative Flow'}
          </div>

          {navigation.map((item) => {
            // Determine active state
            let active = false;
            if (item.href === '/complaints/process') {
              active = pathname.startsWith('/complaints/process');
            } else if (item.href === '/complaints') {
              active =
                (pathname === '/complaints' || pathname.startsWith('/complaints/')) &&
                !pathname.startsWith('/complaints/process');
            } else if (item.href === '/dashboard') {
              active = pathname === '/dashboard' || pathname === '/';
            } else if (item.href === '/settings') {
              active = pathname.startsWith('/settings');
            } else {
              active = pathname === item.href;
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  active
                    ? pov === 'CLIENT'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      active ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 font-medium">
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Account Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {user ? (
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <Link
                href="/settings"
                onClick={onClose}
                className="min-w-0 pr-2 hover:opacity-80 transition-opacity block flex-1"
                title="Go to Settings"
              >
                <div className="text-xs font-bold text-white truncate">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                <div className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                  <span>Role: {user.role}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 hover:underline">Settings &rarr;</span>
                </div>
              </Link>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Choose Role</span>
            </Link>
          )}

          <div className="flex items-center justify-between px-1 text-[10px] text-slate-500">
            <span>Clerk Authentication</span>
            <span>Butuan City, PH</span>
          </div>
        </div>
      </aside>
    </>
  );
}
