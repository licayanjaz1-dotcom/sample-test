'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import ComplaintRegistrationForm from '@/components/complaints/ComplaintRegistrationForm';

export default function RegisterComplaintPage() {
  const { pov } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (pov === 'CLIENT') {
      router.replace('/complaints?tab=register');
    }
  }, [pov, router]);

  return <ComplaintRegistrationForm />;
}
