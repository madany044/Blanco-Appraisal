import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

// All sign-in goes through here now (instead of the browser calling Supabase
// directly) so the master-password check can stay entirely server-side —
// MASTER_PASSWORD is never sent to, or readable from, the browser.
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const masterPassword = process.env.MASTER_PASSWORD;

  // --- Master login: management can sign in as any real role account using
  // this password instead of that account's actual password. The account's
  // real password is never touched, read, or bypassed for anyone else. ---
  if (masterPassword && masterPassword.length >= 12 && password === masterPassword) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({ error: "Master login is not configured." }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    const hashedToken = linkData?.properties?.hashed_token;
    if (linkError || !hashedToken) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: hashedToken,
    });

    if (error || !data.user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    return NextResponse.json({ role: data.user.user_metadata?.user_role ?? null });
  }

  // --- Normal login: the account's real password. ---
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Invalid email or password." }, { status: 401 });
  }

  return NextResponse.json({ role: data.user.user_metadata?.user_role ?? null });
}
