import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/hr", "/manager", "/management"];

function roleDashboard(role: string): string {
  switch (role) {
    case "hr":
      return "/hr";
    case "manager":
      return "/manager";
    case "management":
      return "/management";
    default:
      return "/login";
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isLogin = pathname === "/login";

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isLogin && user) {
    const role = user.user_metadata?.user_role as string | undefined;
    if (role) {
      const url = request.nextUrl.clone();
      url.pathname = roleDashboard(role);
      return NextResponse.redirect(url);
    }
  }

  if (isProtected && user) {
    const role = user.user_metadata?.user_role as string | undefined;
    if (pathname.startsWith("/hr") && role !== "hr") {
      return NextResponse.redirect(new URL(roleDashboard(role ?? "hr"), request.url));
    }
    if (pathname.startsWith("/manager") && role !== "manager") {
      return NextResponse.redirect(new URL(roleDashboard(role ?? "manager"), request.url));
    }
    if (pathname.startsWith("/management") && role !== "management") {
      return NextResponse.redirect(new URL(roleDashboard(role ?? "management"), request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/hr/:path*",
    "/manager/:path*",
    "/management/:path*",
    "/login",
  ],
};
