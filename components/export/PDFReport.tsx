import type { ReactNode } from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { AppraisalSubmission } from "@prisma/client";
import {
  EMPLOYEE_QUESTIONS,
  SELF_RATING_ITEMS,
  SHOP_DRAFTING_ITEMS,
  E_DRAFTING_ITEMS,
  MODELER_ITEMS,
  HR_RATING_ITEMS,
  HR_BACKLOG_QUESTION,
  MGR_RECOMMENDATION_SECTIONS,
  PRODUCTIVITY_INTRO,
  MANAGEMENT_LETTER_INTRO,
  LEARNING_COMMITMENT_OPTIONS,
  INITIATIVE_FREQUENCY_OPTIONS,
  OVERALL_RATING_OPTIONS,
  selfRatingLabel,
  formatExpectationsAnswer,
  normalizeOverallRating,
} from "@/lib/form-questions";
import { pdfDisplayValue, getSubmissionField } from "@/lib/submission-display";
import { COMPANY_NAME_SHORT, REPORT_TITLE } from "@/lib/brand";
import { formatDate, decimalToNumber } from "@/lib/utils";
import type { SerializedIncrementSlab } from "@/lib/utils";
import {
  STRONG_REASONS,
  CONDITIONAL_REASONS,
  NOT_RECOMMENDED_REASONS,
  ABROAD_OPTIONS,
} from "@/lib/types";

const BLUE = "#1a5276";
const INK = "#1e2740";
const MUTED = "#5a6a7e";

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingBottom: 34,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.35,
    color: INK,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#c5d3e3",
  },
  logo: { width: 62, height: 30, marginRight: 10 },
  headerTextCol: { flex: 1 },
  companyName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: BLUE },
  docTitle: { fontSize: 8, color: MUTED, marginTop: 2 },
  infoPanel: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#f4f7fb",
    borderWidth: 0.5,
    borderColor: "#c5d3e3",
    padding: 8,
    marginBottom: 8,
    borderRadius: 2,
  },
  infoCell: { width: "50%", paddingRight: 6, marginBottom: 3, fontSize: 8.5 },
  block: { marginBottom: 7 },
  qLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    marginBottom: 2,
  },
  qText: { fontSize: 8.5, color: MUTED, marginBottom: 3 },
  answerBox: {
    backgroundColor: "#fafbfd",
    borderLeftWidth: 2,
    borderLeftColor: BLUE,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 9,
    minHeight: 14,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    marginTop: 4,
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 5,
    color: INK,
  },
  twoCol: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  bulletLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    fontSize: 8,
  },
  bulletLabel: { flex: 1, paddingRight: 4 },
  bulletVal: { width: 48, textAlign: "right", fontFamily: "Helvetica-Bold" },
  ratingLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
    fontSize: 8,
  },
  ratingQ: { flex: 1, paddingRight: 4 },
  ratingScore: {
    width: 28,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textAlign: "right",
  },
  checkRow: { flexDirection: "row", marginBottom: 3, fontSize: 8.5 },
  checkMark: { width: 12, fontFamily: "Helvetica-Bold" },
  checkText: { flex: 1 },
  ovalWrap: { alignItems: "center", marginBottom: 10 },
  oval: {
    borderWidth: 1,
    borderColor: INK,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    width: "88%",
  },
  ovalText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
  },
  blueBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: BLUE,
  },
  pageNum: {
    position: "absolute",
    bottom: 1,
    right: 32,
    fontSize: 8,
    color: "#fff",
    fontFamily: "Helvetica-Bold",
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: BLUE,
    padding: 4,
  },
  tableHeadText: { color: "#fff", fontSize: 8, fontFamily: "Helvetica-Bold" },
  tableRow: {
    flexDirection: "row",
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    padding: 4,
    fontSize: 8,
  },
  slabHi: { backgroundColor: "#dbeafe" },
  colCtc: { flex: 2 },
  colPct: { flex: 1, textAlign: "right" },
});

