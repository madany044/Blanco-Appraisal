import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { createClient, type WebSocketLikeConstructor } from "@supabase/supabase-js";
import WebSocket from "ws";
import { MANAGERS } from "../prisma/users";

async function main() {
  // The launcher sets these BEFORE loading .env; never use its production DB URL.
  const url = new URL(process.env.DATABASE_URL ?? "http://invalid");
  if (url.hostname !== "127.0.0.1" || url.port !== "55439" || url.pathname !== "/appraisal_correction_test") throw new Error("Local test database required.");
  loadEnvConfig(process.cwd());
  const prisma = new PrismaClient();
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false }, realtime: { transport: WebSocket as WebSocketLikeConstructor },
    });
    // READ ONLY against Auth. Never run the production seed or change any account.
    const userIds = new Map<string, string>();
    for (let page = 1; ; page++) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      for (const user of data.users) if (user.email) userIds.set(user.email.toLowerCase(), user.id);
      if (data.users.length < 1000) break;
    }
    let linked = 0;
    for (const manager of MANAGERS) {
      const userId = userIds.get(manager.email.toLowerCase()) ?? null;
      await prisma.manager.upsert({ where: { email: manager.email }, update: { name: manager.name, userId }, create: { name: manager.name, email: manager.email, userId } });
      if (userId) linked++;
    }
    if (!(await prisma.incrementSlab.count())) await prisma.incrementSlab.createMany({ data: [
      { ctcMin: 0, ctcMax: 19999, maxPct: 35 }, { ctcMin: 20000, ctcMax: 39999, maxPct: 20 }, { ctcMin: 40000, ctcMax: null, maxPct: 15 },
    ] });
    console.log(`Local test data ready. ${linked} managers linked to existing sign-in accounts. No remote accounts or appraisals changed.`);
  } finally { await prisma.$disconnect(); }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Local setup failed"); process.exitCode = 1; });
