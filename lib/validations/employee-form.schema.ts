import { z } from "zod";

const rating = z.union([
  z.number().min(0).max(10),
  z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num)) throw new Error("Rating must be a number");
    if (num < 0 || num > 10) throw new Error("Rating must be between 0 and 10");
    return num;
  })
]).refine((val) => val >= 0 && val <= 10, "Rating is required");

const optionalRating = rating.optional();

export const employeeFormSchema = z.object({
  employeeName: z.string().min(1, "Employee name is required"),
  employeeCode: z.string().min(1, "Employee code is required"),
  managerId: z.union([z.string().uuid("Select a manager"), z.literal("")]).optional(),
  team: z.string().optional(),
  designation: z.string().optional(),
  prevExperienceYears: z.string().optional(),
  companyExperienceYears: z.string().optional(),
  currentSalary: z.coerce.number().optional().default(0),
  basisOfAppraisal: z.string().min(1, "Required"),
  supportToCompany: z.string().min(1, "Required"),
  expectationsYesNo: z.enum(["YES", "NO"]),
  expectationsReason: z.string().min(1, "Required"),
  strengthsWeaknesses: z.string().min(1, "Required"),
  teamworkExamples: z.string().optional(),
  goalChallenges: z.string().optional(),
  upcomingGoal: z.string().min(1, "Required"),
  threeImprovements: z.string().optional(),
  initiativeFrequency: z.enum(["Consistently", "Occasionally", "Rarely", "Never"]),
  abroadCapability: z.string().optional(),
  abroadCapabilityNa: z.boolean().optional(),
  initiativeInnovation: z.string().optional(),
  learningCommitment: z.enum(["A", "B", "C", "D", "E"]),
  professionalismAttitude: z.string().optional(),
  rateTeamwork: rating,
  rateCompanyRelationship: rating,
  ratePmRelationship: rating,
  rateCoworkerComms: rating,
  rateEngineering: rating,
  rateTeamCommunication: rating,
  rateVerbalWritten: rating,
  rateEnglish: rating,
  rateSelfLearning: rating,
  rateQualityOfWork: rating,
  rateDeadlines: optionalRating,
  rateClientComms: optionalRating,
  rateCustomerEmails: optionalRating,
  rateRfiCreation: optionalRating,
  rateEmailWriting: optionalRating,
  rateIssueResolution: optionalRating,
  rateKnowledgeSharing: optionalRating,
  rateLeadership: optionalRating,
  rateTeamPerformance: optionalRating,
  rateTeamBuilding: optionalRating,
  prodSimpleBeam: z.string().optional(),
  prodMediumBeam: z.string().optional(),
  prodComplexBeam: z.string().optional(),
  prodStair: z.string().optional(),
  prodStairRail: z.string().optional(),
  prodRoofFrame: z.string().optional(),
  prodSimpleLadder: z.string().optional(),
  prodCagedLadder: z.string().optional(),
  prodLoosePieces: z.string().optional(),
  prodSinglePart: z.string().optional(),
  prodCheckAbHours: z.string().optional(),
  prodCheckEplanHours: z.string().optional(),
  prodDraftAbHours: z.string().optional(),
  prodDraftEplanHours: z.string().optional(),
  prodDraftCagedLadder: z.string().optional(),
  prodDraftStairs: z.string().optional(),
  modelerSectionNa: z.boolean().optional(),
  prodModSimpleConnection: z.string().optional(),
  prodModDirectWeld: z.string().optional(),
  prodModMomentPlate: z.string().optional(),
  prodModWeldedTube: z.string().optional(),
  prodModBoltedBrace: z.string().optional(),
  prodModStairsHours: z.string().optional(),
  prodModRfiTime: z.string().optional(),
  prodModMemberPlacingHours: z.string().optional(),
  currentYearPerformance: z.string().min(1, "Required"),
  productivityImprovement: z.string().min(1, "Required"),
  overallRating: z.string().min(1, "Select overall rating"),
  employeeSignatureName: z.string().min(1, "Signature required"),
});

export const employeeDraftSchema = employeeFormSchema.partial().extend({
  employeeName: z.string().optional(),
  employeeCode: z.string().optional(),
  managerId: z.union([z.string().uuid(), z.literal("")]).optional(),
  currentSalary: z.coerce.number().optional().default(0),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;