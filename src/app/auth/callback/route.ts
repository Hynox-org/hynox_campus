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
      // Find the pre-registered user and invitation for this token in the core schema directly
      const { data: invite, error: inviteErr } = await supabase
        .schema('core')
        .from('user_invitations')
        .select('*, users(*)')
        .eq('token', onboardingTokenCookie)
        .single();

      const dbUser = invite?.users as any;

      if (dbUser && !inviteErr) {
        // Security check: Verify that the user is not soft deleted
        if (dbUser.deleted_at) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=account_deleted`);
        }

        // Security check: Verify that the Google logged-in email matches the pre-registered email
        if (dbUser.email.toLowerCase() === user.email?.toLowerCase()) {
          
          // Note: The database trigger (core.handle_new_user) already linked core.users.auth_user_id
          // and updated the invitation status to 'accepted' automatically upon auth.users insert.
          
          // 1. Fetch user's dynamic primary role using the database priority ordering
          const { data: resolvedRole } = await supabase
            .schema('core')
            .rpc('get_user_primary_role', { target_user_id: dbUser.id });

          userRole = (resolvedRole as string) || 'public';

          // 2. Re-sync JWT metadata using the database claim builder RPC
          await supabase
            .schema('core')
            .rpc('set_user_role_claim', { target_user_id: user.id });
          
          // Clear onboarding token cookie
          cookieStore.delete('hynox_onboarding_token');
        } else {
          // Email mismatch! Force signout to prevent session pollution
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/onboarding/verify?token=${onboardingTokenCookie}&error=email_mismatch&expected=${encodeURIComponent(dbUser.email)}&received=${encodeURIComponent(user.email || '')}`
          );
        }
      }
    } else {
      // CASE 2: DIRECT STANDARD LOGIN (Graceful Fallback)
      // Check if a linked user already exists directly in core.users
      const { data: dbUser } = await supabase
        .schema('core')
        .from('users')
        .select('id, deleted_at, status')
        .eq('auth_user_id', user.id)
        .single();

      if (dbUser && !dbUser.deleted_at) {
        // Fetch user's dynamic primary role
        const { data: resolvedRole } = await supabase
          .schema('core')
          .rpc('get_user_primary_role', { target_user_id: dbUser.id });

        userRole = (resolvedRole as string) || 'public';

        // Re-sync claim dynamically
        await supabase
          .schema('core')
          .rpc('set_user_role_claim', { target_user_id: user.id });
      } else if (dbUser && dbUser.deleted_at) {
        // Soft deleted user tries to login directly
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=account_deleted`);
      } else {
        // Fallback: Check if they are pre-registered but bypassed the email link (auto-link by email)
        const { data: preRegUser } = await supabase
          .schema('core')
          .from('users')
          .select('id, email, deleted_at')
          .eq('email', user.email?.toLowerCase())
          .single();

        if (preRegUser && !preRegUser.deleted_at) {
          // Note: The database trigger (core.handle_new_user) already linked core.users.auth_user_id
          // and updated invitation status upon auth.users insert. We query and set claims.
          const { data: resolvedRole } = await supabase
            .schema('core')
            .rpc('get_user_primary_role', { target_user_id: preRegUser.id });

          userRole = (resolvedRole as string) || 'public';

          // Securely set the custom app claim via SQL
          await supabase
            .schema('core')
            .rpc('set_user_role_claim', { target_user_id: user.id });
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
