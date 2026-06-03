"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_LABELS } from "@/lib/types";

interface WorkflowBarProps {
  currentStage: number;
}

export function WorkflowBar({ currentStage }: WorkflowBarProps) {
  const displayStage = currentStage < 0 ? 0 : Math.min(currentStage, 4);

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {STAGE_LABELS.map((label, index) => {
          const isCompleted = displayStage > index || currentStage === 4;
          const isCurrent = displayStage === index && currentStage !== 4;
          const isFuture = displayStage < index;

          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                    isCompleted && "border-blanco-success bg-blanco-success text-white",
                    isCurrent && "border-blanco-primary bg-blanco-primary text-white workflow-pulse",
                    isFuture && "border-gray-300 bg-gray-100 text-gray-400"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs text-center max-w-[100px]",
                    isCurrent && "font-semibold text-blanco-primary",
                    isCompleted && "text-blanco-success",
                    isFuture && "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </div>
              {index < STAGE_LABELS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2",
                    displayStage > index ? "bg-blanco-success" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
