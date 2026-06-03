"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type AccentColor = "blue" | "green" | "amber" | "purple";

const accentMap: Record<AccentColor, string> = {
  blue: "border-l-blanco-primary",
  green: "border-l-blanco-success",
  amber: "border-l-blanco-warning",
  purple: "border-l-blanco-purple",
};

interface ChainSectionProps {
  title: string;
  accent: AccentColor;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
}

export function ChainSection({
  title,
  accent,
  defaultOpen = true,
  children,
  badge,
}: ChainSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn("rounded-lg border border-l-4 bg-white shadow-sm", accentMap[accent])}>
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-slate-50">
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          <h3 className="text-lg font-semibold">{title}</h3>
          {badge}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}
