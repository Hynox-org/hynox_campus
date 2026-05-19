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

  // Fetch profile (the ID is now automatically synced by the DB trigger)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError.message);
    // Default to public if profile fetch fails for some reason
    return { role: 'public' as UserRole, path: ROLE_REDIRECTS['public'] };
  }

  const role = profile.role as UserRole;
  return { role, path: ROLE_REDIRECTS[role] };
}
