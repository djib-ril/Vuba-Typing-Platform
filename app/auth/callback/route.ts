import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Guarantee a profile row exists for every OAuth sign-in. Must use this
      // request's server client so RLS sees the authenticated user.
      const user = data.user;
      const email = user.email || "";
      const meta = (user.user_metadata || {}) as Record<string, any>;
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          email,
          full_name:
            meta.full_name || meta.name || email.split("@")[0] || "Typist",
          avatar_url: meta.avatar_url || meta.picture || null,
          role: email === "mugishadjibril2020@gmail.com" ? "admin" : "user",
          typing_level: "Beginner",
        },
        { onConflict: "id", ignoreDuplicates: true }
      );
    }
  }

  // Redirect to dashboard after sign in
  return NextResponse.redirect(`${origin}/dashboard`);
}
