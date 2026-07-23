import type { Prisma } from "@prisma/client";
import type { EmployeeFormValues } from "@/lib/validations/employee-form.schema";
import type { HRFormValues } from "@/lib/validations/hr-form.schema";
import type { ManagerFormValues } from "@/lib/validations/manager-form.schema";
import type { ManagementFormValues } from "@/lib/validations/management-form.schema";

export function mapEmployeeToPrisma(
  data: Partial<EmployeeFormValues> & { category: string; stage: number }
): Prisma.AppraisalSubmissionCreateInput {
  return {
    financialYear: "2026-27",
    category: data.category as Prisma.AppraisalSubmissionCreateInput["category"],
    stage: data.stage,
    employeeName: data.employeeName ?? "",
    employeeCode: data.employeeCode ?? "",
    verificationPhotoUrl: (data as any).verificationPhotoUrl ?? null,
    manager: { connect: { id: data.managerId! } },
    team: data.team,
    designation: data.designation,
    prevExperienceYears: data.prevExperienceYears,
    companyExperienceYears: data.companyExperienceYears,
    basisOfAppraisal: data.basisOfAppraisal,
    supportToCompany: data.supportToCompany,
    expectationsYesNo: data.expectationsYesNo,
    expectationsReason: data.expectationsReason,
    strengthsWeaknesses: data.strengthsWeaknesses,
    teamworkExamples: data.teamworkExamples,
    goalChallenges: data.goalChallenges,
    upcomingGoal: data.upcomingGoal,
    threeImprovements: data.threeImprovements,
    initiativeFrequency: data.initiativeFrequency,
    abroadCapability: data.abroadCapability,
    abroadCapabilityNa: data.abroadCapabilityNa ?? false,
    initiativeInnovation: data.initiativeInnovation,
    learningCommitment: data.learningCommitment,
    professionalismAttitude: data.professionalismAttitude,
    rateTeamwork: data.rateTeamwork,
    rateCompanyRelationship: data.rateCompanyRelationship,
    ratePmRelationship: data.ratePmRelationship,
    rateCoworkerComms: data.rateCoworkerComms,
    rateEngineering: data.rateEngineering,
    rateTeamCommunication: data.rateTeamCommunication,
    rateVerbalWritten: data.rateVerbalWritten,
    rateEnglish: data.rateEnglish,
    rateSelfLearning: data.rateSelfLearning,
    rateQualityOfWork: data.rateQualityOfWork,
    rateDeadlines: data.rateDeadlines,
    rateClientComms: data.rateClientComms,
    rateCustomerEmails: data.rateCustomerEmails,
    rateRfiCreation: data.rateRfiCreation,
    rateEmailWriting: data.rateEmailWriting,
    rateIssueResolution: data.rateIssueResolution,
    rateKnowledgeSharing: data.rateKnowledgeSharing,
    rateLeadership: data.rateLeadership,
    rateTeamPerformance: data.rateTeamPerformance,
    rateTeamBuilding: data.rateTeamBuilding,
    prodSimpleBeam: data.prodSimpleBeam,
    prodMediumBeam: data.prodMediumBeam,
    prodComplexBeam: data.prodComplexBeam,
    prodStair: data.prodStair,
    prodStairRail: data.prodStairRail,
    prodRoofFrame: data.prodRoofFrame,
    prodSimpleLadder: data.prodSimpleLadder,
    prodCagedLadder: data.prodCagedLadder,
    prodLoosePieces: data.prodLoosePieces,
    prodSinglePart: data.prodSinglePart,
    prodCheckAbHours: data.prodCheckAbHours,
    prodCheckEplanHours: data.prodCheckEplanHours,
    prodDraftAbHours: data.prodDraftAbHours,
    prodDraftEplanHours: data.prodDraftEplanHours,
    prodDraftCagedLadder: data.prodDraftCagedLadder,
    prodDraftStairs: data.prodDraftStairs,
    modelerSectionNa: data.modelerSectionNa ?? false,
    prodModSimpleConnection: data.prodModSimpleConnection,
    prodModDirectWeld: data.prodModDirectWeld,
    prodModMomentPlate: data.prodModMomentPlate,
    prodModWeldedTube: data.prodModWeldedTube,
    prodModBoltedBrace: data.prodModBoltedBrace,
    prodModStairsHours: data.prodModStairsHours,
    prodModRfiTime: data.prodModRfiTime,
    prodModMemberPlacingHours: data.prodModMemberPlacingHours,
    currentYearPerformance: data.currentYearPerformance,
    productivityImprovement: data.productivityImprovement,
    overallRating: data.overallRating,
    employeeSignatureName: data.employeeSignatureName,
    employeeSignatureDate: data.employeeSignatureName ? new Date() : undefined,
    submittedAt: data.stage === 0 ? new Date() : undefined,
  };
}

