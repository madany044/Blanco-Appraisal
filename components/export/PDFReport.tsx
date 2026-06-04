import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { AppraisalSubmission } from "@prisma/client";
import {
  SELF_RATING_ITEMS,
  SHOP_DRAFTING_ITEMS,
  E_DRAFTING_ITEMS,
  MODELER_ITEMS,
  HR_RATING_ITEMS,
  MGR_RECOMMENDATION_LABELS,
  displayValue,
  getSubmissionField,
  formatOverallRating,
  formatSalary,
} from "@/lib/submission-display";
import { categoryLabel, formatDate, decimalToNumber } from "@/lib/utils";
import type { SerializedIncrementSlab } from "@/lib/utils";
import {
  STRONG_REASONS,
  CONDITIONAL_REASONS,
  NOT_RECOMMENDED_REASONS,
} from "@/lib/types";
const LETTER_INTRO = `Dear Employee of Team,

We are happy to receive your appraisal request and the feedback from your team head. We will be evaluating everything, and your increment letter will be e-mailed to you soon. Kindly note that revised Increment criteria have been already e-mailed to your registered e-mail IDs with the company (also noted below) and the criteria will remain the same, but we will assure you as best as close to the percentage noted below but purely depends on your performance report card.`;

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", lineHeight: 1.4, color: "#1e2740" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
  },
  coverHeader: { textAlign: "center", marginBottom: 16 },
  companyName: { fontSize: 11, fontWeight: "bold", color: "#1a4b8c" },
  address: { fontSize: 8, color: "#666", marginTop: 4 },
  coverTitle: { fontSize: 14, fontWeight: "bold", marginTop: 20, color: "#1a4b8c", textAlign: "center" },
  coverRule: { height: 2, backgroundColor: "#1a4b8c", marginVertical: 12 },
  grid2: { flexDirection: "row", flexWrap: "wrap" },
  gridCol: { width: "50%", paddingRight: 8, marginBottom: 6 },
  sectionBar: { padding: 8, marginTop: 12, marginBottom: 8 },
  sectionBarText: { fontSize: 12, fontWeight: "bold", color: "#ffffff" },
  fieldBlock: { marginBottom: 8, paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: "#e2e6ef" },
  fieldLabel: { fontSize: 8, color: "#666", textTransform: "uppercase", marginBottom: 2 },
  fieldValue: { fontSize: 10, color: "#1e2740" },
  subHeader: { fontSize: 10, fontWeight: "bold", color: "#1a4b8c", marginTop: 8, marginBottom: 6 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f0f2f7", borderWidth: 0.5, borderColor: "#e2e6ef", padding: 4 },
  tableRow: { flexDirection: "row", borderLeftWidth: 0.5, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: "#e2e6ef", padding: 4 },
  tableRowAlt: { backgroundColor: "#fafbfc" },
  colLabel: { flex: 2, fontSize: 9 },
  colValue: { flex: 1, fontSize: 9, fontWeight: "bold", textAlign: "right" },
  letterBox: { backgroundColor: "#f8fafc", padding: 10, marginVertical: 8, fontSize: 9, lineHeight: 1.5 },
  salaryBox: { borderWidth: 0.5, borderColor: "#e2e6ef", padding: 10, marginTop: 8 },
  slabHighlight: { backgroundColor: "#dbeafe" },
});

