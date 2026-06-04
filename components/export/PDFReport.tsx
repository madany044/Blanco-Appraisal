import {
  Document,
  Page,
  Text,
  View,
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
  formatLearningCommitment,
  formatExpectationsAnswer,
  normalizeOverallRating,
} from "@/lib/form-questions";
import {
  pdfDisplayValue,
  getSubmissionField,
  formatSalary,
} from "@/lib/submission-display";
import { formatDate, decimalToNumber } from "@/lib/utils";
import type { SerializedIncrementSlab } from "@/lib/utils";
import {
  STRONG_REASONS,
  CONDITIONAL_REASONS,
  NOT_RECOMMENDED_REASONS,
  ABROAD_OPTIONS,
} from "@/lib/types";

const BLUE = "#1a5276";

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
    color: "#1e2740",
  },
  pageHeader: { textAlign: "center", marginBottom: 14 },
  companyName: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  docTitle: { fontSize: 10, marginBottom: 2 },
  employeeBlock: { marginBottom: 12 },
  employeeRow: { flexDirection: "row", marginBottom: 4 },
  employeeCol: { flex: 1 },
  questionBlock: { marginBottom: 12 },
  questionLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
    marginBottom: 4,
  },
  questionText: { fontSize: 10, marginBottom: 4 },
  answerText: { fontSize: 10, marginLeft: 20 },
  sectionHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginTop: 8,
    marginBottom: 6,
  },
  subsectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  bulletRow: { flexDirection: "row", marginBottom: 4, paddingLeft: 8 },
  bulletLabel: { flex: 1, fontSize: 10 },
  bulletValue: { width: 80, fontSize: 10, textAlign: "right" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingQuestion: { flex: 1, fontSize: 10, paddingRight: 8 },
  ratingLine: {
    width: 60,
    borderBottomWidth: 0.5,
    borderBottomColor: "#999",
    marginRight: 6,
  },
  ratingScore: { width: 36, fontSize: 10, textAlign: "right" },
  checkboxRow: { flexDirection: "row", marginBottom: 5, paddingLeft: 4 },
  checkboxMark: { width: 14, fontSize: 10 },
  checkboxText: { flex: 1, fontSize: 10 },
  ovalHeader: {
    borderWidth: 1,
    borderColor: "#1e2740",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
    alignSelf: "center",
    width: "85%",
  },
  ovalHeaderText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
  },
  blueBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: BLUE,
  },
  pageNumber: {
    position: "absolute",
    bottom: 2,
    right: 50,
    fontSize: 9,
    color: "#ffffff",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e8eef3",
    borderWidth: 0.5,
    borderColor: "#ccc",
    padding: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    padding: 5,
  },
  tableColCtc: { flex: 2, fontSize: 9 },
  tableColPct: { flex: 1, fontSize: 9, textAlign: "right" },
  slabHighlight: { backgroundColor: "#dbeafe" },
  letterText: { fontSize: 10, lineHeight: 1.5, marginBottom: 10 },
});

function PageFooter({ pageNum }: { pageNum: number }) {
  return (
    <>
      <View style={styles.blueBar} fixed />
      <Text style={styles.pageNumber} fixed>
        PAGE  {pageNum}
      </Text>
    </>
  );
}

function PageHeader() {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.companyName}>Team Blanco AND Team Blanka</Text>
      <Text style={styles.docTitle}>EMPLOYEE PROGRESS REPORT CARD FOR SALARY APPRAISAL</Text>
    </View>
  );
}

function QuestionAnswer({
  label,
  question,
  answer,
}: {
  label?: string;
  question: string;
  answer: string;
}) {
  return (
    <View style={styles.questionBlock}>
      {label ? <Text style={styles.questionLabel}>{label}</Text> : null}
      <Text style={styles.questionText}>{question}</Text>
      <Text style={styles.answerText}>{answer || " "}</Text>
    </View>
  );
}

function ProductivityBullet({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletLabel}>• {label}</Text>
      <Text style={styles.bulletValue}>{value || " "}</Text>
    </View>
  );
}

function SelfRatingLine({
  item,
  submission,
}: {
  item: (typeof SELF_RATING_ITEMS)[number];
  submission: AppraisalSubmission;
}) {
  const score = submission[item.key as keyof AppraisalSubmission] as number | null;
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingQuestion}>{selfRatingLabel(item)}</Text>
      <View style={styles.ratingLine} />
      <Text style={styles.ratingScore}>{score != null ? `${score}/10` : " /10"}</Text>
    </View>
  );
}

