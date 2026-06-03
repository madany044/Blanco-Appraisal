"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ManagementFormValues } from "@/lib/validations/management-form.schema";

const MONTHLY_PRESENT_FIELDS = [
  { key: "salaryBasicPresent", label: "Basic", editable: false },
  { key: "salaryDaPresent", label: "DA", editable: false },
  { key: "salaryHraPresent", label: "House Rent Allowance", editable: false },
  { key: "salaryCityAllowancePresent", label: "City Compensation Allowance", editable: false },
  { key: "salaryConveyancePresent", label: "Conveyance", editable: false },
  { key: "salaryMedicalPresent", label: "Medical Allowance", editable: false },
  { key: "salaryEducationPresent", label: "Education Allowance", editable: false },
  { key: "salaryLtaPresent", label: "LTA", editable: false },
  { key: "salarySpecialPresent", label: "Special Allowance", editable: false },
] as const;

const DEDUCTION_FIELDS = [
  { key: "salaryPfDeduction", label: "PF 12% deduction" },
  { key: "salaryEsicDeduction", label: "ESIC 0.75% deduction" },
  { key: "salaryPtDeduction", label: "Professional Tax deduction" },
] as const;

const CTC_EXTRA_FIELDS = [
  { key: "salaryEmployerPfPresent", label: "Employer PF 12%" },
  { key: "salaryBonusPresent", label: "Bonus" },
  { key: "salaryEmployerEsicPresent", label: "Employer ESIC 3.25%" },
  { key: "salaryMedicalInsurancePresent", label: "Medical Insurance" },
] as const;

interface SalaryBreakdownTableProps {
  readOnly?: boolean;
  onTotalsChange?: (totals: {
    grossPresent: number;
    grossProposed: number;
    netPresent: number;
    netProposed: number;
    ctcPresent: number;
    ctcProposed: number;
  }) => void;
}

