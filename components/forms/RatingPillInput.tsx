"use client";

import { cn } from "@/lib/utils";

const RATING_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

interface RatingPillInputProps {
  value: number | null | undefined;
  onChange: (value: number) => void;
  readOnly?: boolean;
  label?: string;
}

export function RatingPillInput({ value, onChange, readOnly, label }: RatingPillInputProps) {
  const selected = value ?? null;

  if (readOnly) {
    return <RatingPillReadOnly value={selected} label={label} />;
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-[#1e2740]">{label}</p>}
      <div className="flex flex-wrap gap-1.5">
        {RATING_VALUES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "rounded-full border px-[10px] py-[6px] text-[14px] font-medium transition-colors",
              selected === n
                ? "border-[#1a4b8c] bg-[#1a4b8c] text-white"
                : "border-gray-300 bg-white text-gray-600 hover:border-[#1a4b8c]/50"
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Selected: {selected ?? "—"}/10
      </p>
    </div>
  );
}

export function RatingPillReadOnly({
  value,
  label,
}: {
  value: number | null | undefined;
  label?: string;
}) {
  const selected = value ?? null;

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-[#1e2740]">{label}</p>}
      <div className="flex flex-wrap gap-1.5">
        {RATING_VALUES.map((n) => (
          <span
            key={n}
            className={cn(
              "rounded-full border px-[10px] py-[6px] text-[14px] font-medium",
              selected === n
                ? "border-[#1a4b8c] bg-[#1a4b8c] text-white"
                : "border-gray-300 bg-white text-gray-500"
            )}
          >
            {n}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Selected: {selected ?? "—"}/10
      </p>
    </div>
  );
}
