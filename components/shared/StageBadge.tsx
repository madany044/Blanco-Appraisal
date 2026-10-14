import { correctionLabel } from "@/lib/correction-config";
import { Badge } from "@/components/ui/badge";
import { formatStage } from "@/lib/utils";

interface StageBadgeProps {
  stage: number;
  correctionStatus?: string;
}

export function StageBadge({ stage, correctionStatus }: StageBadgeProps) {
  const label = correctionLabel(correctionStatus);
  if (label) return <Badge variant="warning">{label}</Badge>;
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
