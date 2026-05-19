import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code);

    if (authError || !user) {
      console.error('Code exchange failed:', authError?.message);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    const cookieStore = await cookies();
    const onboardingTokenCookie = cookieStore.get('hynox_onboarding_token')?.value;

    let userRole = 'public';

    // CASE 1: ONBOARDING LINK FLOW
    if (onboardingTokenCookie) {
      // Find the pre-registered profile for this token
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('onboarding_token', onboardingTokenCookie)
        .single();

      if (profile && !profileErr) {
        // Security check: Verify that the Google logged-in email matches the pre-registered email
        if (profile.email.toLowerCase() === user.email?.toLowerCase()) {
          userRole = profile.role;

          // 1. Link the profile to the auth.uid() and mark onboarded, clearing the token
          await supabase
            .from('profiles')
            .update({
              id: user.id,
              is_onboarded: true,
              onboarding_token: null,
              onboarding_token_expires_at: null,
            })
            .eq('email', profile.email);

          // 2. Sync to user_roles security table
          await supabase
            .from('user_roles')
            .upsert(
              { user_id: user.id, role: userRole },
              { onConflict: 'user_id' }
            );

          // 3. Securely set the custom app claim via SQL to ensure immediate JWT sync
          await supabase.rpc('set_user_role_claim', { 
            target_user_id: user.id, 
            target_role: userRole 
          });
          
          // Clear onboarding token cookie
          cookieStore.delete('hynox_onboarding_token');
        } else {
          // Email mismatch! Force signout to prevent session pollution
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/onboarding/verify?token=${onboardingTokenCookie}&error=email_mismatch&expected=${encodeURIComponent(profile.email)}&received=${encodeURIComponent(user.email || '')}`
          );
        }
      }
    } else {
      // CASE 2: DIRECT STANDARD LOGIN (Graceful Fallback)
      // Check if a linked profile already exists
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile && !profileErr) {
        userRole = profile.role;
      } else {
        // Fallback: Check if they are pre-registered but bypassed the email link (auto-link by email)
        const { data: preRegProfile, error: preRegErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', user.email?.toLowerCase())
          .single();

        if (preRegProfile && !preRegErr) {
          userRole = preRegProfile.role;

          // Link them automatically since emails match!
          await supabase
            .from('profiles')
            .update({
              id: user.id,
              is_onboarded: true,
              onboarding_token: null,
              onboarding_token_expires_at: null,
            })
            .eq('email', user.email?.toLowerCase());

          await supabase
            .from('user_roles')
            .upsert(
              { user_id: user.id, role: userRole },
              { onConflict: 'user_id' }
            );

          // Securely set the custom app claim via SQL
          await supabase.rpc('set_user_role_claim', { 
            target_user_id: user.id, 
            target_role: userRole 
          });
        } else {
          // Truly brand new public user (handled by handle_new_user database trigger)
          userRole = 'public';
        }
      }
    }

    // Role-to-dashboard redirect mapping
    const roleToPathMap: Record<string, string> = {
      student: '/dashboard/student',
      teacher: '/dashboard/teacher',
      institution_admin: '/dashboard/institution',
      super_admin: '/dashboard/admin',
      public: '/dashboard/public',
    };

    const redirectPath = roleToPathMap[userRole] || '/dashboard/public';
    return NextResponse.redirect(`${origin}${redirectPath}`);
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_request`);
}
