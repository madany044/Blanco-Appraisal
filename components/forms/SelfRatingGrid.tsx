"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

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
          <Label className="mb-3 block">{item.label}</Label>
          <Controller
            name={item.name}
            control={control}
            render={({ field }) => {
              const value = Number(field.value ?? 0);
              return (
                <div className="flex items-center gap-4">
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[value]}
                    onValueChange={([v]) => field.onChange(v)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    className="w-16"
                    value={value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  <span className="text-sm text-muted-foreground w-8">/10</span>
                </div>
              );
            }}
          />
        </div>
      ))}
    </div>
  );
}
