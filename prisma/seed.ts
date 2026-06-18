import { PrismaClient } from "@prisma/client";
import { createClient, type WebSocketLikeConstructor } from "@supabase/supabase-js";
import WebSocket from "ws";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Blanco@2026";

const USERS = [
  { email: "hr.blanco@gmail.com", role: "hr", name: "HR Admin" },
  { email: "sud.blanco@gmail.com", role: "management", name: "Management" },
  { email: "sudeep.blanco@gmail.com", role: "manager", name: "Sudeep M C" },
  { email: "yog.blanco@gmail.com", role: "manager", name: "Yogesha S" },
  { email: "gsn.blanco@gmail.com", role: "manager", name: "Naveena G S" },
  { email: "bsp.blanco@gmail.com", role: "manager", name: "Pradeep Kumar B S" },
  { email: "sms.blanco@gmail.com", role: "manager", name: "Shashikumar M S" },
  { email: "mpk.blanco@gmail.com", role: "manager", name: "Kumaraswamy M P" },
] as const;

const MANAGERS = [
  { name: "Sudeep M C", email: "sudeep.blanco@gmail.com" },
  { name: "Yogesha S", email: "yog.blanco@gmail.com" },
  { name: "Naveena G S", email: "gsn.blanco@gmail.com" },
  { name: "Pradeep Kumar B S", email: "bsp.blanco@gmail.com" },
  { name: "Shashikumar M S", email: "sms.blanco@gmail.com" },
  { name: "Kumaraswamy M P", email: "mpk.blanco@gmail.com" },
] as const;

const SLABS = [
  { ctcMin: 0, ctcMax: 19999, maxPct: 35.0 },
  { ctcMin: 20000, ctcMax: 29999, maxPct: 25.0 },
  { ctcMin: 30000, ctcMax: 39999, maxPct: 20.0 },
  { ctcMin: 40000, ctcMax: 49999, maxPct: 18.0 },
  { ctcMin: 50000, ctcMax: 59999, maxPct: 15.0 },
  { ctcMin: 60000, ctcMax: 69999, maxPct: 11.0 },
  { ctcMin: 70000, ctcMax: 79999, maxPct: 9.0 },
  { ctcMin: 80000, ctcMax: 89999, maxPct: 8.0 },
  { ctcMin: 90000, ctcMax: null, maxPct: 6.0 },
] as const;

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for seed");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket as WebSocketLikeConstructor },
  });

  const userIdByEmail = new Map<string, string>();

  for (const user of USERS) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find((u) => u.email === user.email);

    if (found) {
      await supabase.auth.admin.updateUserById(found.id, {
        user_metadata: { user_role: user.role, full_name: user.name },
      });
      userIdByEmail.set(user.email, found.id);
      console.log(`Updated user: ${user.email}`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { user_role: user.role, full_name: user.name },
      });
      if (error) throw error;
      if (data.user) {
        userIdByEmail.set(user.email, data.user.id);
        console.log(`Created user: ${user.email}`);
      }
    }
  }

  await prisma.incrementSlab.deleteMany();
  for (const slab of SLABS) {
    await prisma.incrementSlab.create({
      data: {
        ctcMin: slab.ctcMin,
        ctcMax: slab.ctcMax,
        maxPct: slab.maxPct,
      },
    });
  }
  console.log("Seeded increment slabs");

  for (const mgr of MANAGERS) {
    const userId = userIdByEmail.get(mgr.email);
    await prisma.manager.upsert({
      where: { email: mgr.email },
      update: { name: mgr.name, userId: userId ?? null },
      create: {
        name: mgr.name,
        email: mgr.email,
        userId: userId ?? null,
      },
    });
  }
  console.log("Seeded managers");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
