"use client";

import { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
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
  const { register, control, setValue, watch, formState: { errors } } = useFormContext();
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
          <Label htmlFor="team">Team</Label>
          <Controller
            name="team"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team 1">Team 1</SelectItem>
                  <SelectItem value="Team 2">Team 2</SelectItem>
                  <SelectItem value="Team 3">Team 3</SelectItem>
                  <SelectItem value="Team 4">Team 4</SelectItem>
                  <SelectItem value="Team 5">Team 5</SelectItem>
                  <SelectItem value="Team 6">Team 6</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.team && (
            <p className="text-sm text-blanco-danger mt-1">{String(errors.team.message)}</p>
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
          <Label htmlFor="designation">Designation</Label>
          <Input id="designation" {...register("designation")} />
        </div>
        <div>
          <Label>Date</Label>
          <Input value={today} readOnly disabled className="bg-muted" />
        </div>
        <div>
          <Label htmlFor="prevExperienceYears">Previous number of years experience in this field (if applicable)</Label>
          <Input id="prevExperienceYears" {...register("prevExperienceYears")} />
        </div>
        <div>
          <Label htmlFor="companyExperienceYears">Number of years experience in this company</Label>
          <Input id="companyExperienceYears" {...register("companyExperienceYears")} />
        </div>
      </div>
    </div>
  );
}
