import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";
import type { AppraisalSubmission, Prisma } from "@prisma/client";

const VALID_TRANSITIONS: Record<number, number[]> = {
  [-1]: [0],
  0: [1],
  1: [2, 0],
  2: [3],
  3: [4],
  4: [],
};

export function canTransition(from: number, to: number): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function transitionStage(
  id: string,
  fromStage: number,
  toStage: number,
  extraData: Prisma.AppraisalSubmissionUpdateInput = {}
): Promise<AppraisalSubmission> {
  if (!canTransition(fromStage, toStage)) {
    throw new Error(`Invalid stage transition: ${fromStage} → ${toStage}`);
  }

  const timestamps: Prisma.AppraisalSubmissionUpdateInput = {};

  if (toStage === 0 && fromStage === -1) {
    timestamps.submittedAt = new Date();
  }
  if (toStage === 1) timestamps.hrFilledAt = new Date();
  if (toStage === 2) timestamps.managerFilledAt = new Date();
  if (toStage === 3) timestamps.managementFilledAt = new Date();
  if (toStage === 4) timestamps.completedAt = new Date();

  return prisma.appraisalSubmission.update({
    where: { id, stage: fromStage },
    data: {
      stage: toStage,
      ...timestamps,
      ...extraData,
    },
  });
}

export function getMaxIncrementPct(
  ctc: number,
  slabs: { ctcMin: number; ctcMax: number | null; maxPct: Parameters<typeof decimalToNumber>[0] }[]
): number {
  const slab = slabs.find((s) => {
    const max = s.ctcMax ?? Infinity;
    return ctc >= s.ctcMin && ctc <= max;
  });
  return slab ? decimalToNumber(slab.maxPct) : 0;
}
