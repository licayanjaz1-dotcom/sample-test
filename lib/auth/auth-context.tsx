'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { UserProfile, UserRole, AppPOV } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  pov: AppPOV;
  isAdmin: boolean;
  isClerk: boolean;
  isStaff: boolean;
  isClient: boolean;
  isLoading: boolean;
  isSignedIn: boolean;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapClerkToRole(clerkUser: any): UserRole {
  if (!clerkUser) return 'CLIENT';

  // Secure Clerk publicMetadata role mechanism:
  // ONLY users with 'admin' in their Clerk publicMetadata have the Administrator role.
  // New users without this metadata will NOT become Administrators by default.
  const metadataRole = (clerkUser.publicMetadata?.role as string | undefined)?.toLowerCase();
  if (metadataRole === 'admin') return 'ADMIN';
  if (metadataRole === 'clerk') return 'CLERK';
  if (metadataRole === 'staff') return 'STAFF';

  // All other users default to CLIENT
  return 'CLIENT';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [profileOverride, setProfileOverride] = useState<Partial<UserProfile>>({});

  // Reset profile overrides if user changes
  useEffect(() => {
    setProfileOverride({});
  }, [clerkUser?.id]);

  const user: UserProfile | null = useMemo(() => {
    if (!isSignedIn || !clerkUser) return null;

    const email = clerkUser.primaryEmailAddress?.emailAddress || '';
    const fullName =
      clerkUser.fullName ||
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      (email ? email.split('@')[0] : 'Citizen User');

    const derivedRole = mapClerkToRole(clerkUser);

    const baseProfile: UserProfile = {
      id: clerkUser.id,
      full_name: fullName,
      email: email,
      role: derivedRole,
      contact_number: clerkUser.phoneNumbers?.[0]?.phoneNumber || null,
      status: 'ACTIVE',
      created_at: clerkUser.createdAt ? new Date(clerkUser.createdAt).toISOString() : new Date().toISOString(),
      department:
        (clerkUser.publicMetadata?.department as string) ||
        (derivedRole === 'ADMIN'
          ? "City Mayor's Office - Complaints & Monitoring Division"
          : derivedRole === 'CLERK'
          ? 'Public Assistance Desk (PACD)'
          : undefined),
      assigned_barangay: (clerkUser.publicMetadata?.assigned_barangay as string) || 'Doongan',
      notification_email: true,
      notification_sms: true,
    };

    return {
      ...baseProfile,
      ...profileOverride,
    };
  }, [isSignedIn, clerkUser, profileOverride]);

  const role: UserRole = user?.role || 'CLIENT';
  const pov: AppPOV = role === 'CLIENT' ? 'CLIENT' : 'ADMIN';
  const isAdmin = role === 'ADMIN';
  const isClerk = role === 'CLERK';
  const isStaff = role === 'STAFF' || role === 'CLERK';
  const isClient = role === 'CLIENT';

  const logout = async () => {
    await signOut({ redirectUrl: '/login' });
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      setProfileOverride((prev) => ({ ...prev, ...updatedData }));
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        pov,
        isAdmin,
        isClerk,
        isStaff,
        isClient,
        isLoading: !isLoaded,
        isSignedIn: Boolean(isSignedIn),
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
