"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Manager } from "@prisma/client";

export interface FilterState {
  managerId: string;
  category: string;
  stage: string;
  financialYear: string;
  search: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  managers: Manager[];
}

export function FilterBar({ filters, onChange, managers }: FilterBarProps) {
  function update(key: keyof FilterState, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap gap-4 rounded-lg border bg-white p-4">
      <Select value={filters.managerId} onValueChange={(v) => update("managerId", v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Managers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Managers</SelectItem>
          {managers.map((m) => (
            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.category} onValueChange={(v) => update("category", v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="GROUP_A">Group A</SelectItem>
          <SelectItem value="GROUP_B">Group B</SelectItem>
          <SelectItem value="GROUP_C">Group C</SelectItem>
          <SelectItem value="QC">QC</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.stage} onValueChange={(v) => update("stage", v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          <SelectItem value="0">Pending HR</SelectItem>
          <SelectItem value="1">With Manager</SelectItem>
          <SelectItem value="2">With Management</SelectItem>
          <SelectItem value="3">Returned to HR</SelectItem>
          <SelectItem value="4">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.financialYear} onValueChange={(v) => update("financialYear", v)}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="FY" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2026-27">2026-27</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Search name or code..."
        className="w-[220px]"
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
      />
    </div>
  );
}
