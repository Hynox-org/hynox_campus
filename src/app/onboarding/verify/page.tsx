import React from 'react';
import { createClient } from '@/lib/supabase-server';
import VerifyClient from './VerifyClient';
import { ShieldAlert, GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ 
    token?: string; 
    error?: string; 
    expected?: string; 
    received?: string; 
  }>;
}

export default async function OnboardingVerifyPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;
  const errorParam = params.error;
  const expectedParam = params.expected;
  const receivedParam = params.received;

  if (!token) {
    return <ErrorLayout title="Token Missing" message="This onboarding link is invalid because it is missing a security token. Please request a new link from your administrator." />;
  }

  const supabase = await createClient();

  // Validate the onboarding token by searching the profiles table (join with institutions to get the name)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, institutions(name)')
    .eq('onboarding_token', token)
    .single();

  if (error || !profile) {
    return (
      <ErrorLayout 
        title="Invalid Link" 
        message="This onboarding link is invalid or does not exist. Please double-check your email or contact your administrator." 
      />
    );
  }

  // Check if this profile has already been successfully linked / onboarded
  if (profile.is_onboarded && profile.id) {
    return (
      <ErrorLayout 
        title="Link Already Activated" 
        message="This onboarding link has already been used and activated. Please log in directly at the Hynox Portal login page." 
        isUsed={true}
      />
    );
  }

  // Check if token has expired
  const now = new Date();
  const expiresAt = profile.onboarding_token_expires_at ? new Date(profile.onboarding_token_expires_at) : null;
  if (expiresAt && now > expiresAt) {
    return (
      <ErrorLayout 
        title="Link Expired" 
        message="This onboarding link has expired. For security reasons, invitations expire after 7 days. Please contact your institution admin for a new link." 
      />
    );
  }

  // Formulate friendly mismatch error message if present
  let initialError = null;
  if (errorParam === 'email_mismatch' && expectedParam) {
    initialError = `Restricted: You tried to link using "${receivedParam || 'unknown account'}", but this invitation is restricted to "${expectedParam}". Please click the button below and choose "Use another account" in Google.`;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden font-sans">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      <VerifyClient 
        token={token} 
        email={profile.email} 
        fullName={profile.full_name || 'Hynox Member'} 
        role={profile.role} 
        institutionName={profile.institutions?.name}
        initialError={initialError}
      />
    </div>
  );
}

interface ErrorLayoutProps {
  title: string;
  message: string;
  isUsed?: boolean;
}

function ErrorLayout({ title, message, isUsed = false }: ErrorLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden font-sans text-white">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-md z-10 bg-slate-950 rounded-[2.5rem] p-10 border border-slate-900 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500" />
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6">
            <ShieldAlert className="text-red-400 w-8 h-8" />
          </div>
          
          <h1 className="text-2xl font-bold font-heading mb-3">{title}</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">{message}</p>
          
          <Link 
            href="/login" 
            className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            {isUsed ? 'Go to Login' : 'Return to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
