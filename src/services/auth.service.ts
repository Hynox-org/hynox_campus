import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Triggers Google OAuth login process.
 */
export async function signInWithGoogle(supabase: SupabaseClient, email: string, redirectTo: string) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
        login_hint: email
      }
    }
  });

  if (error) {
    throw new Error(`Google Sign In failed: ${error.message}`);
  }
}

/**
 * Destroys the current user session and signs them out.
 */
export async function signOut(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Sign Out failed: ${error.message}`);
  }
}
