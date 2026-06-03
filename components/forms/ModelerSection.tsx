"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { AppraisalCategory } from "@/lib/types";

const MODELER_FIELDS = [
  { name: "prodModSimpleConnection", label: "Simple standard connection (141,142,144,146) per/hour" },
  { name: "prodModDirectWeld", label: "Direct weld Moment connections per/hour" },
  { name: "prodModMomentPlate", label: "Moment plate connections per/hour" },
  { name: "prodModWeldedTube", label: "Welded tube brace connections per hour" },
  { name: "prodModBoltedBrace", label: "Bolted brace connections per hour" },
  { name: "prodModStairsHours", label: "Hours to complete two flight stairs with rails" },
  { name: "prodModRfiTime", label: "Hours/minutes to create simple RFI" },
  { name: "prodModMemberPlacingHours", label: "Hours to complete member placing of reference sketch" },
];

interface ModelerSectionProps {
  category: AppraisalCategory;
}

export function ModelerSection({ category }: ModelerSectionProps) {
  const { register, setValue } = useFormContext();
  const showModeler = category === "GROUP_A" || category === "QC";

  useEffect(() => {
    if (!showModeler) {
      setValue("modelerSectionNa", true);
    }
  }, [showModeler, setValue]);

  if (!showModeler) {
    return (
      <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-8 text-center">
        <Badge variant="warning" className="mb-4">N/A</Badge>
        <p className="text-amber-800 font-medium">
          This section is not applicable for your category
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {MODELER_FIELDS.map((f) => (
        <div key={f.name}>
          <Label htmlFor={f.name}>{f.label}</Label>
          <Input id={f.name} {...register(f.name)} />
        </div>
      ))}
    </div>
  );
}
