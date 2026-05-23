import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export interface NormalizedSession {
  user: {
    id: string;
    auth_user_id: string | null;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    status: string;
  };
  roles: string[];
  primaryRole: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
}

/**
 * Resolves the normalized session object for the currently authenticated user from the database.
 * Does NOT trust client auth.users directly; queries the database.
 */
export async function getCurrentUser(supabase: SupabaseClient<Database>): Promise<NormalizedSession | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }

  // 1. Resolve business profile from core.users (excluding soft deleted)
  const { data: profile, error: profileError } = await supabase
    .schema('core')
    .from('users')
    .select('id, auth_user_id, email, full_name, avatar_url, status, tenant_id')
    .eq('auth_user_id', user.id)
    .is('deleted_at', null)
    .single();

  if (profileError || !profile) {
    console.warn('Business profile not found or soft-deleted:', profileError?.message);
    return null;
  }

  // 2. Resolve database roles
  const { data: userRoles } = await supabase
    .schema('core')
    .from('user_roles')
    .select('roles!inner(name)')
    .eq('user_id', profile.id);

  const roles = userRoles ? userRoles.map((ur: any) => ur.roles.name as string) : [];
  
  // Resolve primary role from JWT claims first, fallback to priority or array
  const primaryRole = (user.app_metadata?.role as string) || (roles.length > 0 ? roles[0] : 'public');

  // 3. Resolve tenant/institution details if linked
  let tenant = null;
  if (profile.tenant_id) {
    const { data: inst } = await supabase
      .schema('institution')
      .from('institutions')
      .select('id, name, slug, status')
      .eq('id', profile.tenant_id)
      .single();

    if (inst) {
      tenant = {
        id: inst.id,
        name: inst.name,
        slug: inst.slug,
        status: inst.status
      };
    }
  }

  return {
    user: {
      id: profile.id,
      auth_user_id: profile.auth_user_id,
      email: profile.email,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      status: profile.status
    },
    roles,
    primaryRole,
    tenant
  };
}

/**
 * Fetches all users belonging to a specific tenant/institution.
 */
export async function fetchUsersListByTenant(supabase: SupabaseClient<Database>, tenantId: string) {
  const { data, error } = await supabase
    .schema('core')
    .from('users')
    .select('id, full_name, email, status, onboarding_source, created_at')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tenant users: ${error.message}`);
  }
  return data;
}

/**
 * Soft deletes a business user.
 */
export async function softDeleteUser(
  supabase: SupabaseClient<Database>, 
  targetUserId: string, 
  actorUserId: string, 
  reason: string
) {
  const { error } = await supabase
    .schema('core')
    .from('users')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: actorUserId,
      delete_reason: reason,
      status: 'inactive'
    })
    .eq('id', targetUserId);

  if (error) {
    throw new Error(`Soft delete failed: ${error.message}`);
  }
  return true;
}
