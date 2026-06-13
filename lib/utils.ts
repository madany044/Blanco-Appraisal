import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatStage(stage: number): string {
  const labels: Record<number, string> = {
    [-1]: "Draft",
    0: "Submitted",
    1: "With Manager",
    2: "With Management",
    3: "Ready To Export",
    4: "Completed",
  };
  return labels[stage] ?? `Stage ${stage}`;
}

export function getDefaultEffectiveDate(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split("T")[0];
}

export function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    GROUP_A: "Group A",
    GROUP_B: "Group B",
    GROUP_C: "Group C",
    QC: "QC",
  };
  return map[category] ?? category;
}

export function decimalToNumber(
  value: { toNumber(): number } | number | string | null | undefined
): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value) || 0;
  return value.toNumber();
}

export type SerializedIncrementSlab = {
  id: number;
  ctcMin: number;
  ctcMax: number | null;
  maxPct: number;
};

export function serializeIncrementSlabs(
  slabs: { id: number; ctcMin: number; ctcMax: number | null; maxPct: Parameters<typeof decimalToNumber>[0] }[]
): SerializedIncrementSlab[] {
  return slabs.map((s) => ({
    id: s.id,
    ctcMin: s.ctcMin,
    ctcMax: s.ctcMax,
    maxPct: decimalToNumber(s.maxPct),
  }));
}
