"use client";

import { useFormContext, Controller } from "react-hook-form";
import { RatingPillInput } from "@/components/forms/RatingPillInput";

interface RatingItem {
  name: string;
  label: string;
}

interface SelfRatingGridProps {
  items: RatingItem[];
}

export function SelfRatingGrid({ items }: SelfRatingGridProps) {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.name} className="rounded-lg border p-4">
          <Controller
            name={item.name}
            control={control}
            render={({ field }) => (
              <RatingPillInput
                label={item.label}
                value={field.value as number | undefined}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      ))}
    </div>
  );
}
