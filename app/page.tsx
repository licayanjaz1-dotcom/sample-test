'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import DashboardView from '@/components/dashboard/DashboardView';
import ClientComplaintsPortal from '@/components/complaints/ClientComplaintsPortal';

export default function HomePage() {
  const { pov } = useAuth();

  if (pov === 'CLIENT') {
    return <ClientComplaintsPortal initialTab="track" />;
  }

  return <DashboardView />;
}
