"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  STRONG_REASONS,
  CONDITIONAL_REASONS,
  NOT_RECOMMENDED_REASONS,
} from "@/lib/types";
import type { ManagerFormValues } from "@/lib/validations/manager-form.schema";

const GROUPS = [
  {
    level: "STRONGLY_RECOMMEND" as const,
    title: "I Strongly recommend this employee",
    field: "mgrStrongReasons" as const,
    options: STRONG_REASONS,
  },
  {
    level: "CONDITIONALLY_RECOMMEND" as const,
    title: "I May recommend this employee",
    field: "mgrConditionalReasons" as const,
    options: CONDITIONAL_REASONS,
  },
  {
    level: "NOT_RECOMMENDED" as const,
    title: "I May OR May Not recommend this employee",
    field: "mgrNotRecommendedReasons" as const,
    options: NOT_RECOMMENDED_REASONS,
  },
];

export function RecommendationChecklist() {
  const { watch, setValue } = useFormContext<ManagerFormValues>();
  const selectedLevels: string[] = watch("mgrRecommendation") ?? [];

  function toggleLevel(level: ManagerFormValues["mgrRecommendation"][number], checked: boolean) {
    const next = checked
      ? [...selectedLevels, level]
      : selectedLevels.filter((l) => l !== level);
    setValue("mgrRecommendation", next as ManagerFormValues["mgrRecommendation"], {
      shouldValidate: true,
    });
    if (!checked) {
      const group = GROUPS.find((g) => g.level === level);
      if (group) setValue(group.field, [], { shouldValidate: true });
    }
  }

  return (
    <div className="space-y-6">
      {GROUPS.map((group) => {
        const levelChecked = selectedLevels.includes(group.level);
        const reasons: string[] = watch(group.field) ?? [];

        function toggleReason(reason: string, checked: boolean) {
          const next = checked
            ? [...reasons, reason]
            : reasons.filter((r) => r !== reason);
          setValue(group.field, next, { shouldValidate: true });
        }

        return (
          <div key={group.level} className="rounded-lg border p-4">
            <div className="flex items-start gap-2">
              <Checkbox
                id={`level-${group.level}`}
                checked={levelChecked}
                onCheckedChange={(c) => toggleLevel(group.level, c === true)}
              />
              <Label htmlFor={`level-${group.level}`} className="cursor-pointer font-semibold">
                {group.title}
              </Label>
            </div>
            {levelChecked && (
              <div className="mt-4 grid gap-3 md:grid-cols-2 pl-6">
                {group.options.map((reason) => (
                  <div key={reason} className="flex items-start gap-2">
                    <Checkbox
                      id={`${group.level}-${reason}`}
                      checked={reasons.includes(reason)}
                      onCheckedChange={(c) => toggleReason(reason, c === true)}
                    />
                    <Label
                      htmlFor={`${group.level}-${reason}`}
                      className="text-sm font-normal leading-snug cursor-pointer"
                    >
                      {reason}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
