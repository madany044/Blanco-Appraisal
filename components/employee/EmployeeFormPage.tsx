"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UniversalAppraisalForm } from "@/components/forms/UniversalAppraisalForm";
import type { AppraisalCategory } from "@/lib/types";
import type { Manager } from "@prisma/client";

interface EmployeeFormPageProps {
  category: AppraisalCategory;
  title: string;
}

export function EmployeeFormPage({ category, title }: EmployeeFormPageProps) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/managers")
      .then((r) => r.json())
      .then((data) => {
        setManagers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/employee" className="inline-flex items-center text-sm text-blanco-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" /> Change category
        </Link>
        <h1 className="text-2xl font-bold text-blanco-primary mt-4">{title}</h1>
      </div>
      {loading ? (
        <p className="text-center text-muted-foreground">Loading form...</p>
      ) : (
        <UniversalAppraisalForm category={category} managers={managers} />
      )}
    </div>
  );
}
