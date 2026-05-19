'use server';

import { randomUUID } from 'crypto';
import { createClient } from './supabase-server';
import { UserRole } from './auth-utils';

import { headers } from 'next/headers';
import { sendOnboardingEmail } from './email-service';

export interface PreRegisterUser {
  email: string;
  full_name: string;
  role: UserRole;
  institution_id?: string;
}

/**
 * Pre-registers a list of users into the profiles table with unique onboarding tokens.
 * This is called by the Super Admin during bulk upload.
 */
export async function bulkOnboardUsers(users: PreRegisterUser[]) {
  const supabase = await createClient();
  
  // 1. Validate that the current requester is a Super Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Unauthorized: No active user session found.' };
  }

  const { data: adminProfile, error: selectError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (selectError || adminProfile?.role !== 'super_admin') {
    console.error('Super Admin validation failed:', {
      userId: user.id,
      email: user.email,
      adminProfile,
      selectError
    });
    
    const debugMsg = selectError 
      ? `Database Error: ${selectError.message} (Code: ${selectError.code})` 
      : `Access Denied: Your profile role is "${adminProfile?.role || 'null'}", but "super_admin" is required.`;
      
    return { 
      success: false, 
      error: `Only Super Admins can perform bulk onboarding. ${debugMsg} (User ID: ${user.id})` 
    };
  }

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // 2. Prepare data for insertion (generating a cryptographic token for each pre-registered user)
  const records = users.map(u => {
    const token = randomUUID();
    return {
      email: u.email.toLowerCase(),
      full_name: u.full_name,
      role: u.role,
      institution_id: u.institution_id || null,
      is_onboarded: false,
      onboarding_token: token,
      onboarding_token_expires_at: sevenDaysFromNow,
    };
  });

  // 3. Upsert into profiles table (match by email)
  const { data, error } = await supabase
    .from('profiles')
    .upsert(records, { onConflict: 'email' })
    .select();

  if (error) {
    console.error('Bulk onboarding error:', error);
    return { success: false, error: error.message };
  }

  // Fetch institution names for the email templates
  const instIds = Array.from(new Set(records.map(r => r.institution_id).filter(Boolean)));
  const instMap: Record<string, string> = {};
  if (instIds.length > 0) {
    const { data: insts } = await supabase
      .from('institutions')
      .select('id, name')
      .in('id', instIds);
    if (insts) {
      insts.forEach(i => {
        instMap[i.id as string] = i.name;
      });
    }
  }

  const hostHeader = (await headers()).get('host') || 'localhost:3000';
  const protocol = hostHeader.includes('localhost') ? 'http' : 'https';

  // 4. Dispatch onboarding emails to each user in parallel
  const emailResults = await Promise.all(
    data.map(async (record) => {
      const verificationLink = `/onboarding/verify?token=${record.onboarding_token}`;
      const fullLink = `${protocol}://${hostHeader}${verificationLink}`;
      
      const emailRes = await sendOnboardingEmail({
        to: record.email,
        fullName: record.full_name,
        role: record.role,
        institutionName: record.institution_id ? instMap[record.institution_id] : undefined,
        activationLink: fullLink,
      });
      
      return {
        email: record.email,
        emailSent: emailRes.success,
        emailError: emailRes.error
      };
    })
  );

  // 5. Return results with verification links and email statuses
  const usersWithLinks = data.map(record => {
    const dispatchInfo = emailResults.find(r => r.email === record.email);
    return {
      email: record.email,
      full_name: record.full_name,
      role: record.role,
      token: record.onboarding_token,
      verificationLink: `/onboarding/verify?token=${record.onboarding_token}`,
      emailSent: dispatchInfo?.emailSent ?? false,
      emailError: dispatchInfo?.emailError,
    };
  });

  return { success: true, count: data.length, users: usersWithLinks };
}

/**
 * Creates a new institution.
 */
export async function createInstitution(name: string, code: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('institutions')
    .insert({ name, code })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