function CheckboxOption({ text, selected }: { text: string; selected: boolean }) {
  return (
    <View style={styles.checkboxRow}>
      <Text style={styles.checkboxMark}>{selected ? "[■]" : "[ ]"}</Text>
      <Text style={styles.checkboxText}>{text}</Text>
    </View>
  );
}

function OvalHeader({ title }: { title: string }) {
  return (
    <View style={styles.ovalHeader}>
      <Text style={styles.ovalHeaderText}>{title}</Text>
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
  const selectedOverall = normalizeOverallRating(s.overallRating);

  const mgrReasonOptions: Record<string, readonly string[]> = {
    mgrStrongReasons: STRONG_REASONS,
    mgrConditionalReasons: CONDITIONAL_REASONS,
    mgrNotRecommendedReasons: NOT_RECOMMENDED_REASONS,
  };

  const ratingsPart1 = SELF_RATING_ITEMS.slice(0, 10);
  const ratingsPart2 = SELF_RATING_ITEMS.slice(10);

  return (
    <Document>
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <View style={styles.employeeBlock}>
          <View style={styles.employeeRow}>
            <Text style={styles.employeeCol}>Employee Name: {pdfDisplayValue(s.employeeName)}</Text>
            <Text style={styles.employeeCol}>Date: {formatDate(s.dateOfSubmission) || " "}</Text>
          </View>
          <Text style={{ marginBottom: 4 }}>Employee ID: {pdfDisplayValue(s.employeeCode)}</Text>
          <Text style={{ marginBottom: 4 }}>Team & Designation: {pdfDisplayValue(s.teamDesignation)}</Text>
          <Text style={{ marginBottom: 4 }}>
            Previous number of years&apos; experience in this field (if applicable):{" "}
            {pdfDisplayValue(s.prevExperienceYears)}
          </Text>
          <Text>
            Number of years&apos; experience in this company: {pdfDisplayValue(s.companyExperienceYears)}
          </Text>
        </View>
        <QuestionAnswer
          label="Question 1"
          question={EMPLOYEE_QUESTIONS.q1.text}
          answer={pdfDisplayValue(s.basisOfAppraisal)}
        />
        <QuestionAnswer
          label="Question 2"
          question={EMPLOYEE_QUESTIONS.q2.text}
          answer={pdfDisplayValue(s.supportToCompany)}
        />
        <PageFooter pageNum={1} />
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <QuestionAnswer
          label="Question 3"
          question={EMPLOYEE_QUESTIONS.q3.text}
          answer={formatExpectationsAnswer(s) || " "}
        />
        <QuestionAnswer
          label="Question 4"
          question={EMPLOYEE_QUESTIONS.q4.text}
          answer={pdfDisplayValue(s.strengthsWeaknesses)}
        />
        <QuestionAnswer
          label="Question 5"
          question={EMPLOYEE_QUESTIONS.q5.text}
          answer={pdfDisplayValue(s.teamworkExamples)}
        />
        <PageFooter pageNum={2} />
      </Page>

      {/* PAGE 3 */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <Text style={styles.questionLabel}>{EMPLOYEE_QUESTIONS.q6heading}</Text>
        <QuestionAnswer question={EMPLOYEE_QUESTIONS.q6a.text} answer={pdfDisplayValue(s.goalChallenges)} />
        <QuestionAnswer question={EMPLOYEE_QUESTIONS.q6b.text} answer={pdfDisplayValue(s.upcomingGoal)} />
        <QuestionAnswer question={EMPLOYEE_QUESTIONS.q6c.text} answer={pdfDisplayValue(s.threeImprovements)} />
        <View style={styles.questionBlock}>
          <Text style={styles.questionText}>{EMPLOYEE_QUESTIONS.q6d.text}</Text>
          <Text style={[styles.answerText, { marginBottom: 4 }]}>
            Options: {INITIATIVE_FREQUENCY_OPTIONS.join(" · ")}
          </Text>
          <Text style={styles.answerText}>Selected: {pdfDisplayValue(s.initiativeFrequency) || " "}</Text>
        </View>
        <View style={styles.questionBlock}>
          <Text style={styles.questionText}>{EMPLOYEE_QUESTIONS.q6e.text}</Text>
          {s.abroadCapabilityNa ? (
            <Text style={styles.answerText}>N/A — Not applicable for this category</Text>
          ) : (
            <>
              <Text style={[styles.answerText, { marginBottom: 4 }]}>
                Options: {ABROAD_OPTIONS.join(" · ")}
              </Text>
              <Text style={styles.answerText}>Selected: {pdfDisplayValue(s.abroadCapability) || " "}</Text>
            </>
          )}
        </View>
        <PageFooter pageNum={3} />
      </Page>

      {/* PAGE 4 */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <QuestionAnswer
          label="Question 7"
          question={EMPLOYEE_QUESTIONS.q7.text}
          answer={pdfDisplayValue(s.initiativeInnovation)}
        />
        <View style={styles.questionBlock}>
          <Text style={styles.questionLabel}>Question 8</Text>
          <Text style={styles.questionText}>{EMPLOYEE_QUESTIONS.q8.text}</Text>
          {LEARNING_COMMITMENT_OPTIONS.map((o) => (
            <Text key={o.value} style={[styles.answerText, { marginBottom: 2 }]}>
              {o.label}
              {s.learningCommitment === o.value ? "  ← Selected" : ""}
            </Text>
          ))}
        </View>
        <QuestionAnswer
          label="G (Professionalism)"
          question={EMPLOYEE_QUESTIONS.q9.text}
          answer={pdfDisplayValue(s.professionalismAttitude)}
        />
        <PageFooter pageNum={4} />
      </Page>

      {/* PAGE 5 */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        {ratingsPart1.map((item) => (
          <SelfRatingLine key={item.key} item={item} submission={s} />
        ))}
        <PageFooter pageNum={5} />
      </Page>

      {/* PAGE 6 */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        {ratingsPart2.map((item) => (
          <SelfRatingLine key={item.key} item={item} submission={s} />
        ))}
        <PageFooter pageNum={6} />
      </Page>

      {/* PAGE 7 */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <Text style={styles.sectionHeading}>10. Productivity and Time Management:</Text>
        <Text style={{ fontSize: 10, marginBottom: 10 }}>{PRODUCTIVITY_INTRO}</Text>
        <Text style={styles.subsectionTitle}>Shop Drafting and Checker</Text>
        {SHOP_DRAFTING_ITEMS.map((item) => (
          <ProductivityBullet
            key={item.key}
            label={item.label}
            value={pdfDisplayValue(getSubmissionField(s, item.key))}
          />
        ))}
        <Text style={styles.subsectionTitle}>E-Drafting</Text>
        {E_DRAFTING_ITEMS.map((item) => (
          <ProductivityBullet
            key={item.key}
            label={item.label}
            value={pdfDisplayValue(getSubmissionField(s, item.key))}
          />
        ))}
        <PageFooter pageNum={7} />
      </Page>

      {/* PAGE 8 */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <Text style={styles.subsectionTitle}>Modeler</Text>
        {s.modelerSectionNa ? (
          <Text style={{ textAlign: "center", marginTop: 20, fontSize: 10 }}>----NA----</Text>
        ) : (
          MODELER_ITEMS.map((item) => (
            <ProductivityBullet
              key={item.key}
              label={item.label}
              value={pdfDisplayValue(getSubmissionField(s, item.key))}
            />
          ))
        )}
        <PageFooter pageNum={8} />
      </Page>

      {/* PAGE 9 */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <Text style={styles.sectionHeading}>{EMPLOYEE_QUESTIONS.q11.text}</Text>
        <Text style={{ marginLeft: 12, marginTop: 6, fontSize: 10 }}>
          • Please describe your current year work performance and Time Management
        </Text>
        <Text style={[styles.answerText, { marginTop: 10 }]}>
          {pdfDisplayValue(s.currentYearPerformance) || " "}
        </Text>
        <PageFooter pageNum={9} />
      </Page>

      {/* PAGE 10 */}
      <Page size="A4" style={styles.page}>
        <PageHeader />
        <QuestionAnswer
          question={EMPLOYEE_QUESTIONS.q12.text}
          answer={pdfDisplayValue(s.productivityImprovement)}
        />
        <Text style={[styles.questionText, { fontFamily: "Helvetica-Bold", marginTop: 8 }]}>
          Rate Yourself of Your Overall Performance:
        </Text>
        {OVERALL_RATING_OPTIONS.map((opt) => (
          <CheckboxOption key={opt} text={opt} selected={selectedOverall === opt} />
        ))}
        <Text style={{ marginTop: 14, fontSize: 10 }}>
          Employee Signature: {pdfDisplayValue(s.employeeSignatureName)}    Employee Code:{" "}
          {pdfDisplayValue(s.employeeCode)}
        </Text>
        <Text style={{ marginTop: 6, fontSize: 10 }}>
          Date: {formatDate(s.employeeSignatureDate) || formatDate(s.dateOfSubmission) || " "}
        </Text>
        <PageFooter pageNum={10} />
      </Page>

      {/* PAGE 11 */}
      <Page size="A4" style={styles.page}>
        <OvalHeader title="HR AND ADMIN FEED BACK" />
        {HR_RATING_ITEMS.map((item) => {
          const val = s[item.key as keyof AppraisalSubmission] as number | null;
          return (
            <View key={item.key} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 10 }}>• {item.label}</Text>
              <Text style={{ fontSize: 10, marginLeft: 20, marginTop: 2 }}>
                {val != null ? `${val}/10` : " "}
              </Text>
            </View>
          );
        })}
        <Text style={{ fontSize: 10, marginTop: 10, marginBottom: 6 }}>{HR_BACKLOG_QUESTION}</Text>
        <Text style={styles.answerText}>{pdfDisplayValue(s.hrBacklogNotes) || " "}</Text>
        <Text style={{ marginTop: 16, fontSize: 10 }}>
          Signature Of Admin Head: {pdfDisplayValue(s.hrAdminSignatureName)}
        </Text>
        <Text style={{ marginTop: 6, fontSize: 10 }}>Date: {formatDate(s.hrAdminSignatureDate) || " "}</Text>
        <PageFooter pageNum={11} />
      </Page>

      {/* PAGE 12 */}
      <Page size="A4" style={styles.page}>
        <OvalHeader title="TEAM HEAD FEED BACK" />
        <Text style={{ fontSize: 10, marginBottom: 12 }}>
          Employee Name: {pdfDisplayValue(s.employeeName)}    Employee Code: {pdfDisplayValue(s.employeeCode)}
        </Text>
        {MGR_RECOMMENDATION_SECTIONS.map((section) => {
          const reasons = s[section.field] ?? [];
          const options = mgrReasonOptions[section.field];
          const checked = [
            ...options.filter((r) => reasons.includes(r)),
            ...reasons.filter((r) => !options.includes(r)),
          ];
          return (
            <View key={section.level} style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
                • {section.header}
              </Text>
              {checked.map((r) => (
                <Text key={r} style={{ fontSize: 9, marginLeft: 12, marginBottom: 2 }}>
                  • {r}
                </Text>
              ))}
            </View>
          );
        })}
        <Text style={{ marginTop: 14, fontSize: 10 }}>
          Signature Of Team Head: {pdfDisplayValue(s.mgrSignatureName)}
        </Text>
        <Text style={{ marginTop: 6, fontSize: 10 }}>Date: {formatDate(s.mgrSignatureDate) || " "}</Text>
        <PageFooter pageNum={12} />
      </Page>

      {/* PAGE 13 */}
      <Page size="A4" style={styles.page}>
        <OvalHeader title="Management Work Sheet and final conclusion" />
        <Text style={styles.letterText}>{MANAGEMENT_LETTER_INTRO}</Text>
        <Text style={{ fontSize: 10, marginBottom: 8 }}>
          Below are the criteria of increment with effect from FY 2026-27.
        </Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableColCtc, { fontFamily: "Helvetica-Bold" }]}>CTC</Text>
          <Text style={[styles.tableColPct, { fontFamily: "Helvetica-Bold" }]}>% OF INCREMENT</Text>
        </View>
        {slabs.map((slab) => {
          const max = slab.ctcMax ?? Infinity;
          const active = annualCtc >= slab.ctcMin && annualCtc <= max;
          return (
            <View key={slab.id} style={[styles.tableRow, active ? styles.slabHighlight : {}]}>
              <Text style={styles.tableColCtc}>{formatSlabRange(slab.ctcMin, slab.ctcMax)}</Text>
              <Text style={styles.tableColPct}>0% to {decimalToNumber(slab.maxPct)}%</Text>
            </View>
          );
        })}
        <Text style={{ fontSize: 10, marginTop: 12, fontFamily: "Helvetica-Bold" }}>
          Dear Employee {s.employeeName}  You have been obtained {incrementPct}% of Increment based on your
          report card,
        </Text>
        <Text style={[styles.answerText, { marginTop: 10, marginLeft: 0 }]}>
          {pdfDisplayValue(s.mgmtFinalRemarks ?? s.mgmtFeedbackToEmployee) || " "}
        </Text>
        <Text style={{ marginTop: 20, fontSize: 10 }}>
          Signature of the Approver: {pdfDisplayValue(s.mgmtApproverName) || "___________"}
        </Text>
        <Text style={{ marginTop: 6, fontSize: 10 }}>
          Date: {formatDate(s.mgmtApprovalDate ?? s.mgmtEffectiveDate) || " "}
        </Text>
        <PageFooter pageNum={13} />
      </Page>
    </Document>
  );
}
