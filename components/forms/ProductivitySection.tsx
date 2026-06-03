"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldDef {
  name: string;
  label: string;
}

const SHOP_FIELDS: FieldDef[] = [
  { name: "prodSimpleBeam", label: "Simple beam and simple column drawings per/hour" },
  { name: "prodMediumBeam", label: "Medium beam and medium column drawings per/hour" },
  { name: "prodComplexBeam", label: "Complex beam and complex column drawings per/hour" },
  { name: "prodStair", label: "Standard stair drawings per/hour" },
  { name: "prodStairRail", label: "Standard stair rail drawings per/hour" },
  { name: "prodRoofFrame", label: "Standard roof frame drawings per/hour" },
  { name: "prodSimpleLadder", label: "Simple ladder drawings per/hour" },
  { name: "prodCagedLadder", label: "Caged ladder drawings per/hour" },
  { name: "prodLoosePieces", label: "Loose pieces assembly drawings per/hour" },
  { name: "prodSinglePart", label: "Single part drawings per/hour" },
  { name: "prodCheckAbHours", label: "Hours to check Single sheet AB plan and section views" },
  { name: "prodCheckEplanHours", label: "Hours to check Single sheet E-plan and section views" },
];

const DRAFT_FIELDS: FieldDef[] = [
  { name: "prodDraftAbHours", label: "Hours to complete drafting Single sheet AB plan" },
  { name: "prodDraftEplanHours", label: "Hours to complete drafting Single sheet E-plan" },
  { name: "prodDraftCagedLadder", label: "Hours to complete caged ladder E-plan and section views" },
  { name: "prodDraftStairs", label: "Hours to complete drafting two flight stairs with rails" },
];

export function ProductivitySection() {
  const { register } = useFormContext();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-blanco-primary mb-4">Shop Drafting and Checker</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {SHOP_FIELDS.map((f) => (
            <div key={f.name}>
              <Label htmlFor={f.name}>{f.label}</Label>
              <Input id={f.name} {...register(f.name)} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-blanco-primary mb-4">E-Drafting</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {DRAFT_FIELDS.map((f) => (
            <div key={f.name}>
              <Label htmlFor={f.name}>{f.label}</Label>
              <Input id={f.name} {...register(f.name)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
