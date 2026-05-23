import { supabase } from './supabase';

export type UserRole = 'student' | 'teacher' | 'institution_admin' | 'super_admin' | 'public';

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  student: '/dashboard/student',
  teacher: '/dashboard/teacher',
  institution_admin: '/dashboard/institution',
  super_admin: '/dashboard/admin',
  public: '/dashboard/public',
};

/**
 * Resolves the user session and identifies their role-based dashboard.
 * Linking is handled automatically by a database trigger on the server.
 */
export async function resolveUserSession() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { role: null, path: '/login' };
  }

  // 1. Fetch user status and soft delete state from core.users directly
  const { data: dbUser, error: userError } = await supabase
    .schema('core')
    .from('users')
    .select('id, status, deleted_at')
    .eq('auth_user_id', user.id)
    .single();

  if (userError || !dbUser || dbUser.deleted_at || dbUser.status === 'blocked' || dbUser.status === 'suspended') {
    if (userError) {
      console.error('Error fetching user status:', userError.message);
    }
    return { role: null, path: '/login?error=unauthorized' };
  }

  // 2. Call the database function to resolve the highest priority role dynamically
  const { data: resolvedRole, error: roleError } = await supabase
    .schema('core')
    .rpc('get_user_primary_role', { target_user_id: dbUser.id });

  if (roleError || !resolvedRole) {
    if (roleError) {
      console.error('Error resolving user primary role:', roleError.message);
    }
    return { role: 'public' as UserRole, path: ROLE_REDIRECTS['public'] };
  }

  const role = resolvedRole as UserRole;
  return { role, path: ROLE_REDIRECTS[role] };
}
