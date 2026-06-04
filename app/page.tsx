import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Shield, Building2 } from "lucide-react";
import { CompanyLogo } from "@/components/shared/CompanyLogo";
import { COMPANY_NAME, COMPANY_ADDRESS } from "@/lib/brand";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blanco-primary to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight max-w-3xl mx-auto">
            {COMPANY_NAME}
          </h1>
          <p className="text-xs text-slate-300 mt-3 max-w-xl mx-auto leading-relaxed">
            {COMPANY_ADDRESS}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="rounded-xl bg-white/95 px-6 py-4 shadow-lg ring-1 ring-white/20">
            <CompanyLogo size="md" priority />
          </div>
        </div>

        <p className="text-center text-white/90 mb-8 text-lg font-medium tracking-wide">
          Select your role to continue
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-blanco-primary mb-2" />
              <CardTitle>Employee</CardTitle>
              <CardDescription>
                Submit your appraisal form — no login required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/employee">
                <Button className="w-full" size="lg">Continue as Employee</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <Shield className="h-10 w-10 text-blanco-success mb-2" />
              <CardTitle>HR / Manager / Management</CardTitle>
              <CardDescription>Secure login for authorized User</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button variant="outline" className="w-full" size="lg">
                  Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-blanco-purple/30">
            <CardHeader>
              <Building2 className="h-10 w-10 text-blanco-purple mb-2" />
              <CardTitle>About</CardTitle>
              <CardDescription>Steel detailing salary appraisal workflow</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
