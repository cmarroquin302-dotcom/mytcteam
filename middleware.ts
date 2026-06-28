import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Protect /admin routes — additional admin check handled in page
  if (pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect signed-in users away from auth pages
  if (user && (pathname === "/sign-in" || pathname === "/sign-up")) {
    const url = request.nextUrl.clone();
        // Check is_admin from DB profile, falling back to ADMIN_EMAILS env var
        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());
        const isAdminByEmail = adminEmails.filter(Boolean).includes(user.email || "");
        let isAdmin = isAdminByEmail;
        if (!isAdmin) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("is_admin")
                  .eq("id", user.id)
                  .single();
                isAdmin = profile?.is_admin === true;
        }
        url.pathname = isAdmin ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
