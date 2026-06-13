import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CompanyLogo } from "@/components/shared/CompanyLogo";

const CATEGORIES = [
  { href: "/employee/group-a", title: "Group A", desc: "5 Years & Above With All Departments" },
  { href: "/employee/group-b", title: "Group B", desc: "Below 5 Years With Only Modeling Department" },
  { href: "/employee/group-c", title: "Group C", desc: "Below 5 Years With Erection, Shop & Checking Departments" },
  { href: "/employee/qc", title: "QC & Engineer", desc: "_" },
];

export default function EmployeeCategoryPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative bg-blanco-primary text-white px-4 pb-10 pt-6">
        <div className="container relative mx-auto max-w-3xl">
          <Link
            href="/"
            className="absolute left-0 top-0 inline-flex items-center rounded-md px-2 py-1 text-sm text-blue-100 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Link>
          <div className="flex flex-col items-center pt-8 text-center">
            <div className="mb-5 w-fit rounded-xl bg-white px-5 py-3 shadow-md">
              <CompanyLogo size="lg" priority />
            </div>
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
              Select Your Job Category
            </h3>
          </div>
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
