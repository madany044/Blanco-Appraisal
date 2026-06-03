import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  accent?: "primary" | "success" | "warning" | "danger" | "purple";
}

const accentColors = {
  primary: "border-t-blanco-primary",
  success: "border-t-blanco-success",
  warning: "border-t-blanco-warning",
  danger: "border-t-blanco-danger",
  purple: "border-t-blanco-purple",
};

export function StatCard({ title, value, description, accent = "primary" }: StatCardProps) {
  return (
    <Card className={cn("border-t-4", accentColors[accent])}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
