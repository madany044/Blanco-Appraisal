import Link from "next/link";
import { User, ShieldCheck, Briefcase, Building2, UserPlus, LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/shared/CompanyLogo";
import { COMPANY_NAME } from "@/lib/brand";

interface RoleCard {
  title: string;
  subtitle?: string;
  href: string;
  variant: "default" | "outline";
  buttonLabel: string;
  icon: LucideIcon;
}

const ROLE_CARDS: RoleCard[] = [
  {
    title: "Employee",
    subtitle: "Submit your appraisal form",
    href: "/employee",
    variant: "default",
    buttonLabel: "Continue as Employee",
    icon: User,
  },
  {
    title: "HR & Admin",
    href: "/login?role=hr",
    variant: "outline",
    buttonLabel: "Login",
    icon: ShieldCheck,
  },
  {
    title: "Manager",
    href: "/login?role=manager",
    variant: "outline",
    buttonLabel: "Login",
    icon: Briefcase,
  },
  {
    title: "Management",
    href: "/login?role=management",
    variant: "outline",
    buttonLabel: "Login",
    icon: Building2,
  },
  {
    title: "Enroll New Employees",
    href: "/login?role=dc",
    variant: "outline",
    buttonLabel: "Login",
    icon: UserPlus,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blanco-primary to-slate-800">
      <div className="container mx-auto px-4 py-16">
        
        {/* Header Section */}
        <header className="text-center text-white mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {COMPANY_NAME}
          </h1>
          <div className="overflow-hidden max-w-xl mx-auto rounded-full bg-slate-800/40 border border-slate-700/50 py-1.5 px-4 backdrop-blur-sm">
            <p className="text-sm md:text-base text-indigo-300 font-medium tracking-wide animate-pulse">
              Welcome to the Employee Annual Appraisal Portal
            </p>
          </div>
        </header>

        {/* Brand Logo */}
        <div className="flex justify-center mb-12">
          <div className="p-4 rounded-2xl bg-slate-800/20 border border-slate-700/30 backdrop-blur-md shadow-2xl">
            <CompanyLogo size="xl" priority className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
          </div>
        </div>

        <p className="text-center text-slate-300 mb-10 text-lg font-medium tracking-wide">
          Select your role to continue
        </p>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;
            
            return (
              <Card
                key={card.title}
                className="group relative flex flex-col items-center text-center bg-slate-900/60 backdrop-blur-xl border border-slate-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 ease-out overflow-hidden"
              >
                {/* Accent Top Border */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                <CardHeader className="pt-8 pb-4 w-full flex flex-col items-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300 group-hover:bg-indigo-600/20 group-hover:border-indigo-500/40 group-hover:text-indigo-400 transition-all duration-300 shadow-inner">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg font-bold tracking-tight text-slate-100">
                    {card.title}
                  </CardTitle>
                  
                  <div className="min-h-[40px] flex items-center justify-center mt-1">
                    {card.subtitle ? (
                      <CardDescription className="text-slate-400 text-xs sm:text-sm">
                        {card.subtitle}
                      </CardDescription>
                    ) : null}
                  </div>
                </CardHeader>

                <CardContent className="mt-auto pt-2 pb-6 w-full px-5">
                  <Button
                    asChild
                    variant={card.variant}
                    size="lg"
                    className={`w-full font-semibold transition-all duration-200 ${
                      card.variant === "outline"
                        ? "border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-indigo-500/50"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40"
                    }`}
                  >
                    <Link href={card.href}>{card.buttonLabel}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}