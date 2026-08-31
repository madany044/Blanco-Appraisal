import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  accent?: "primary" | "success" | "warning" | "danger" | "purple";
  onClick?: () => void;
  active?: boolean;
}

const accentColors = {
  primary: "border-t-blanco-primary",
  success: "border-t-blanco-success",
  warning: "border-t-blanco-warning",
  danger: "border-t-blanco-danger",
  purple: "border-t-blanco-purple",
};

export function StatCard({
  title,
  value,
  description,
  accent = "primary",
  onClick,
  active = false,
}: StatCardProps) {
  const clickable = !!onClick;

  return (
    <Card
      className={cn(
        "group border border-slate-200 bg-white/90 shadow-sm transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-300",
        clickable && "cursor-pointer",
        active && "border-slate-400 ring-2 ring-slate-200"
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!clickable) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-pressed={clickable ? active : undefined}
    >
      <div className={cn("h-1.5 w-full rounded-t-xl", accentColors[accent])} />

      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0">
        <p className="text-3xl font-bold tracking-tight text-slate-800">{value}</p>
        {description && <p className="mt-2 text-xs text-slate-500">{description}</p>}
      </CardContent>
    </Card>
  );
}
