import { createClient } from "@/lib/supabase/server";

export type UserRole = "hr" | "manager" | "management";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const role = user.user_metadata?.user_role as UserRole | undefined;
  if (!role || !["hr", "manager", "management"].includes(role)) return null;

  return {
    id: user.id,
    email: user.email,
    role,
  };
}

export function roleDashboard(role: UserRole): string {
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
