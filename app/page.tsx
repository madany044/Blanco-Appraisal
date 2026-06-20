import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/shared/CompanyLogo";
import { COMPANY_NAME } from "@/lib/brand";

const ROLE_CARDS = [
  {
    title: "Employee",
    subtitle: "Submit your appraisal form",
    href: "/employee",
    variant: "default" as const,
    buttonLabel: "Continue as Employee",
  },
  {
    title: "HR & Administration",
    href: "/login?role=hr",
    variant: "outline" as const,
    buttonLabel: "Login",
  },
  {
    title: "Reporting Manager",
    href: "/login?role=manager",
    variant: "outline" as const,
    buttonLabel: "Login",
  },
  {
    icon: "",
    title: "Management",
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
          <h1 className="text-4xl md:text-6xl font-extrabold mb-2 leading-tight max-w-4xl mx-auto">
            {COMPANY_NAME}
          </h1>
          <p className="text-sm md:text-base text-slate-300 mt-3 max-w-xl mx-auto leading-relaxed">
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <marquee> Welcome to the Employee Annual Appraisal Portal </marquee>
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <CompanyLogo size="xl" priority className="drop-shadow-2xl" />
        </div>

        <p className="text-center text-white/90 mb-8 text-lg font-medium tracking-wide">
          Select your role to continue
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
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
