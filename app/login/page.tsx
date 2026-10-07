'use client';

import React, { Suspense } from 'react';
import { SignIn } from '@clerk/nextjs';
import { Shield } from 'lucide-react';

function LoginContent() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-3 mb-6">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium mt-3">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Authenticated Portal Access</span>
          </div>
        </div>
      </div>

      {/* Official Clerk SignIn Component */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 flex justify-center">
        <SignIn
          routing="hash"
          forceRedirectUrl="/auth-redirect"
          appearance={{
            variables: {
              colorPrimary: '#2563eb',
              colorBackground: '#090d16',
              borderRadius: '0.875rem',
            },
            elements: {
              rootBox: 'w-full shadow-2xl',
              card: 'bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 rounded-3xl backdrop-blur-xl',
              headerTitle: 'text-white font-bold text-lg',
              headerSubtitle: 'text-slate-400 text-xs',
              socialButtonsBlockButton:
                'bg-slate-950 border border-slate-800 text-slate-200 hover:bg-slate-800/80 transition-colors py-2.5',
              formButtonPrimary:
                'bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 shadow-md shadow-blue-950/40',
              formFieldLabel: 'text-slate-300 text-xs font-medium',
              formFieldInput:
                'bg-slate-950 border border-slate-800 text-white rounded-xl focus:border-blue-500 text-xs py-2',
              footerActionLink: 'text-blue-400 hover:text-blue-300 font-semibold',
              identityPreviewText: 'text-slate-200 text-xs',
              identityPreviewEditButton: 'text-blue-400 hover:text-blue-300',
              dividerLine: 'bg-slate-800',
              dividerText: 'text-slate-500 text-xs',
            },
          }}
        />
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-[11px] text-slate-500 z-10">
        Republic of the Philippines • City Government of Butuan • Agusan del Norte
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Loading authentication portal...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
