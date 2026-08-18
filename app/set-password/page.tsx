import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyLogo } from "@/components/shared/CompanyLogo";
import { SetPasswordForm } from "@/components/auth/SetPasswordForm";

export default async function SetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No active session (link expired / already used / opened directly) —
  // send them back to request a fresh one from an admin.
  if (!user) {
    redirect("/login?error=link-expired");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CompanyLogo size="sm" className="mb-3" />
          <CardTitle className="text-blanco-primary">Set your password</CardTitle>
          <CardDescription>
            Choose a password for {user.email}. You&apos;ll use this to sign in from now on.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetPasswordForm role={(user.user_metadata?.user_role as string) ?? null} />
        </CardContent>
      </Card>
    </div>
  );
}
