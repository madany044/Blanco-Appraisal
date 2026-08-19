"use client";

import { Controller, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { SELF_RATING_ITEMS, selfRatingLabel } from "@/lib/form-questions";
import type { AppraisalSubmission } from "@prisma/client";

const RATING_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function EmployeeScoreBadge({ value }: { value: number | null | undefined }) {
  if (value == null) {
    return (
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 text-sm text-gray-400">
        —
      </span>
    );
  }
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a4b8c] text-sm font-bold text-white">
      {value}
    </span>
  );
}

/**
 * One self-rating question: employee's own score on the left (read-only,
 * blue, exactly as they submitted it), and the manager's own 0-10 picker on
 * the right (red) so the manager can respond to that specific item instead
 * of only leaving a general comment.
 */
function CompareRow({
  employeeLabel,
  employeeScore,
  mgrKey,
}: {
  employeeLabel: string;
  employeeScore: number | null;
  mgrKey: string;
}) {
  const { control } = useFormContext();

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4" data-field={mgrKey}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <EmployeeScoreBadge value={employeeScore} />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Employee&apos;s self-rating
            </p>
            <p className="text-sm text-[#1e2740]">{employeeLabel}</p>
          </div>
        </div>

        <Controller
          name={mgrKey}
          control={control}
          render={({ field }) => {
            const selected = (field.value as number | null | undefined) ?? null;
            const diff = selected != null && employeeScore != null ? selected - employeeScore : null;

            return (
              <div className="sm:w-[300px] sm:shrink-0">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#a83232]">
                    Your rating
                  </p>
                  {diff != null && diff !== 0 && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        diff < 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                      )}
                    >
                      {diff > 0 ? `▲ ${diff} higher` : `▼ ${Math.abs(diff)} lower`}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {RATING_VALUES.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => field.onChange(n)}
                      className={cn(
                        "h-7 w-7 rounded-full border text-[12px] font-medium transition-colors",
                        selected === n
                          ? "border-[#a83232] bg-[#a83232] text-white"
                          : "border-gray-300 bg-white text-gray-600 hover:border-[#a83232]/50"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

export function SelfRatingCompareList({ submission }: { submission: AppraisalSubmission }) {
  return (
    <div className="space-y-3">
      {SELF_RATING_ITEMS.map((item) => (
        <CompareRow
          key={item.mgrKey}
          employeeLabel={selfRatingLabel(item)}
          employeeScore={submission[item.key as keyof AppraisalSubmission] as number | null}
          mgrKey={item.mgrKey}
        />
      ))}
    </div>
  );
}
