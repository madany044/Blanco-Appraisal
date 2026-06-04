import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CompanyLogo } from "@/components/shared/CompanyLogo";

const CATEGORIES = [
  { href: "/employee/group-a", title: "Group A", desc: "5 YEARS & ABOVE WITH ALL DPT" },
  { href: "/employee/group-b", title: "Group B", desc: "BELOW 5 YEARS WITH ONLY MODELING DEPT" },
  { href: "/employee/group-c", title: "Group C", desc: "BELOW 5 YEARS WITH ERECTION & SHOP& CHECKING" },
  { href: "/employee/qc", title: "QC", desc: "ALL QC  TEAM" },
];

export default function EmployeeCategoryPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blanco-primary text-white py-6 px-4">
        <div className="container mx-auto">
          <Link href="/" className="inline-flex items-center text-sm text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
          <div className="inline-flex rounded-lg bg-white/95 px-4 py-2 mb-3 shadow-sm">
            <CompanyLogo size="sm" />
          </div>
          <h1 className="text-2xl font-bold">Select Your Category</h1>
          <p className="text-blue-100 text-sm mt-1">
            Employee Progress Report Card — FY 2026-27
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {CATEGORIES.map((cat) => (
            <Card key={cat.href} className="hover:border-blanco-primary transition-colors">
              <CardHeader>
                <CardTitle>{cat.title}</CardTitle>
                <CardDescription>{cat.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={cat.href}>
                  <Button className="w-full">Open Form</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
