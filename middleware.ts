import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './src/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Paths requiring authentication
  const isProtectedRoute = 
    path.startsWith('/admin') || 
    path.startsWith('/institution') || 
    path.startsWith('/student') || 
    path.startsWith('/dashboard');

  // 1. If not authenticated and trying to access a protected route, redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', path);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authenticated, handle role routing and page protections
  if (user) {
    const role = user.app_metadata?.role || 'public';

    // Prevent authenticated users from visiting the login page or index page
    if (path === '/login' || path === '/') {
      const rolePaths: Record<string, string> = {
        super_admin: '/admin',
        institution_admin: '/institution',
        student: '/student',
        teacher: '/student',
        trainer: '/student'
      };
      const redirectPath = rolePaths[role] || '/student';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Role-based route guard: Super Admin only for /admin
    if (path.startsWith('/admin') && role !== 'super_admin') {
      const dest = role === 'institution_admin' ? '/institution' : '/student';
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Role-based route guard: Institution Admin only for /institution
    if (path.startsWith('/institution') && role !== 'institution_admin') {
      const dest = role === 'super_admin' ? '/admin' : '/student';
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Role-based route guard: Student/Trainer only for /student
    if (path.startsWith('/student') && role !== 'student' && role !== 'teacher' && role !== 'trainer') {
      const dest = role === 'super_admin' ? '/admin' : '/institution';
      return NextResponse.redirect(new URL(dest, request.url));
    }

    // Route legacy /dashboard paths to their new matching controllers
    if (path.startsWith('/dashboard')) {
      const rolePaths: Record<string, string> = {
        super_admin: '/admin',
        institution_admin: '/institution',
        student: '/student',
        teacher: '/student',
        trainer: '/student'
      };
      const redirectPath = rolePaths[role] || '/student';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/*)
     * - static files (_next/static/*)
     * - image optimization files (_next/image/*)
     * - assets in public folder (favicon.ico, svg, png, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