function Footer({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) {
  return (
    <Text style={styles.footer} fixed>
      Confidential — Blanco Steel Detailing Services Private Limited — FY 2026-27 — Page {pageNumber} of {totalPages}
    </Text>
  );
}

function FieldBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function SectionBar({ title, color }: { title: string; color: string }) {
  return (
    <View style={[styles.sectionBar, { backgroundColor: color }]}>
      <Text style={styles.sectionBarText}>{title}</Text>
    </View>
  );
}

function RatingTable({ items, submission }: { items: typeof SELF_RATING_ITEMS; submission: AppraisalSubmission }) {
  return (
    <View>
      {items.map((item, i) => {
        const val = submission[item.key as keyof AppraisalSubmission] as number | null;
        return (
          <View key={item.key} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={styles.colLabel}>{item.label}</Text>
            <Text style={styles.colValue}>{val != null ? `${val}/10` : "—"}</Text>
          </View>
        );
      })}
    </View>
  );
}

function formatSlabRange(min: number, max: number | null): string {
  if (max == null) return `${min.toLocaleString("en-IN")} and above`;
  if (min === 0) return `Less than ${(max + 1).toLocaleString("en-IN")}`;
  return `${min.toLocaleString("en-IN")} to ${max.toLocaleString("en-IN")}`;
}

interface PDFReportProps {
  submission: AppraisalSubmission;
  slabs?: SerializedIncrementSlab[];
}

export function PDFReport({ submission: s, slabs = [] }: PDFReportProps) {
  const annualCtc = (s.currentSalary ?? 0) * 12;
  const incrementPct = decimalToNumber(s.mgmtIncrementPercentage);
  const newSalary = decimalToNumber(s.mgmtNewSalary) || Math.round((s.currentSalary ?? 0) * (1 + incrementPct / 100));
  const levels = s.mgrRecommendation ?? [];

  const mgrGroups = [
    { level: "STRONGLY_RECOMMEND", reasons: s.mgrStrongReasons, options: STRONG_REASONS },
    { level: "CONDITIONALLY_RECOMMEND", reasons: s.mgrConditionalReasons, options: CONDITIONAL_REASONS },
    { level: "NOT_RECOMMENDED", reasons: s.mgrNotRecommendedReasons, options: NOT_RECOMMENDED_REASONS },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.coverHeader}>
          <Text style={styles.companyName}>BLANCO STEEL DETAILING SERVICES PRIVATE LIMITED</Text>
          <Text style={styles.address}>
            No 3051 SPYR Arcade 2nd Floor Ring Road,{"\n"}
            Near Mahamane Circle Dattagalli 3rd Stage, Mysore-570023, Karnataka.
          </Text>
        </View>
        <Text style={styles.coverTitle}>EMPLOYEE PROGRESS REPORT CARD</Text>
        <Text style={[styles.coverTitle, { fontSize: 12 }]}>FOR SALARY APPRAISAL</Text>
        <View style={styles.coverRule} />
        <View style={styles.grid2}>
          <View style={styles.gridCol}><Text>Employee Name: {s.employeeName}</Text></View>
          <View style={styles.gridCol}><Text>Employee ID: {s.employeeCode}</Text></View>
          <View style={styles.gridCol}><Text>Category: {categoryLabel(s.category)}</Text></View>
          <View style={styles.gridCol}><Text>Team/Designation: {displayValue(s.teamDesignation)}</Text></View>
          <View style={styles.gridCol}><Text>Financial Year: FY 2026-27</Text></View>
          <View style={styles.gridCol}><Text>Date: {formatDate(s.dateOfSubmission)}</Text></View>
        </View>
        <Footer pageNumber={1} totalPages={4} />
      </Page>

      <Page size="A4" style={styles.page}>
        <SectionBar title="SECTION 1 — EMPLOYEE SUBMISSION" color="#1a4b8c" />
        <FieldBlock label="Basis of Appraisal Request" value={displayValue(s.basisOfAppraisal)} />
        <FieldBlock label="Support to the Company" value={displayValue(s.supportToCompany)} />
        <FieldBlock
          label="Expectations"
          value={displayValue(s.expectationsYesNo ? `${s.expectationsYesNo}${s.expectationsReason ? ` — ${s.expectationsReason}` : ""}` : null)}
        />
        <FieldBlock label="Strengths & Weaknesses" value={displayValue(s.strengthsWeaknesses)} />
        <FieldBlock label="Teamwork Examples" value={displayValue(s.teamworkExamples)} />
        <FieldBlock label="Goal Challenges" value={displayValue(s.goalChallenges)} />
        <FieldBlock label="Upcoming Year Goal" value={displayValue(s.upcomingGoal)} />
        <FieldBlock label="Three Things to Improve" value={displayValue(s.threeImprovements)} />
        <FieldBlock label="Initiative Frequency" value={displayValue(s.initiativeFrequency)} />
        <FieldBlock label="Abroad Capability" value={s.abroadCapabilityNa ? "N/A" : displayValue(s.abroadCapability)} />
        <FieldBlock label="Initiative or Innovation Examples" value={displayValue(s.initiativeInnovation)} />
        <FieldBlock label="Learning Commitment" value={displayValue(s.learningCommitment)} />
        <FieldBlock label="Professionalism and Attitude" value={displayValue(s.professionalismAttitude)} />

        <Text style={styles.subHeader}>SELF PERFORMANCE RATINGS (/10)</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colLabel}>Criteria</Text>
          <Text style={styles.colValue}>Rating</Text>
        </View>
        <RatingTable items={SELF_RATING_ITEMS} submission={s} />

        <Text style={styles.subHeader}>PRODUCTIVITY AND TIME MANAGEMENT — Shop Drafting</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colLabel}>Item</Text>
          <Text style={styles.colValue}>Value</Text>
        </View>
        {SHOP_DRAFTING_ITEMS.map((item, i) => (
          <View key={item.key} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={styles.colLabel}>{item.label}</Text>
            <Text style={styles.colValue}>{displayValue(getSubmissionField(s, item.key))}</Text>
          </View>
        ))}
        <Footer pageNumber={2} totalPages={4} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.subHeader}>PRODUCTIVITY — E-Drafting</Text>
        {E_DRAFTING_ITEMS.map((item) => (
          <FieldBlock key={item.key} label={item.label} value={displayValue(getSubmissionField(s, item.key))} />
        ))}
        <Text style={styles.subHeader}>PRODUCTIVITY — Modeler</Text>
        {s.modelerSectionNa ? (
          <FieldBlock label="Modeler Section" value="N/A for this category" />
        ) : (
          MODELER_ITEMS.map((item) => (
            <FieldBlock key={item.key} label={item.label} value={displayValue(getSubmissionField(s, item.key))} />
          ))
        )}
        <FieldBlock label="Work Performance (Question 10)" value={displayValue(s.currentYearPerformance)} />
        <FieldBlock label="Productivity Improvement (Question 11)" value={displayValue(s.productivityImprovement)} />
        <FieldBlock label="Overall Performance Rating" value={formatOverallRating(s.overallRating)} />
        <FieldBlock label="Employee Signature" value={displayValue(s.employeeSignatureName)} />
        <FieldBlock label="Employee Signature Date" value={formatDate(s.employeeSignatureDate)} />

        <SectionBar title="SECTION 2 — HR AND ADMIN FEEDBACK" color="#1a8c5a" />
        <View style={styles.tableHeader}>
          <Text style={styles.colLabel}>Criteria</Text>
          <Text style={styles.colValue}>Rating</Text>
        </View>
        {HR_RATING_ITEMS.map((item, i) => {
          const val = s[item.key as keyof AppraisalSubmission] as number | null;
          return (
            <View key={item.key} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={styles.colLabel}>{item.label}</Text>
              <Text style={styles.colValue}>{val != null ? `${val}/10` : "—"}</Text>
            </View>
          );
        })}
        <FieldBlock label="Backlog Notes" value={displayValue(s.hrBacklogNotes)} />
        <FieldBlock label="Admin Signature" value={displayValue(s.hrAdminSignatureName)} />
        <FieldBlock label="Admin Signature Date" value={formatDate(s.hrAdminSignatureDate)} />
        <Footer pageNumber={3} totalPages={4} />
      </Page>

      <Page size="A4" style={styles.page}>
        <SectionBar title="SECTION 3 — TEAM HEAD FEEDBACK" color="#c97c10" />
        <FieldBlock label="Employee Name" value={s.employeeName} />
        <FieldBlock label="Employee Code" value={s.employeeCode} />
        <FieldBlock
          label="Recommendation Level(s)"
          value={levels.length ? levels.map((l) => MGR_RECOMMENDATION_LABELS[l] ?? l).join("; ") : "—"}
        />
        {mgrGroups.map((g) =>
          levels.includes(g.level) ? (
            <View key={g.level} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 4 }}>
                {MGR_RECOMMENDATION_LABELS[g.level]}
              </Text>
              {g.reasons.map((r) => (
                <Text key={r} style={{ fontSize: 9, marginLeft: 8 }}>• {r}</Text>
              ))}
            </View>
          ) : null
        )}
        <FieldBlock label="Manager Remarks" value={displayValue(s.mgrRemarks)} />
        <FieldBlock label="Team Head Signature" value={displayValue(s.mgrSignatureName)} />
        <FieldBlock label="Team Head Signature Date" value={formatDate(s.mgrSignatureDate)} />

        <SectionBar title="SECTION 4 — MANAGEMENT WORKSHEET AND FINAL CONCLUSION" color="#6d28d9" />
        <View style={styles.letterBox}>
          <Text>{LETTER_INTRO}</Text>
        </View>
        <Text style={{ fontSize: 9, marginBottom: 6 }}>Below are the criteria of increment with effect from FY 2026-27.</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.colLabel, { flex: 2 }]}>CTC Range (Annual)</Text>
          <Text style={styles.colValue}>Max Increment %</Text>
        </View>
        {slabs.map((slab) => {
          const max = slab.ctcMax ?? Infinity;
          const active = annualCtc >= slab.ctcMin && annualCtc <= max;
          return (
            <View key={slab.id} style={[styles.tableRow, active ? styles.slabHighlight : {}]}>
              <Text style={[styles.colLabel, { flex: 2 }]}>{formatSlabRange(slab.ctcMin, slab.ctcMax)}</Text>
              <Text style={styles.colValue}>0% to {slab.maxPct}%</Text>
            </View>
          );
        })}
        <View style={styles.salaryBox}>
          <Text>Current Monthly Salary: {formatSalary(s.currentSalary ?? 0)}</Text>
          <Text>Increment Awarded: {incrementPct}%</Text>
          <Text>New Monthly Salary: {formatSalary(newSalary)}</Text>
        </View>
        <Text style={{ marginTop: 8, fontSize: 10 }}>
          Dear Employee {s.employeeName}, You have been obtained {incrementPct}% of Increment based on your report card,
        </Text>
        <FieldBlock label="Feedback / Remarks" value={displayValue(s.mgmtFinalRemarks ?? s.mgmtFeedbackToEmployee)} />
        <FieldBlock label="Signature of the Approver" value={displayValue(s.mgmtApproverName)} />
        <FieldBlock label="Date" value={formatDate(s.mgmtApprovalDate ?? s.mgmtEffectiveDate)} />
        <Footer pageNumber={4} totalPages={4} />
      </Page>
    </Document>
  );
}
