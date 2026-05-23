'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface VerifyClientProps {
  token: string;
  email: string;
  fullName: string;
  role: string;
  institutionName?: string;
  initialError?: string | null;
}

export default function VerifyClient({
  token,
  email,
  fullName,
  role,
  institutionName,
  initialError = null,
}: VerifyClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const handleActivation = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Set the secure onboarding token in cookies client-side (expires in 15 minutes)
      document.cookie = `hynox_onboarding_token=${token}; path=/; max-age=900; SameSite=Lax; Secure`;

      // 2. Trigger Google OAuth redirect
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account', // Force Google to let them choose the correct account
            login_hint: email, // Suggest their pre-registered email to Google
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  const roleLabels: Record<string, string> = {
    student: 'Student',
    teacher: 'Faculty / Teacher',
    institution_admin: 'Institution Administrator',
    super_admin: 'Super Administrator',
    public: 'Public User',
  };

  return (
    <div className="w-full max-w-lg z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-slate-950 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-950/50 border border-slate-800 relative overflow-hidden"
      >
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_2px_20px_rgba(6,182,212,0.5)]" />
        
        {/* Decorative circle */}
        <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-cyan-500/10 blur-[80px] rounded-full" />

        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/30 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <GraduationCap className="text-slate-950 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white font-heading tracking-tight text-center">Activate Portal Account</h1>
          <p className="text-slate-500 mt-2 text-center font-medium text-sm">Hynox Campus Onboarding</p>
        </div>

        {/* Info Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-8 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800/50">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Authorized Name</p>
              <p className="text-white font-bold text-base">{fullName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Assigned Role</p>
              <p className="text-white font-semibold text-sm">{roleLabels[role] || role}</p>
            </div>
            {institutionName && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Institution</p>
                <p className="text-cyan-400 font-semibold text-sm truncate">{institutionName}</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/50 flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-500 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Registered Email</p>
              <p className="text-slate-300 font-medium text-sm truncate">{email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-slate-400 text-xs text-center leading-relaxed">
            Please log in with Google to securely link your registration. Ensure you choose the Google account that matches: <br />
            <strong className="text-white">{email}</strong>
          </p>

          {error && (
            <div className="p-4 bg-red-950/40 border border-red-800/50 rounded-xl text-red-400 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleActivation}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] group disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.68-2.31 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                LINK & ACTIVATE WITH GOOGLE
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        <p className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          Secured by Hynox Identity
        </p>
      </motion.div>
    </div>
  );
}
