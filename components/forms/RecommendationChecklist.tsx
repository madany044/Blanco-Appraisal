"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  STRONG_REASONS,
  CONDITIONAL_REASONS,
  NOT_RECOMMENDED_REASONS,
} from "@/lib/types";

interface RecommendationChecklistProps {
  recommendation: "STRONGLY_RECOMMEND" | "CONDITIONALLY_RECOMMEND" | "NOT_RECOMMENDED";
}

export function RecommendationChecklist({ recommendation }: RecommendationChecklistProps) {
  const { watch, setValue } = useFormContext();

  const fieldMap = {
    STRONGLY_RECOMMEND: { field: "mgrStrongReasons" as const, options: STRONG_REASONS },
    CONDITIONALLY_RECOMMEND: { field: "mgrConditionalReasons" as const, options: CONDITIONAL_REASONS },
    NOT_RECOMMENDED: { field: "mgrNotRecommendedReasons" as const, options: NOT_RECOMMENDED_REASONS },
  };

  const config = fieldMap[recommendation];
  const selected: string[] = watch(config.field) ?? [];

  function toggle(reason: string, checked: boolean) {
    const next = checked
      ? [...selected, reason]
      : selected.filter((r) => r !== reason);
    setValue(config.field, next, { shouldValidate: true });
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {config.options.map((reason) => (
        <div key={reason} className="flex items-start gap-2">
          <Checkbox
            id={reason}
            checked={selected.includes(reason)}
            onCheckedChange={(c) => toggle(reason, c === true)}
          />
          <Label htmlFor={reason} className="text-sm font-normal leading-snug cursor-pointer">
            {reason}
          </Label>
        </div>
      ))}
    </div>
  );
}
