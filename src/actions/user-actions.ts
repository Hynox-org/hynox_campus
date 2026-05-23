'use server';

import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, softDeleteUser } from '@/services/user.service';
import { sendOnboardingEmail } from '@/lib/email-service';
import { headers } from 'next/headers';

export interface PreRegisterUser {
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'institution_admin' | 'super_admin' | 'public';
  institution_id?: string;
}

/**
 * Pre-registers a list of users into the profiles table with unique onboarding tokens.
 * This is called by the Super Admin during bulk upload.
 */
export async function bulkOnboardUsers(users: PreRegisterUser[]) {
  const supabase = await createClient();
  
  // 1. Validate that the current requester is a Super Admin
  const session = await getCurrentUser(supabase);
  if (!session) {
    return { success: false, error: 'Unauthorized: No active user session found.' };
  }

  const isSuperAdmin = session.roles.includes('super_admin');
  if (!isSuperAdmin) {
    return { success: false, error: 'Only Super Admins can perform bulk onboarding.' };
  }

  const adminId = session.user.id;

  // Fetch roles to get name-to-id mapping
  const { data: dbRoles, error: rolesFetchError } = await supabase
    .schema('core')
    .from('roles')
    .select('id, name');

  if (rolesFetchError || !dbRoles) {
    return { success: false, error: `Failed to fetch roles metadata: ${rolesFetchError?.message}` };
  }

  const roleMap = new Map<string, string>(dbRoles.map(r => [r.name, r.id]));
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // 2. Prepare user records for insertion into core.users directly
  const userRecords = users.map(u => ({
    email: u.email.toLowerCase(),
    full_name: u.full_name,
    tenant_id: u.institution_id || null,
    status: 'invited', // lifecycle state 1: invited
    onboarding_source: 'excel_import'
  }));

  // 3. Upsert into core.users
  const { data: insertedUsers, error: userUpsertError } = await supabase
    .schema('core')
    .from('users')
    .upsert(userRecords, { onConflict: 'email' })
    .select();

  if (userUpsertError || !insertedUsers) {
    console.error('User upsert error:', userUpsertError);
    return { success: false, error: userUpsertError?.message || 'Failed to upsert users.' };
  }

  // 4. Map and insert the user roles
  const userRoleRecords = insertedUsers.map(uRecord => {
    const originalInput = users.find(u => u.email.toLowerCase() === uRecord.email);
    const roleId = roleMap.get(originalInput?.role || 'public');
    return {
      user_id: uRecord.id,
      role_id: roleId!
    };
  }).filter(r => r.role_id);

  if (userRoleRecords.length > 0) {
    const { error: rolesInsertError } = await supabase
      .schema('core')
      .from('user_roles')
      .upsert(userRoleRecords, { onConflict: 'user_id,role_id' });

    if (rolesInsertError) {
      console.error('Roles assignment error:', rolesInsertError);
      return { success: false, error: `Failed to assign roles: ${rolesInsertError.message}` };
    }
  }

  const getInvitationType = (role: string) => {
    if (role === 'student') return 'student_onboarding';
    if (role === 'trainer' || role === 'teacher') return 'trainer_onboarding';
    if (role === 'institution_admin') return 'institution_admin_invite';
    return 'student_onboarding';
  };

  // 5. Create invitation records in core.user_invitations with tenant isolation
  const invitationRecords = insertedUsers.map(uRecord => {
    const originalInput = users.find(u => u.email.toLowerCase() === uRecord.email);
    return {
      user_id: uRecord.id,
      tenant_id: uRecord.tenant_id, // tenant isolation
      token: randomUUID(),
      invited_by: adminId,
      expires_at: sevenDaysFromNow,
      status: 'created', // lifecycle state 1: created
      invitation_type: getInvitationType(originalInput?.role || 'student')
    };
  });

  const { data: insertedInvites, error: inviteError } = await supabase
    .schema('core')
    .from('user_invitations')
    .insert(invitationRecords)
    .select();

  if (inviteError || !insertedInvites) {
    console.error('Invitation generation error:', inviteError);
    return { success: false, error: inviteError?.message || 'Failed to generate invitations.' };
  }

  // Fetch institution names for the email templates defensively
  const instIds = Array.from(new Set(users.map(u => u.institution_id).filter(Boolean)));
  const instMap: Record<string, string> = {};
  if (instIds.length > 0) {
    const { data: insts, error: instsErr } = await supabase
      .schema('institution')
      .from('institutions')
      .select('id, name')
      .in('id', instIds);
    if (!instsErr && insts) {
      insts.forEach(i => {
        instMap[i.id as string] = i.name;
      });
    }
  }

  const hostHeader = (await headers()).get('host') || 'localhost:3000';
  const protocol = hostHeader.includes('localhost') ? 'http' : 'https';

  // 6. Dispatch onboarding emails in parallel and update status
  const emailResults = await Promise.all(
    insertedUsers.map(async (uRecord) => {
      const invite = insertedInvites.find(i => i.user_id === uRecord.id);
      const token = invite?.token;
      
      const verificationLink = `/onboarding/verify?token=${token}`;
      const fullLink = `${protocol}://${hostHeader}${verificationLink}`;
      
      const originalInput = users.find(u => u.email.toLowerCase() === uRecord.email);
      
      const emailRes = await sendOnboardingEmail({
        to: uRecord.email,
        fullName: uRecord.full_name || '',
        role: originalInput?.role || 'public',
        institutionName: uRecord.tenant_id ? instMap[uRecord.tenant_id] : undefined,
        activationLink: fullLink,
      });
      
      if (emailRes.success && invite) {
        // Update user to pending_activation, invitation to sent
        await supabase
          .schema('core')
          .from('users')
          .update({ status: 'pending_activation' })
          .eq('id', uRecord.id);
          
        await supabase
          .schema('core')
          .from('user_invitations')
          .update({ status: 'sent' })
          .eq('id', invite.id);
      } else if (invite) {
        // Update invitation to failed
        await supabase
          .schema('core')
          .from('user_invitations')
          .update({ status: 'failed' })
          .eq('id', invite.id);
      }
      
      return {
        email: uRecord.email,
        emailSent: emailRes.success,
        emailError: emailRes.error,
        token: token
      };
    })
  );

  // 7. Return results with verification links and email statuses
  const usersWithLinks = insertedUsers.map(uRecord => {
    const dispatchInfo = emailResults.find(r => r.email === uRecord.email);
    const originalInput = users.find(u => u.email.toLowerCase() === uRecord.email);
    return {
      email: uRecord.email,
      full_name: uRecord.full_name,
      role: originalInput?.role || 'public',
      token: dispatchInfo?.token,
      verificationLink: `/onboarding/verify?token=${dispatchInfo?.token}`,
      emailSent: dispatchInfo?.emailSent ?? false,
      emailError: dispatchInfo?.emailError,
    };
  });

  return { success: true, count: insertedUsers.length, users: usersWithLinks };
}

/**
 * Server Action: Soft deletes a user profile.
 */
export async function softDeleteUserAction(targetUserId: string, reason: string) {
  try {
    const supabase = await createClient();
    const session = await getCurrentUser(supabase);
    if (!session) {
      return { success: false, error: 'Unauthorized: No active user session found.' };
    }

    const isSuperAdmin = session.roles.includes('super_admin');
    const isInstAdmin = session.roles.includes('institution_admin');
    if (!isSuperAdmin && !isInstAdmin) {
      return { success: false, error: 'Permission denied: Super Admin or Institution Admin required.' };
    }

    await softDeleteUser(supabase, targetUserId, session.user.id, reason);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
