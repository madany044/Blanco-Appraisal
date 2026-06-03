import { Badge } from "@/components/ui/badge";
import { formatStage } from "@/lib/utils";

interface StageBadgeProps {
  stage: number;
}

export function StageBadge({ stage }: StageBadgeProps) {
  const variant =
    stage === 4
      ? "success"
      : stage === 3
        ? "purple"
        : stage === 2
          ? "warning"
          : stage === 1
            ? "secondary"
            : stage === 0
              ? "default"
              : "outline";

  return <Badge variant={variant}>{formatStage(stage)}</Badge>;
}