export function mapHRToPrisma(data: HRFormValues): Prisma.AppraisalSubmissionUpdateInput {
  const normalizedAdditionalIncrements = (data.additionalIncrements ?? [])
    .filter((item: { percentage?: number | null; salaryRise?: number | null }) => {
      return item?.percentage != null || item?.salaryRise != null;
    })
    .map((item: { percentage?: number | null; salaryRise?: number | null }) => ({
      percentage: item?.percentage ?? null,
      salaryRise: item?.salaryRise ?? null,
    }));

  return {
    currentSalary: data.currentSalary,
    previousIncrementPercentage: data.previousIncrementPercentage ?? null,
    additionalIncrements: normalizedAdditionalIncrements,
    mgmtEffectiveDate: data.effective_date ? new Date(data.effective_date) : null,
    hrCodeOfConduct: data.hrCodeOfConduct,
    hrDressCode: data.hrDressCode,
    hrProfessionalism: data.hrProfessionalism,
    hrLeaveManagement: data.hrLeaveManagement,
    hrLeaveManagementNotes: data.hrLeaveManagementNotes,
    hrTimingManagement: data.hrTimingManagement,
    hrTimingManagementNotes: data.hrTimingManagementNotes,
    hrBacklogNotes: data.hrBacklogNotes,
    hrAdminSignatureName: data.hrAdminSignatureName,
    hrAdminSignatureDate: data.hrAdminSignatureDate ? new Date(data.hrAdminSignatureDate) : new Date(),
  };
}

export function mapManagerToPrisma(data: ManagerFormValues): Prisma.AppraisalSubmissionUpdateInput {
  return {
    mgrRecommendation: data.mgrRecommendation,
    mgrStrongReasons: data.mgrStrongReasons,
    mgrConditionalReasons: data.mgrConditionalReasons,
    mgrNotRecommendedReasons: data.mgrNotRecommendedReasons,
    mgrSuggestedIncrementPercentage: data.mgrSuggestedIncrementPercentage ?? null,
    mgrRemarks: data.mgrRemarks,
    mgrSignatureName: data.mgrSignatureName,
    mgrSignatureDate: data.mgrSignatureDate ? new Date(data.mgrSignatureDate) : new Date(),
  };
}

export function mapManagementToPrisma(
  data: ManagementFormValues,
  currentSalary: number
): Prisma.AppraisalSubmissionUpdateInput {
  const newSalary = Math.round(currentSalary * (1 + data.mgmtIncrementPercentage / 100));

  return {
    mgmtIncrementPercentage: data.mgmtIncrementPercentage,
    mgmtStatementPercentage: data.mgmtStatementPercentage ?? null,
    mgmtNewSalary: newSalary,
    mgmtApproverName: data.mgmtApproverName,
    mgmtApprovalDate: new Date(),
    mgmtFinalRemarks: data.mgmtFinalRemarks,
    mgmtFeedbackToEmployee: data.mgmtFeedbackToEmployee ?? data.mgmtFinalRemarks,
    mgmtInternalNotes: data.mgmtInternalNotes,
  };
}
