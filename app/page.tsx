import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/shared/CompanyLogo";
import { COMPANY_NAME, COMPANY_ADDRESS } from "@/lib/brand";

const ROLE_CARDS = [
  {
    icon: "👤",
    title: "Employee",
    subtitle: "Submit your appraisal form",
    href: "/employee",
    variant: "default" as const,
    buttonLabel: "Continue as Employee",
  },
  {
    icon: "🏢",
    title: "HR & Administration",
    subtitle: "Review and process submissions",
    href: "/login?role=hr",
    variant: "outline" as const,
    buttonLabel: "Login",
  },
  {
    icon: "👔",
    title: "Reporting Manager",
    subtitle: "Review team appraisals and add remarks",
    href: "/login?role=manager",
    variant: "outline" as const,
    buttonLabel: "Login",
  },
  {
    icon: "🏛️",
    title: "Management",
    subtitle: "Final increment decisions",
    href: "/login?role=management",
    variant: "outline" as const,
    buttonLabel: "Login",
  },
];

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

        <div className="flex justify-center mb-10">
          <CompanyLogo size="xl" priority className="drop-shadow-2xl" />
        </div>

        <p className="text-center text-white/90 mb-8 text-lg font-medium tracking-wide">
          Select your role to continue
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {ROLE_CARDS.map((card) => (
            <Card key={card.title} className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <span className="text-4xl mb-2 block" aria-hidden>
                  {card.icon}
                </span>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={card.href}>
                  <Button className="w-full" size="lg" variant={card.variant}>
                    {card.buttonLabel}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
