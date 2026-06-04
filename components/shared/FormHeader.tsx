"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Manager } from "@prisma/client";

interface FormHeaderProps {
  managers: Manager[];
}

export function FormHeader({ managers }: FormHeaderProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const managerId = watch("managerId");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setValue("dateOfSubmission", today);
  }, [setValue, today]);

  return (
    <div className="rounded-lg border-2 border-blanco-primary/30 bg-slate-50 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-blanco-primary">Employee Information</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="employeeName">Employee Name *</Label>
          <Input id="employeeName" {...register("employeeName")} />
          {errors.employeeName && (
            <p className="text-sm text-blanco-danger mt-1">{String(errors.employeeName.message)}</p>
          )}
        </div>
        <div>
          <Label htmlFor="employeeCode">Employee ID / Code *</Label>
          <Input id="employeeCode" {...register("employeeCode")} />
          {errors.employeeCode && (
            <p className="text-sm text-blanco-danger mt-1">{String(errors.employeeCode.message)}</p>
          )}
        </div>
        <div>
          <Label>Manager Name *</Label>
          <Select value={managerId ?? ""} onValueChange={(v) => setValue("managerId", v, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Select your Team Head" />
            </SelectTrigger>
            <SelectContent>
              {managers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.managerId && (
            <p className="text-sm text-blanco-danger mt-1">{String(errors.managerId.message)}</p>
          )}
        </div>
        <div>
          <Label htmlFor="teamDesignation">Team & Designation</Label>
          <Input id="teamDesignation" {...register("teamDesignation")} />
        </div>
        <div>
          <Label>Date</Label>
          <Input value={today} readOnly disabled className="bg-muted" />
        </div>
        <div>
          <Label htmlFor="prevExperienceYears">Previous no of years experience in this field (if applicable)</Label>
          <Input id="prevExperienceYears" {...register("prevExperienceYears")} />
        </div>
        <div>
          <Label htmlFor="companyExperienceYears">No of years experience in this company</Label>
          <Input id="companyExperienceYears" {...register("companyExperienceYears")} />
        </div>
        <div>
          <Label htmlFor="currentSalary">Current Monthly Salary (₹) *</Label>
          <Input
            id="currentSalary"
            type="number"
            min={0}
            placeholder="Enter your current monthly salary"
            {...register("currentSalary", { valueAsNumber: true })}
          />
          {errors.currentSalary && (
            <p className="text-sm text-blanco-danger mt-1">{String(errors.currentSalary.message)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
