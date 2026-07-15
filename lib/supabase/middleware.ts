import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
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
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirige preservando las cookies que Supabase pudo haber refrescado en
  // `supabaseResponse`. Si no se copian, un refresh de token que ocurra durante
  // un redirect se pierde y el usuario termina rebotando al login.
  const redirectTo = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  };

  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isAuthPage =
    path.startsWith("/admin/login") || path.startsWith("/auth");

  if (isAdmin && !isAuthPage && !user) {
    return redirectTo("/admin/login");
  }

  if (path === "/admin/login" && user) {
    return redirectTo("/admin");
  }

  return supabaseResponse;
}