function PageChrome({ pageNum, logoSrc }: { pageNum: number; logoSrc?: string }) {
  return (
    <>
      <View style={styles.blueBar} fixed />
      <Text style={styles.pageNum} fixed>
        PAGE {pageNum}
      </Text>
      <PdfHeader logoSrc={logoSrc} />
    </>
  );
}

function PdfHeader({ logoSrc }: { logoSrc?: string }) {
  return (
    <View style={styles.headerRow} fixed>
      {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : <View style={{ width: 62 }} />}
      <View style={styles.headerTextCol}>
        <Text style={styles.companyName}>{COMPANY_NAME_SHORT}</Text>
        <Text style={styles.docTitle}>{REPORT_TITLE}</Text>
      </View>
    </View>
  );
}

function QABlock({
  label,
  question,
  answer,
}: {
  label?: string;
  question: string;
  answer: string;
}) {
  return (
    <View style={styles.block} wrap={false}>
      {label ? <Text style={styles.qLabel}>{label}</Text> : null}
      <Text style={styles.qText}>{question}</Text>
      <Text style={styles.answerBox}>{answer || " "}</Text>
    </View>
  );
}

function InfoPanel({ s }: { s: AppraisalSubmission }) {
  const rows = [
    ["Employee Name", pdfDisplayValue(s.employeeName)],
    ["Date", formatDate(s.dateOfSubmission) || " "],
    ["Employee ID", pdfDisplayValue(s.employeeCode)],
    ["Team & Designation", pdfDisplayValue(s.teamDesignation)],
    ["Prev. field experience", pdfDisplayValue(s.prevExperienceYears)],
    ["Company experience", pdfDisplayValue(s.companyExperienceYears)],
  ];
  return (
    <View style={styles.infoPanel}>
      {rows.map(([k, v]) => (
        <Text key={k} style={styles.infoCell}>
          {k}: {v || " "}
        </Text>
      ))}
    </View>
  );
}

function TwoColBullets({
  items,
  submission,
}: {
  items: readonly { key: string; label: string }[];
  submission: AppraisalSubmission;
}) {
  const mid = Math.ceil(items.length / 2);
  const left = items.slice(0, mid);
  const right = items.slice(mid);
  const renderCol = (col: typeof items) =>
    col.map((item) => (
      <View key={item.key} style={styles.bulletLine}>
        <Text style={styles.bulletLabel}>• {item.label}</Text>
        <Text style={styles.bulletVal}>{pdfDisplayValue(getSubmissionField(submission, item.key as keyof AppraisalSubmission)) || "—"}</Text>
      </View>
    ));
  return (
    <View style={styles.twoCol}>
      <View style={styles.col}>{renderCol(left)}</View>
      <View style={styles.col}>{renderCol(right)}</View>
    </View>
  );
}

function TwoColRatings({ submission }: { submission: AppraisalSubmission }) {
  const mid = Math.ceil(SELF_RATING_ITEMS.length / 2);
  const left = SELF_RATING_ITEMS.slice(0, mid);
  const right = SELF_RATING_ITEMS.slice(mid);
  const line = (item: (typeof SELF_RATING_ITEMS)[number]) => {
    const score = submission[item.key as keyof AppraisalSubmission] as number | null;
    return (
      <View key={item.key} style={styles.ratingLine}>
        <Text style={styles.ratingQ}>{selfRatingLabel(item)}</Text>
        <Text style={styles.ratingScore}>{score != null ? `${score}/10` : "—"}</Text>
      </View>
    );
  };
  return (
    <View style={styles.twoCol}>
      <View style={styles.col}>{left.map(line)}</View>
      <View style={styles.col}>{right.map(line)}</View>
    </View>
  );
}

