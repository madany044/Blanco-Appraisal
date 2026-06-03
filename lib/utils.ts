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
    3: "Returned to HR",
    4: "Completed",
  };
  return labels[stage] ?? `Stage ${stage}`;
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

export function decimalToNumber(value: { toNumber(): number } | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  return value.toNumber();
}
