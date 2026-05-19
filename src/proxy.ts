import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  // 1. If trying to access dashboard paths
  if (url.pathname.startsWith('/dashboard')) {
    if (!user) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // 2. Read role directly from JWT Custom Claim (app_metadata) - 0 database hits!
    const role = user.app_metadata?.role || 'public';
    const pathSegments = url.pathname.split('/');
    const requestedDashboard = pathSegments[2]; // /dashboard/[segment]

    const roleToPathMap: Record<string, string> = {
      student: 'student',
      teacher: 'teacher',
      institution_admin: 'institution',
      super_admin: 'admin',
      public: 'public',
    };

    const expectedSegment = roleToPathMap[role];

    // Redirect to correct dashboard path if segment is mismatched or missing
    if (!requestedDashboard || requestedDashboard !== expectedSegment) {
      url.pathname = `/dashboard/${expectedSegment || 'public'}`;
      return NextResponse.redirect(url);
    }
  }

  // 3. If authenticated user hits /login, auto-redirect them to their dashboard
  if (url.pathname === '/login' && user) {
    const role = user.app_metadata?.role || 'public';
    const roleToPathMap: Record<string, string> = {
      student: 'student',
      teacher: 'teacher',
      institution_admin: 'institution',
      super_admin: 'admin',
      public: 'public',
    };
    url.pathname = `/dashboard/${roleToPathMap[role] || 'public'}`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
