import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccess, homeForRole } from "@/lib/returnUrl";

/** Routes that require a signed-in user, and who may open them. */
const PROTECTED = ["/dashboard", "/admin", "/govt"];

/** Reachable while signed out even though it lives under a protected prefix. */
const PUBLIC_EXCEPTIONS = ["/govt/signin", "/admin/signin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsGuard =
    PROTECTED.some((prefix) => pathname.startsWith(prefix)) &&
    !PUBLIC_EXCEPTIONS.includes(pathname);

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without keys the app runs in offline demo mode, where the client-side
  // shells do the gating instead.
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Always call getUser() — it is what refreshes an expiring session cookie.
  let {
    data: { user },
  } = await supabase.auth.getUser();

  // Soft fallback: some edge runtimes briefly miss a just-set cookie JWT
  // while the session cookie is already present.
  if (!user && needsGuard) {
    const { data: sessionData } = await supabase.auth.getSession();
    user = sessionData.session?.user ?? null;
  }

  if (!needsGuard) return response;

  if (!user) {
    const signIn = request.nextUrl.clone();
    if (pathname.startsWith("/govt")) {
      signIn.pathname = "/govt/signin";
    } else if (pathname.startsWith("/admin")) {
      signIn.pathname = "/admin/signin";
    } else {
      signIn.pathname = "/signin";
    }
    signIn.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(signIn);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "individual") as Parameters<typeof canAccess>[0];

  if (profile?.account_status === "suspended") {
    const signIn = request.nextUrl.clone();
    signIn.pathname = "/signin";
    signIn.search = "?error=suspended";
    return NextResponse.redirect(signIn);
  }

  if (!canAccess(role, pathname)) {
    const home = request.nextUrl.clone();
    home.pathname = homeForRole(role);
    home.search = "";
    return NextResponse.redirect(home);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets, so session cookies stay fresh on
     * public pages too.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
