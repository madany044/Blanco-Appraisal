import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { AppraisalSubmission } from "@prisma/client";
import { categoryLabel, formatDate, decimalToNumber } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { textAlign: "center", marginBottom: 20 },
  companyName: { fontSize: 14, fontWeight: "bold", color: "#1a4b8c" },
  address: { fontSize: 8, color: "#666", marginTop: 4 },
  title: { fontSize: 12, fontWeight: "bold", marginTop: 12, color: "#1a4b8c" },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginTop: 16, marginBottom: 8, color: "#1a4b8c", borderBottomWidth: 1, borderBottomColor: "#1a4b8c", paddingBottom: 4 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: "40%", fontWeight: "bold" },
  value: { width: "60%" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#999" },
  tableHeader: { flexDirection: "row", backgroundColor: "#1a4b8c", color: "white", padding: 4, fontWeight: "bold" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", padding: 4 },
  col: { flex: 1 },
  letter: { marginTop: 12, lineHeight: 1.5 },
});

interface PDFReportProps {
  submission: AppraisalSubmission;
}

function Footer({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) {
  return (
    <Text style={styles.footer} fixed>
      Confidential — Blanco Steel Detailing Services Private Limited — FY 2026-27 — Page {pageNumber} of {totalPages}
    </Text>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

export function PDFReport({ submission: s }: PDFReportProps) {
  const incrementPct = decimalToNumber(s.mgmtIncrementPercentage);
  const ctcPresent = decimalToNumber(s.salaryCtcPresent);
  const ctcProposed = decimalToNumber(s.salaryCtcProposed);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>BLANCO STEEL DETAILING SERVICES PRIVATE LIMITED</Text>
          <Text style={styles.address}>
            No 3051 SPYR Arcade 2nd Floor Ring Road, Near Mahamane Circle Dattagalli 3rd Stage, Mysore-570023, Karnataka.
          </Text>
          <Text style={styles.title}>EMPLOYEE PROGRESS REPORT CARD FOR SALARY APPRAISAL</Text>
          <Text style={{ marginTop: 8 }}>FY 2026-27</Text>
        </View>
        <FieldRow label="Employee Name" value={s.employeeName} />
        <FieldRow label="Employee ID" value={s.employeeCode} />
        <FieldRow label="Category" value={categoryLabel(s.category)} />
        <FieldRow label="Date" value={formatDate(s.dateOfSubmission)} />
        <Footer pageNumber={1} totalPages={4} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>SECTION 1 — Employee Submission</Text>
        <FieldRow label="Basis of Appraisal" value={s.basisOfAppraisal ?? ""} />
        <FieldRow label="Support to Company" value={s.supportToCompany ?? ""} />
        <FieldRow label="Expectations" value={`${s.expectationsYesNo ?? ""} — ${s.expectationsReason ?? ""}`} />
        <FieldRow label="Strengths & Weaknesses" value={s.strengthsWeaknesses ?? ""} />
        <FieldRow label="Upcoming Goal" value={s.upcomingGoal ?? ""} />
        <FieldRow label="Learning Commitment" value={s.learningCommitment ?? ""} />
        <FieldRow label="Overall Rating" value={s.overallRating ?? ""} />
        <FieldRow label="Work Performance" value={s.currentYearPerformance ?? ""} />
        <FieldRow label="Employee Signature" value={s.employeeSignatureName ?? ""} />
        <Footer pageNumber={2} totalPages={4} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>SECTION 2 — HR and Admin Feedback</Text>
        <FieldRow label="Code of Conduct" value={s.hrCodeOfConduct != null ? `${s.hrCodeOfConduct}/10` : ""} />
        <FieldRow label="Dress Code" value={s.hrDressCode != null ? `${s.hrDressCode}/10` : ""} />
        <FieldRow label="Professionalism" value={s.hrProfessionalism != null ? `${s.hrProfessionalism}/10` : ""} />
        <FieldRow label="Leave Management" value={s.hrLeaveManagement != null ? `${s.hrLeaveManagement}/10` : ""} />
        <FieldRow label="Timing Management" value={s.hrTimingManagement != null ? `${s.hrTimingManagement}/10` : ""} />
        <FieldRow label="Notes" value={s.hrBacklogNotes ?? ""} />
        <FieldRow label="Admin Signature" value={s.hrAdminSignatureName ?? ""} />

        <Text style={styles.sectionTitle}>SECTION 3 — Team Head Feedback</Text>
        <FieldRow label="Recommendation" value={s.mgrRecommendation ?? ""} />
        <FieldRow label="Remarks" value={s.mgrRemarks ?? ""} />
        <FieldRow label="Team Head Signature" value={s.mgrSignatureName ?? ""} />
        {s.mgrStrongReasons.length > 0 && (
          <Text style={{ marginTop: 8 }}>Strong Reasons: {s.mgrStrongReasons.join(", ")}</Text>
        )}
        <Footer pageNumber={3} totalPages={4} />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>SECTION 4 — Management Worksheet and Final Conclusion</Text>
        <Text style={styles.letter}>
          Dear Employee {s.employeeName}, You have been obtained {incrementPct}% of Increment based on your report card.
        </Text>
        <Text style={{ marginTop: 12, marginBottom: 8 }}>Salary Breakdown (Annual CTC: Present {ctcPresent.toLocaleString("en-IN")} → Proposed {ctcProposed.toLocaleString("en-IN")})</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.col}>Component</Text>
          <Text style={styles.col}>Monthly Present</Text>
          <Text style={styles.col}>Monthly Proposed</Text>
        </View>
        {(
          [
            { label: "Basic", present: s.salaryBasicPresent, proposed: s.salaryBasicPresent },
            { label: "DA", present: s.salaryDaPresent, proposed: s.salaryDaPresent },
            { label: "HRA", present: s.salaryHraPresent, proposed: s.salaryHraPresent },
            { label: "City Allowance", present: s.salaryCityAllowancePresent, proposed: s.salaryCityAllowanceProposed },
            { label: "Special Allowance", present: s.salarySpecialPresent, proposed: s.salarySpecialProposed },
            { label: "Gross", present: s.salaryGrossPresent, proposed: s.salaryGrossProposed },
            { label: "Net", present: s.salaryNetPresent, proposed: s.salaryNetProposed },
          ] as const
        ).map(({ label, present, proposed }) => (
          <View key={label} style={styles.tableRow}>
            <Text style={styles.col}>{label}</Text>
            <Text style={styles.col}>{decimalToNumber(present).toLocaleString("en-IN")}</Text>
            <Text style={styles.col}>{decimalToNumber(proposed).toLocaleString("en-IN")}</Text>
          </View>
        ))}
        <FieldRow label="Final Remarks" value={s.mgmtFinalRemarks ?? ""} />
        <FieldRow label="Feedback to Employee" value={s.mgmtFeedbackToEmployee ?? ""} />
        <FieldRow label="Approver" value={`${s.mgmtApproverName ?? ""} — ${formatDate(s.mgmtApprovalDate)}`} />
        <Footer pageNumber={4} totalPages={4} />
      </Page>
    </Document>
  );
}
