"use client";

import { useEffect, useMemo } from "react";
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

const TEAM_MANAGER_MAP: Record<string, string> = {
  "team 1": "Yogesha S",
  "team 2": "Shashikumar M S",
  "team 3": "Naveena G S",
  "team 4": "Kumaraswamy M P",
  "team 5": "Pradeep Kumar B S",
  "team 6": "Deepu M C",
  "team 7": "Sudeep M C",
  "team qc / engineering": "Sudeep M C",
  "qc / engineering": "Sudeep M C",
};

interface FormHeaderProps {
  managers: Manager[];
  lockedEmployeeCode?: string;
}

export function FormHeader({ managers, lockedEmployeeCode }: FormHeaderProps) {
  const { register, control, setValue, watch, formState: { errors } } = useFormContext();
  const managerId = watch("managerId");
  const selectedTeam = watch("team") ?? "";
  const selectedManagerName = useMemo(() => {
    if (!managerId) return "";
    return managers.find((manager) => manager.id === managerId)?.name ?? "";
  }, [managerId, managers]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setValue("dateOfSubmission", today);
  }, [setValue, today]);

  useEffect(() => {
    const teamKey = selectedTeam.trim().toLowerCase();

    if (!teamKey) {
      setValue("managerId", "", { shouldValidate: false });
      return;
    }

    const mappedManagerName = TEAM_MANAGER_MAP[teamKey];

    if (!mappedManagerName) {
      setValue("managerId", "", { shouldValidate: false });
      return;
    }

    const matchedManager = managers.find(
      (manager) => manager.name?.toLowerCase() === mappedManagerName.toLowerCase()
    );

    setValue("managerId", matchedManager?.id ?? "", { shouldValidate: false });
  }, [selectedTeam, managers, setValue]);

  return (
    <div className="rounded-lg border-2 border-blanco-primary/30 bg-slate-50 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-blanco-primary">Employee Information</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="employeeName">Employee Name <span className="text-red-500">*</span></Label>
          <Input id="employeeName" {...register("employeeName")} />
          {errors.employeeName && (
            <p className="text-sm text-blanco-danger mt-1">{String(errors.employeeName.message)}</p>
          )}
        </div>
        <div>
          <Label htmlFor="employeeCode">Employee ID / Code <span className="text-red-500">*</span></Label>
          <Input
            id="employeeCode"
            {...register("employeeCode")}
            readOnly={!!lockedEmployeeCode}
            disabled={!!lockedEmployeeCode}
            className={lockedEmployeeCode ? "bg-slate-100" : undefined}
          />
          {lockedEmployeeCode ? (
            <p className="text-xs text-muted-foreground mt-1">Locked after face verification.</p>
          ) : null}
          {errors.employeeCode && (
            <p className="text-sm text-blanco-danger mt-1">{String(errors.employeeCode.message)}</p>
          )}
        </div>
        <div>
          <Label htmlFor="team">Team <span className="text-red-500">*</span> </Label>
          <Controller
            name="team"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your Team Name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team 1">Team 1</SelectItem>
                  <SelectItem value="Team 2">Team 2</SelectItem>
                  <SelectItem value="Team 3">Team 3</SelectItem>
                  <SelectItem value="Team 4">Team 4</SelectItem>
                  <SelectItem value="Team 5">Team 5</SelectItem>
                  <SelectItem value="Team 6">Team Admin</SelectItem>
                  <SelectItem value="Team 7">Team QC / Engineering</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.team && (
            <p className="text-sm text-blanco-danger mt-1">{String(errors.team.message)}</p>
          )}
        </div>
        <div>
          <Label>Manager Name <span className="text-red-500">*</span></Label>
          <Input
            value={selectedManagerName}
            readOnly
            disabled
            placeholder="Manager will be assigned automatically from your team"
            className="bg-slate-100"
          />
          {!selectedManagerName && selectedTeam ? (
            <p className="text-xs text-amber-600 mt-1">
              No manager mapping is available for this team yet. Please contact support.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Manager is assigned automatically based on your selected team.
            </p>
          )}
          {errors.managerId && (
            <p className="text-sm text-blanco-danger mt-1">{String(errors.managerId.message)}</p>
          )}
        </div>
        <div>
          <Label htmlFor="designation">Designation <span className="text-red-500">*</span> </Label>
          <Controller
            name="designation"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={(value) => field.onChange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shop Drawing">Shop Drawing</SelectItem>
                  <SelectItem value="Erection Drawing">Erection Drawing</SelectItem>
                  <SelectItem value="Modeling">Modeling</SelectItem>
                  <SelectItem value="Checking">Checking</SelectItem>
                  <SelectItem value="Project Lead">Project Lead</SelectItem>
                  <SelectItem value="Project Engineer">Project Engineer</SelectItem>
                  <SelectItem value="Junior Project Engineer">Junior Project Engineer</SelectItem>
                  <SelectItem value="Senior Project Engineer">Senior Project Engineer</SelectItem>
                  <SelectItem value="Executive Design Engineer">Executive Design Engineer</SelectItem>
                  <SelectItem value="Senior Executive Design Engineer">Senior Executive Design Engineer</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label>Date</Label>
          <Input value={today} readOnly disabled className="bg-muted" />
        </div>
        <div>
          <Label htmlFor="prevExperienceYears"> Previous number of years experience in this field <br /> (if applicable) </Label>
          <Input id="prevExperienceYears" {...register("prevExperienceYears")} />
        </div>
        <div>
          <Label htmlFor="companyExperienceYears"> Number of years experience in this company <span className="text-red-500">*</span> </Label>

          <Input id="companyExperienceYears" {...register("companyExperienceYears")} />
        </div>
      </div>
    </div>
  );
}