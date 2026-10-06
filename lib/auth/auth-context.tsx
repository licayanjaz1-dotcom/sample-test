'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole, AppPOV } from '../types';
import { DEFAULT_USERS } from '../constants';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  pov: AppPOV;
  isAdmin: boolean;
  isClerk: boolean;
  isStaff: boolean;
  isClient: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password?: string,
    targetRole?: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to Admin user initially
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USERS[0]);
  const [isLoading, setIsLoading] = useState(true);

  // POV is strictly derived from the authenticated account
  const pov: AppPOV = user?.role === 'CLIENT' ? 'CLIENT' : 'ADMIN';

  useEffect(() => {
    // Check localStorage on mount
    try {
      const storedId = localStorage.getItem('butuan_active_user_id');
      if (storedId) {
        let found: UserProfile | null = null;
        const defaultMatch = DEFAULT_USERS.find((u) => u.id === storedId);
        if (defaultMatch) {
          found = defaultMatch;
        } else {
          const customUserJson = localStorage.getItem('butuan_custom_user_' + storedId);
          if (customUserJson) {
            try {
              found = JSON.parse(customUserJson);
            } catch {
              // Ignore
            }
          }
        }
        if (found) {
          // Check if user has saved profile customizations
          const savedCustom = localStorage.getItem('butuan_custom_profile_' + found.id);
          if (savedCustom) {
            try {
              const parsed = JSON.parse(savedCustom);
              found = { ...found, ...parsed };
            } catch {
              // Ignore
            }
          }
          setUser(found);
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    email: string,
    password?: string,
    targetRole?: UserRole
  ) => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Search in predefined users first
      let match: UserProfile | undefined = DEFAULT_USERS.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );

      // If explicit targetRole was provided and match doesn't match it, adjust or create
      if (targetRole && (!match || match.role !== targetRole)) {
        if (targetRole === 'CLIENT') {
          match = {
            id: `usr-client-${Date.now()}`,
            full_name: email.split('@')[0] || 'Citizen Resident',
            email: email.trim(),
            role: 'CLIENT',
            contact_number: '0917-555-6666',
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            assigned_barangay: 'Doongan',
            notification_email: true,
            notification_sms: true,
          };
        } else if (targetRole === 'CLERK') {
          match = {
            id: `usr-clerk-${Date.now()}`,
            full_name: 'Intake Desk Clerk',
            email: email.trim(),
            role: 'CLERK',
            contact_number: '0917-333-4444',
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            department: 'Public Assistance and Complaints Desk (PACD)',
            notification_email: true,
            notification_sms: false,
          };
        } else if (targetRole === 'ADMIN') {
          match = {
            id: `usr-admin-${Date.now()}`,
            full_name: 'Administrator',
            email: email.trim(),
            role: 'ADMIN',
            contact_number: '0917-111-2222',
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            department: 'City Mayor\'s Office - Complaints & Monitoring Division',
            notification_email: true,
            notification_sms: true,
          };
        }
      }

      // If still no match, infer from email or fallback
      if (!match) {
        if (normalizedEmail.includes('admin')) {
          match = {
            id: `usr-${Date.now()}`,
            full_name: 'Administrator',
            email: email.trim(),
            role: 'ADMIN',
            contact_number: '0917-111-2222',
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            department: 'Executive Administration',
          };
        } else if (normalizedEmail.includes('clerk') || normalizedEmail.includes('staff')) {
          match = {
            id: `usr-${Date.now()}`,
            full_name: 'Intake Desk Clerk',
            email: email.trim(),
            role: 'CLERK',
            contact_number: '0917-333-4444',
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            department: 'Intake Desk',
          };
        } else {
          match = {
            id: `usr-${Date.now()}`,
            full_name: email.split('@')[0] || 'Citizen Resident',
            email: email.trim(),
            role: 'CLIENT',
            contact_number: '0917-555-6666',
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            assigned_barangay: 'Doongan',
          };
        }
      }

      if (!match) {
        match = {
          id: `usr-${Date.now()}`,
          full_name: email.split('@')[0] || 'Citizen Resident',
          email: email.trim(),
          role: targetRole || 'CLIENT',
          contact_number: '0917-000-0000',
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
        };
      }

      let activeUser: UserProfile = match;

      // Check if there are saved customizations for this user
      try {
        const savedCustom = localStorage.getItem('butuan_custom_profile_' + activeUser.id);
        if (savedCustom) {
          activeUser = { ...activeUser, ...JSON.parse(savedCustom) };
        }
      } catch {
        // Ignore
      }

      setUser(activeUser);

      try {
        localStorage.setItem('butuan_active_user_id', activeUser.id);
        localStorage.setItem('butuan_custom_user_' + activeUser.id, JSON.stringify(activeUser));
      } catch {
        // Ignore
      }

      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Login authentication failed' };
    }
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!user) return { success: false, error: 'No user is currently logged in' };
    try {
      const updatedUser: UserProfile = {
        ...user,
        ...updatedData,
      };
      setUser(updatedUser);
      localStorage.setItem('butuan_custom_profile_' + user.id, JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to save profile changes' };
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('butuan_active_user_id');
    } catch {
      // Ignore
    }
  };

  const switchUser = (userId: string) => {
    const found = DEFAULT_USERS.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      try {
        localStorage.setItem('butuan_active_user_id', found.id);
      } catch {
        // Ignore
      }
    }
  };

  const role = user?.role || (pov === 'ADMIN' ? 'ADMIN' : 'CLIENT');
  const isAdmin = role === 'ADMIN';
  const isClerk = role === 'CLERK';
  const isStaff = role === 'STAFF' || role === 'CLERK';
  const isClient = role === 'CLIENT';

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
        isLoading,
        login,
        logout,
        switchUser,
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