export function SalaryBreakdownTable({ readOnly = false, onTotalsChange }: SalaryBreakdownTableProps) {
  const { register, setValue, control } = useFormContext<ManagementFormValues>();
  const values = useWatch({ control });

  const num = (k: keyof ManagementFormValues) => Number(values[k] ?? 0);

  const grossPresent = MONTHLY_PRESENT_FIELDS.reduce((s, f) => s + num(f.key), 0);
  const grossProposed =
    num("salaryBasicPresent") +
    num("salaryDaPresent") +
    num("salaryHraPresent") +
    num("salaryCityAllowanceProposed") +
    num("salaryConveyancePresent") +
    num("salaryMedicalPresent") +
    num("salaryEducationPresent") +
    num("salaryLtaPresent") +
    num("salarySpecialProposed");

  const deductions =
    num("salaryPfDeduction") + num("salaryEsicDeduction") + num("salaryPtDeduction");
  const netPresent = grossPresent - deductions;
  const netProposed = grossProposed - deductions;

  const ctcExtras = CTC_EXTRA_FIELDS.reduce((s, f) => s + num(f.key), 0);
  const ctcPresent = grossPresent * 12 + ctcExtras * 12;
  const ctcProposed = grossProposed * 12 + ctcExtras * 12;

  useEffect(() => {
    if (!readOnly && ctcPresent > 0) {
      const pct = ((ctcProposed - ctcPresent) / ctcPresent) * 100;
      setValue("mgmtIncrementPercentage", Math.round(pct * 100) / 100);
    }
    onTotalsChange?.({
      grossPresent,
      grossProposed,
      netPresent,
      netProposed,
      ctcPresent,
      ctcProposed,
    });
  }, [grossPresent, grossProposed, netPresent, netProposed, ctcPresent, ctcProposed, setValue, readOnly, onTotalsChange]);

  function proposedValue(key: string): number {
    if (key === "salaryCityAllowancePresent") return num("salaryCityAllowanceProposed");
    if (key === "salarySpecialPresent") return num("salarySpecialProposed");
    return num(key as keyof ManagementFormValues);
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Component</TableHead>
            <TableHead>Monthly Present</TableHead>
            <TableHead>Monthly Proposed</TableHead>
            <TableHead>Annual Present</TableHead>
            <TableHead>Annual Proposed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MONTHLY_PRESENT_FIELDS.map((row) => (
            <TableRow key={row.key}>
              <TableCell className="font-medium">{row.label}</TableCell>
              <TableCell>
                {readOnly ? (
                  num(row.key).toLocaleString("en-IN")
                ) : (
                  <Input type="number" step="0.01" {...register(row.key, { valueAsNumber: true })} className="w-28" />
                )}
              </TableCell>
              <TableCell>
                {row.key === "salaryCityAllowancePresent" && !readOnly ? (
                  <Input type="number" step="0.01" {...register("salaryCityAllowanceProposed", { valueAsNumber: true })} className="w-28" />
                ) : row.key === "salarySpecialPresent" && !readOnly ? (
                  <Input type="number" step="0.01" {...register("salarySpecialProposed", { valueAsNumber: true })} className="w-28" />
                ) : (
                  proposedValue(row.key).toLocaleString("en-IN")
                )}
              </TableCell>
              <TableCell>{(num(row.key) * 12).toLocaleString("en-IN")}</TableCell>
              <TableCell>{(proposedValue(row.key) * 12).toLocaleString("en-IN")}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-slate-100 font-bold">
            <TableCell>TOTAL GROSS SALARY</TableCell>
            <TableCell>{grossPresent.toLocaleString("en-IN")}</TableCell>
            <TableCell>{grossProposed.toLocaleString("en-IN")}</TableCell>
            <TableCell>{(grossPresent * 12).toLocaleString("en-IN")}</TableCell>
            <TableCell>{(grossProposed * 12).toLocaleString("en-IN")}</TableCell>
          </TableRow>
          {DEDUCTION_FIELDS.map((row) => (
            <TableRow key={row.key}>
              <TableCell>{row.label}</TableCell>
              <TableCell colSpan={2}>
                {readOnly ? num(row.key).toLocaleString("en-IN") : (
                  <Input type="number" step="0.01" {...register(row.key, { valueAsNumber: true })} className="w-28" />
                )}
              </TableCell>
              <TableCell colSpan={2}>{(num(row.key) * 12).toLocaleString("en-IN")}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold">
            <TableCell>TOTAL DEDUCTIONS</TableCell>
            <TableCell colSpan={2}>{deductions.toLocaleString("en-IN")}</TableCell>
            <TableCell colSpan={2}>{(deductions * 12).toLocaleString("en-IN")}</TableCell>
          </TableRow>
          <TableRow className="bg-green-50 font-bold">
            <TableCell>TAKE HOME / NET SALARY</TableCell>
            <TableCell>{netPresent.toLocaleString("en-IN")}</TableCell>
            <TableCell>{netProposed.toLocaleString("en-IN")}</TableCell>
            <TableCell>{(netPresent * 12).toLocaleString("en-IN")}</TableCell>
            <TableCell>{(netProposed * 12).toLocaleString("en-IN")}</TableCell>
          </TableRow>
          {CTC_EXTRA_FIELDS.map((row) => (
            <TableRow key={row.key}>
              <TableCell>{row.label}</TableCell>
              <TableCell colSpan={2}>
                {readOnly ? num(row.key).toLocaleString("en-IN") : (
                  <Input type="number" step="0.01" {...register(row.key, { valueAsNumber: true })} className="w-28" />
                )}
              </TableCell>
              <TableCell colSpan={2}>{(num(row.key) * 12).toLocaleString("en-IN")}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-blanco-primary/10 font-bold text-blanco-primary">
            <TableCell>Total CTC (Annual)</TableCell>
            <TableCell colSpan={2}>{ctcPresent.toLocaleString("en-IN")}</TableCell>
            <TableCell colSpan={2}>{ctcProposed.toLocaleString("en-IN")}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
