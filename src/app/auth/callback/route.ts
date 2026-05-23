import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && sessionData?.user) {
      const user = sessionData.user;

      // If next is root '/', redirect the user to their specific role dashboard
      if (next === "/") {
        const role = user.app_metadata?.role || "public";

        switch (role) {
          case "super_admin":
            return NextResponse.redirect(`${origin}/admin`);
          case "institution_admin":
            return NextResponse.redirect(`${origin}/institution`);
          case "teacher":
          case "trainer":
            return NextResponse.redirect(`${origin}/teacher`);
          case "student":
            return NextResponse.redirect(`${origin}/student`);
          default:
            return NextResponse.redirect(`${origin}/public`);
        }
      }

      // If next is a custom route (like /onboarding/verify), forward there
      const forwardUrl = next.startsWith("/") ? `${origin}${next}` : next;
      return NextResponse.redirect(forwardUrl);
    }
  }

  // Fallback if exchange fails
  return NextResponse.redirect(`${origin}/login?error=OAuthExchangeFailed`);
}
