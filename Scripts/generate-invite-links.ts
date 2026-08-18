/**
 * Generates one-time "set your password" links for role accounts.
 *
 * These links are NEVER emailed by Supabase itself — this script only talks
 * to Supabase to mint the link, then prints it here so you can paste it into
 * an email / WhatsApp message yourself.
 *
 * Usage:
 *   npm run auth:invite-links                # every account in prisma/users.ts
 *   npm run auth:invite-links -- hr.blanco@gmail.com   # just one account
 *
 * Requires these env vars (same as prisma/seed.ts):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY      (server-only, never expose this)
 *   NEXT_PUBLIC_SITE_URL           e.g. https://appraisal.yourcompany.com
 *                                   (use http://localhost:3000 while testing)
 */
import { createClient, type WebSocketLikeConstructor } from "@supabase/supabase-js";
import { USERS } from "../prisma/users";
import WebSocket from "ws";

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is required, e.g. https://appraisal.yourcompany.com");
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket as WebSocketLikeConstructor },
  });

  const targetEmailArg = process.argv[2];
  const targets = targetEmailArg
    ? USERS.filter((u) => u.email.toLowerCase() === targetEmailArg.toLowerCase())
    : USERS;

  if (targets.length === 0) {
    console.error(`No account found in prisma/users.ts for "${targetEmailArg}"`);
    process.exit(1);
  }

  console.log(`\nGenerating set-password links for ${targets.length} account(s)...\n`);

  for (const user of targets) {
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: user.email,
    });

    if (error || !data?.properties?.hashed_token) {
      console.error(`✗ ${user.email} (${user.role}) — failed: ${error?.message ?? "unknown error"}`);
      continue;
    }

    const link = `${siteUrl.replace(/\/$/, "")}/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery&next=/set-password`;

    console.log(`${user.name} — ${user.email} (${user.role})`);
    console.log(link);
    console.log("");
  }

  console.log("Each link works once and expires after a while — regenerate if someone waits too long.");
  console.log("Send these individually (email or WhatsApp), not as a shared broadcast.\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});