function OvalHeader({ title }: { title: string }) {
  return (
    <View style={styles.ovalWrap}>
      <View style={styles.oval}>
        <Text style={styles.ovalText}>{title}</Text>
      </View>
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
  logoSrc?: string;
}

function PdfPage({
  pageNum,
  logoSrc,
  marginTop = 42,
  children,
}: {
  pageNum: number;
  logoSrc?: string;
  marginTop?: number;
  children: ReactNode;
}) {
  return (
    <Page size="A4" style={styles.page}>
      <PageChrome pageNum={pageNum} logoSrc={logoSrc} />
      <View style={{ marginTop }}>{children}</View>
    </Page>
  );
}

export function PDFReport({ submission: s, slabs = [], logoSrc }: PDFReportProps) {
  const isQC = s.category === "QC";
  const annualCtc = (s.currentSalary ?? 0) * 12;
  const incrementPct = decimalToNumber(s.mgmtIncrementPercentage);
  const selectedOverall = normalizeOverallRating(s.overallRating);

  const mgrReasonOptions: Record<string, readonly string[]> = {
    mgrStrongReasons: STRONG_REASONS,
    mgrConditionalReasons: CONDITIONAL_REASONS,
    mgrNotRecommendedReasons: NOT_RECOMMENDED_REASONS,
  };

  let pageNum = 0;

  return (
    <Document>
      <PdfPage pageNum={++pageNum} logoSrc={logoSrc}>
        <InfoPanel s={s} />
        <QABlock label="Question 1" question={EMPLOYEE_QUESTIONS.q1.text} answer={pdfDisplayValue(s.basisOfAppraisal)} />
        <QABlock label="Question 2" question={EMPLOYEE_QUESTIONS.q2.text} answer={pdfDisplayValue(s.supportToCompany)} />
      </PdfPage>

      <PdfPage pageNum={++pageNum} logoSrc={logoSrc}>
        <QABlock label="Question 3" question={EMPLOYEE_QUESTIONS.q3.text} answer={formatExpectationsAnswer(s) || " "} />
        <QABlock label="Question 4" question={EMPLOYEE_QUESTIONS.q4.text} answer={pdfDisplayValue(s.strengthsWeaknesses)} />
        <QABlock label="Question 5" question={EMPLOYEE_QUESTIONS.q5.text} answer={pdfDisplayValue(s.teamworkExamples)} />
      </PdfPage>

      <PdfPage pageNum={++pageNum} logoSrc={logoSrc}>
        <Text style={styles.qLabel}>{EMPLOYEE_QUESTIONS.q6heading}</Text>
        <QABlock question={EMPLOYEE_QUESTIONS.q6a.text} answer={pdfDisplayValue(s.goalChallenges)} />
        <QABlock question={EMPLOYEE_QUESTIONS.q6b.text} answer={pdfDisplayValue(s.upcomingGoal)} />
        <QABlock question={EMPLOYEE_QUESTIONS.q6c.text} answer={pdfDisplayValue(s.threeImprovements)} />
        <View style={styles.block}>
          <Text style={styles.qText}>{EMPLOYEE_QUESTIONS.q6d.text}</Text>
          <Text style={[styles.qText, { fontSize: 8 }]}>Options: {INITIATIVE_FREQUENCY_OPTIONS.join(" · ")}</Text>
          <Text style={styles.answerBox}>Selected: {pdfDisplayValue(s.initiativeFrequency) || " "}</Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.qText}>{EMPLOYEE_QUESTIONS.q6e.text}</Text>
          <Text style={styles.answerBox}>
            {s.abroadCapabilityNa
              ? "N/A — Not applicable for this category"
              : `Selected: ${pdfDisplayValue(s.abroadCapability) || " "} (${ABROAD_OPTIONS.join(" · ")})`}
          </Text>
        </View>
      </PdfPage>

      <PdfPage pageNum={++pageNum} logoSrc={logoSrc}>
        <QABlock label="Question 7" question={EMPLOYEE_QUESTIONS.q7.text} answer={pdfDisplayValue(s.initiativeInnovation)} />
        <View style={styles.block}>
          <Text style={styles.qLabel}>Question 8</Text>
          <Text style={styles.qText}>{EMPLOYEE_QUESTIONS.q8.text}</Text>
          {LEARNING_COMMITMENT_OPTIONS.map((o) => (
            <Text key={o.value} style={{ fontSize: 8.5, marginLeft: 6, marginBottom: 1 }}>
              {o.label}
              {s.learningCommitment === o.value ? "  ✓" : ""}
            </Text>
          ))}
        </View>
        <QABlock label="G (Professionalism)" question={EMPLOYEE_QUESTIONS.q9.text} answer={pdfDisplayValue(s.professionalismAttitude)} />
      </PdfPage>

      <PdfPage pageNum={++pageNum} logoSrc={logoSrc}>
        <Text style={styles.sectionTitle}>Self Performance Ratings</Text>
        <TwoColRatings submission={s} />
      </PdfPage>

      {!isQC && (
        <>
          <PdfPage pageNum={++pageNum} logoSrc={logoSrc}>
            <Text style={styles.sectionTitle}>10. Productivity and Time Management</Text>
            <Text style={{ fontSize: 8.5, color: MUTED, marginBottom: 6 }}>{PRODUCTIVITY_INTRO}</Text>
            <Text style={styles.subTitle}>Shop Drafting and Checker</Text>
            <TwoColBullets items={SHOP_DRAFTING_ITEMS} submission={s} />
            <Text style={styles.subTitle}>E-Drafting</Text>
            <TwoColBullets items={E_DRAFTING_ITEMS} submission={s} />
          </PdfPage>

          <PdfPage pageNum={++pageNum} logoSrc={logoSrc}>
            <Text style={styles.subTitle}>Modeler</Text>
            {s.modelerSectionNa ? (
              <Text style={{ textAlign: "center", fontSize: 10, marginTop: 16, fontFamily: "Helvetica-Bold" }}>----NA----</Text>
            ) : (
              <TwoColBullets items={MODELER_ITEMS} submission={s} />
            )}
          </PdfPage>
        </>
      )}

      <PdfPage pageNum={++pageNum} logoSrc={logoSrc}>
        <Text style={styles.sectionTitle}>{EMPLOYEE_QUESTIONS.q11.text}</Text>
        <Text style={styles.answerBox}>{pdfDisplayValue(s.currentYearPerformance) || " "}</Text>
        <View style={{ marginTop: 10 }}>
          <QABlock question={EMPLOYEE_QUESTIONS.q12.text} answer={pdfDisplayValue(s.productivityImprovement)} />
        </View>
        <Text style={[styles.qLabel, { marginTop: 6 }]}>Rate Yourself of Your Overall Performance</Text>
        {OVERALL_RATING_OPTIONS.map((opt) => (
          <View key={opt} style={styles.checkRow}>
            <Text style={styles.checkMark}>{selectedOverall === opt ? "■" : "□"}</Text>
            <Text style={styles.checkText}>{opt}</Text>
          </View>
        ))}
        <View style={[styles.infoPanel, { marginTop: 10 }]}>
          <Text style={styles.infoCell}>Employee Signature: {pdfDisplayValue(s.employeeSignatureName) || " "}</Text>
          <Text style={styles.infoCell}>Employee Code: {pdfDisplayValue(s.employeeCode)}</Text>
          <Text style={styles.infoCell}>
            Date: {formatDate(s.employeeSignatureDate) || formatDate(s.dateOfSubmission) || " "}
          </Text>
        </View>
      </PdfPage>

      <PdfPage pageNum={++pageNum} logoSrc={logoSrc} marginTop={36}>
        <OvalHeader title="HR AND ADMIN FEED BACK" />
        {HR_RATING_ITEMS.map((item) => {
          const val = s[item.key as keyof AppraisalSubmission] as number | null;
          return (
            <View key={item.key} style={styles.bulletLine}>
              <Text style={styles.bulletLabel}>• {item.label}</Text>
              <Text style={styles.bulletVal}>{val != null ? `${val}/10` : "—"}</Text>
            </View>
          );
        })}
        <Text style={[styles.qText, { marginTop: 8 }]}>{HR_BACKLOG_QUESTION}</Text>
        <Text style={styles.answerBox}>{pdfDisplayValue(s.hrBacklogNotes) || " "}</Text>
        <Text style={{ marginTop: 10, fontSize: 8.5 }}>
          Signature Of Admin Head: {pdfDisplayValue(s.hrAdminSignatureName)} · Date:{" "}
          {formatDate(s.hrAdminSignatureDate) || " "}
        </Text>
      </PdfPage>

      <PdfPage pageNum={++pageNum} logoSrc={logoSrc} marginTop={36}>
        <OvalHeader title="TEAM HEAD FEED BACK" />
        <View style={styles.infoPanel}>
          <Text style={styles.infoCell}>Employee Name: {pdfDisplayValue(s.employeeName)}</Text>
          <Text style={styles.infoCell}>Employee Code: {pdfDisplayValue(s.employeeCode)}</Text>
        </View>
        {MGR_RECOMMENDATION_SECTIONS.map((section) => {
          const reasons = s[section.field] ?? [];
          const options = mgrReasonOptions[section.field];
          const checked = [
            ...options.filter((r) => reasons.includes(r)),
            ...reasons.filter((r) => !options.includes(r)),
          ];
          return (
            <View key={section.level} style={{ marginBottom: 6 }} wrap={false}>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", marginBottom: 2 }}>
                • {section.header}
              </Text>
              {checked.length > 0
                ? checked.map((r) => (
                    <Text key={r} style={{ fontSize: 8, marginLeft: 10, marginBottom: 1 }}>
                      ✓ {r}
                    </Text>
                  ))
                : null}
            </View>
          );
        })}
        <Text style={{ marginTop: 8, fontSize: 8.5 }}>
          Signature Of Team Head: {pdfDisplayValue(s.mgrSignatureName)} · Date:{" "}
          {formatDate(s.mgrSignatureDate) || " "}
        </Text>
      </PdfPage>

      <PdfPage pageNum={++pageNum} logoSrc={logoSrc} marginTop={36}>
        <OvalHeader title="Management Work Sheet and final conclusion" />
        <Text style={{ fontSize: 8.5, lineHeight: 1.45, marginBottom: 8 }}>{MANAGEMENT_LETTER_INTRO}</Text>
        <Text style={{ fontSize: 8.5, marginBottom: 6 }}>
          Below are the criteria of increment with effect from FY 2026-27.
        </Text>
        <View style={styles.tableHead}>
          <Text style={[styles.colCtc, styles.tableHeadText]}>CTC</Text>
          <Text style={[styles.colPct, styles.tableHeadText]}>% OF INCREMENT</Text>
        </View>
        {slabs.map((slab) => {
          const max = slab.ctcMax ?? Infinity;
          const active = annualCtc >= slab.ctcMin && annualCtc <= max;
          return (
            <View key={slab.id} style={[styles.tableRow, active ? styles.slabHi : {}]}>
              <Text style={styles.colCtc}>{formatSlabRange(slab.ctcMin, slab.ctcMax)}</Text>
              <Text style={styles.colPct}>0% to {decimalToNumber(slab.maxPct)}%</Text>
            </View>
          );
        })}
        <Text style={{ fontSize: 9, marginTop: 10, fontFamily: "Helvetica-Bold" }}>
          Dear Employee {s.employeeName} — You have been obtained {incrementPct}% of Increment based on your
          report card,
        </Text>
        <Text style={[styles.answerBox, { marginTop: 6 }]}>{pdfDisplayValue(s.mgmtFinalRemarks ?? s.mgmtFeedbackToEmployee) || " "}</Text>
        <Text style={{ marginTop: 12, fontSize: 8.5 }}>
          Signature of the Approver: {pdfDisplayValue(s.mgmtApproverName) || "___________"} · Date:{" "}
          {formatDate(s.mgmtApprovalDate ?? s.mgmtEffectiveDate) || " "}
        </Text>
      </PdfPage>
    </Document>
  );
}
