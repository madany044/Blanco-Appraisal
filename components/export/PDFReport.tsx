import type { ReactNode } from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Line,
  Svg,
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
 
// ─── Palette ────────────────────────────────────────────────────────────────
const BLUE = "#1a4f8a";
const TEAL = "#2a7a8c";
const INK = "#1e2740";
const WHITE = "#ffffff";
const LIGHT_GRAY = "#f5f7fa";
const BORDER_GRAY = "#c8d4e3";
 
// ─── Shared constants ────────────────────────────────────────────────────────
const ANSWER_MIN_HEIGHT = 60; // min height for every free-text answer box
const RATING_ANSWER_HEIGHT = 28;
 
// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Page
  page: {
    paddingTop: 0,
    paddingBottom: 28,
    paddingHorizontal: 0,
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
    color: INK,
    backgroundColor: WHITE,
  },
 
  // ── Header ──────────────────────────────────────────────────────────────
  headerWrapper: {
    borderBottomWidth: 2,
    borderBottomColor: TEAL,
    marginBottom: 0,
    paddingBottom: 6,
    paddingTop: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { width: 56, height: 40, objectFit: "contain" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: TEAL,
    textAlign: "center",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
 
  // ── Blue footer bar ──────────────────────────────────────────────────────
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: TEAL,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 16,
  },
  pageNumText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
 
  // ── Body padding ────────────────────────────────────────────────────────
  body: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
 
  // ── Info panel ──────────────────────────────────────────────────────────
  infoTable: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  infoRowLast: {
    flexDirection: "row",
  },
  infoCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 8.5,
  },
  infoCellRight: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    fontSize: 8.5,
    borderLeftWidth: 0.5,
    borderLeftColor: BORDER_GRAY,
  },
  infoLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  infoValue: {
    fontSize: 8.5,
    marginTop: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: INK,
    minHeight: 14,
    paddingBottom: 2,
  },
 
  // ── Question block ──────────────────────────────────────────────────────
  qBlock: {
    marginBottom: 14,
  },
  qHeading: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    marginBottom: 1,
    textDecoration: "underline",
  },
  qSubheading: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginBottom: 4,
  },
  qBody: {
    fontSize: 8.5,
    color: INK,
    marginBottom: 4,
  },
  answerBox: {
    borderWidth: 0.5,
    borderColor: BORDER_GRAY,
    backgroundColor: LIGHT_GRAY,
    padding: 6,
    minHeight: ANSWER_MIN_HEIGHT,
    fontSize: 9,
  },
  answerBoxSmall: {
    borderWidth: 0.5,
    borderColor: BORDER_GRAY,
    backgroundColor: LIGHT_GRAY,
    padding: 5,
    minHeight: RATING_ANSWER_HEIGHT,
    fontSize: 9,
  },
  answerLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: INK,
    minHeight: 16,
    paddingBottom: 2,
    marginBottom: 2,
    fontSize: 9,
  },
 
  // ── Section heading (oval-style) ────────────────────────────────────────
  sectionOvalWrap: {
    alignItems: "center",
    marginBottom: 10,
    marginTop: 4,
  },
  sectionOval: {
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 24,
    backgroundColor: "#eef6f8",
  },
  sectionOvalText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
 
  // ── Subheading underline (for Productivity sub-sections) ────────────────
  subheadingCenter: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 6,
    color: INK,
  },
 
  // ── Two-column layout ───────────────────────────────────────────────────
  twoCol: {
    flexDirection: "row",
    gap: 10,
  },
  col: { flex: 1 },
 
  // ── Bullet-value row (productivity) ────────────────────────────────────
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 6,
    fontSize: 8,
  },
  bulletLabel: {
    flex: 1,
    paddingRight: 4,
    fontSize: 8,
    lineHeight: 1.3,
  },
  bulletUnderline: {
    width: 70,
    borderBottomWidth: 0.5,
    borderBottomColor: INK,
    minHeight: 14,
    paddingBottom: 1,
    fontSize: 8,
    textAlign: "right",
  },
 
  // ── Self-rating row ─────────────────────────────────────────────────────
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    fontSize: 8,
  },
  ratingAlpha: {
    width: 14,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  ratingLabel: {
    flex: 1,
    fontSize: 8,
    paddingRight: 6,
  },
  ratingCircleWrap: {
    width: 34,
    height: 26,
    borderWidth: 1,
    borderColor: INK,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingCircleTop: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    lineHeight: 1,
  },
  ratingCircleDenominator: {
    fontSize: 7,
    color: INK,
    lineHeight: 1,
  },
 
  // ── Checkbox row ────────────────────────────────────────────────────────
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
    fontSize: 8.5,
  },
  checkBox: {
    width: 14,
    height: 10,
    borderWidth: 1,
    borderColor: INK,
    marginRight: 5,
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },
  checkText: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 1.35,
  },
 
  // ── HR rating bullet row ─────────────────────────────────────────────────
  hrRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
    fontSize: 8.5,
  },
  hrLabel: {
    flex: 1,
    fontSize: 8.5,
  },
  hrCircleWrap: {
    width: 32,
    height: 24,
    borderWidth: 1,
    borderColor: INK,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
 
  // ── Team Head section ───────────────────────────────────────────────────
  mgrSectionHead: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    marginBottom: 3,
    color: BLUE,
  },
  mgrItem: {
    flexDirection: "row",
    marginBottom: 2,
    fontSize: 8,
  },
  mgrBullet: {
    width: 12,
    fontSize: 8,
  },
  mgrItemText: {
    flex: 1,
    fontSize: 8,
  },
 
  // ── Increment table ─────────────────────────────────────────────────────
  tableHead: {
    flexDirection: "row",
    backgroundColor: BLUE,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableHeadText: {
    color: WHITE,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: BORDER_GRAY,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  tableRowHighlight: {
    backgroundColor: "#d6eaf8",
  },
  tableCell: {
    flex: 1,
    fontSize: 8,
  },
  tableCellRight: {
    flex: 1,
    fontSize: 8,
    textAlign: "right",
  },
 
  // ── Signature row ───────────────────────────────────────────────────────
  sigRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  sigBlock: {
    flex: 1,
  },
  sigLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  sigLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: INK,
    minHeight: 18,
    paddingBottom: 2,
    fontSize: 9,
  },
 
  // ── Divider ─────────────────────────────────────────────────────────────
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
    marginVertical: 8,
  },
 
  // ── Intro paragraph ─────────────────────────────────────────────────────
  introPara: {
    fontSize: 8.5,
    lineHeight: 1.5,
    marginBottom: 8,
    color: INK,
  },
});
 
// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────
 
function PageHeader({ logoSrc }: { logoSrc?: string }) {
  return (
    <View style={s.headerWrapper} fixed>
      {logoSrc ? (
        <Image src={logoSrc} style={s.logo} />
      ) : (
        <View style={{ width: 56 }} />
      )}
      <View style={s.headerCenter}>
        <Text style={s.headerTitle}>Team Blanco AND Team Blanka</Text>
        <Text style={s.headerSubtitle}>
          Employee Progress Report Card for Salary Appraisal
        </Text>
      </View>
      {logoSrc ? (
        <Image src={logoSrc} style={s.logo} />
      ) : (
        <View style={{ width: 56 }} />
      )}
    </View>
  );
}
 
function PageFooter({ num }: { num: number }) {
  return (
    <View style={s.footerBar} fixed>
      <Text style={s.pageNumText}>PAGE {num}</Text>
    </View>
  );
}
 
function PdfPage({
  num,
  logoSrc,
  children,
}: {
  num: number;
  logoSrc?: string;
  children: ReactNode;
}) {
  return (
    <Page size="A4" style={s.page}>
      <PageHeader logoSrc={logoSrc} />
      <View style={s.body}>{children}</View>
      <PageFooter num={num} />
    </Page>
  );
}
 
// Free-text Q&A block with guaranteed minimum answer space
function QABlock({
  number,
  heading,
  body,
  answer,
  minHeight = ANSWER_MIN_HEIGHT,
}: {
  number?: string;
  heading: string;
  body?: string;
  answer: string;
  minHeight?: number;
}) {
  return (
    <View style={s.qBlock} wrap={false}>
      {number ? (
        <Text style={s.qHeading}>
          {number}. {heading}
        </Text>
      ) : (
        <Text style={s.qHeading}>{heading}</Text>
      )}
      {body ? <Text style={s.qBody}>{body}</Text> : null}
      <View style={[s.answerBox, { minHeight }]}>
        <Text>{answer || " "}</Text>
      </View>
    </View>
  );
}
 
// Info panel
function InfoPanel({ sub }: { sub: AppraisalSubmission }) {
  return (
    <View style={s.infoTable}>
      <View style={s.infoRow}>
        <View style={s.infoCell}>
          <Text style={s.infoLabel}>Employee Name:</Text>
          <Text style={s.infoValue}>{pdfDisplayValue(sub.employeeName)}</Text>
        </View>
        <View style={s.infoCellRight}>
          <Text style={s.infoLabel}>Date:</Text>
          <Text style={s.infoValue}>
            {formatDate(sub.dateOfSubmission) || " "}
          </Text>
        </View>
      </View>
      <View style={s.infoRow}>
        <View style={s.infoCell}>
          <Text style={s.infoLabel}>Employee ID:</Text>
          <Text style={s.infoValue}>{pdfDisplayValue(sub.employeeCode)}</Text>
        </View>
        <View style={s.infoCellRight}>
          <Text style={s.infoLabel}>Team:</Text>
          <Text style={s.infoValue}>{pdfDisplayValue(sub.team)}</Text>
        </View>
      </View>
      <View style={s.infoRow}>
        <View style={s.infoCell}>
          <Text style={s.infoLabel}>Designation:</Text>
          <Text style={s.infoValue}>{pdfDisplayValue(sub.designation)}</Text>
        </View>
        <View style={s.infoCellRight}>
          <Text style={s.infoLabel}>
            Number of years' experience in this company:
          </Text>
          <Text style={s.infoValue}>
            {pdfDisplayValue(sub.companyExperienceYears)}
          </Text>
        </View>
      </View>
      <View style={s.infoRowLast}>
        <View style={s.infoCell}>
          <Text style={s.infoLabel}>
            Previous number of years' experience in this field:
          </Text>
          <Text style={s.infoValue}>
            {pdfDisplayValue(sub.prevExperienceYears)}
          </Text>
        </View>
        <View style={s.infoCellRight} />
      </View>
    </View>
  );
}
 
// Single self-rating item row (letter + label + circle)
function RatingRow({
  alpha,
  label,
  score,
}: {
  alpha: string;
  label: string;
  score: number | null;
}) {
  const display = score != null ? `${score}` : "—";
  return (
    <View style={s.ratingRow}>
      <Text style={s.ratingAlpha}>{alpha}.</Text>
      <Text style={s.ratingLabel}>{label}</Text>
      <View style={s.ratingCircleWrap}>
        <Text style={s.ratingCircleTop}>{display}</Text>
        <Text style={s.ratingCircleDenominator}>── 10</Text>
      </View>
    </View>
  );
}
 
// Productivity bullet row with underline value
function ProdRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bulletLabel}>• {label}</Text>
      <Text style={s.bulletUnderline}>{value}</Text>
    </View>
  );
}
 
// Section oval heading
function OvalHeading({ title }: { title: string }) {
  return (
    <View style={s.sectionOvalWrap}>
      <View style={s.sectionOval}>
        <Text style={s.sectionOvalText}>{title}</Text>
      </View>
    </View>
  );
}
 
// Checkbox row
function CheckRow({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <View style={s.checkRow}>
      <View style={s.checkBox}>
        {checked ? <Text style={s.checkMark}>✓</Text> : null}
      </View>
      <Text style={s.checkText}>{label}</Text>
    </View>
  );
}
 
// HR rating row
function HrRatingRow({
  label,
  score,
  notes,
}: {
  label: string;
  score: number | null;
  notes?: string | null;
}) {
  return (
    <View style={s.hrRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.hrLabel}>• {label}</Text>
        {notes ? (
          <Text style={{ fontSize: 8, fontStyle: "italic", color: "#6b7a99", marginTop: 2 }}>
            {notes}
          </Text>
        ) : null}
      </View>
      <View style={s.hrCircleWrap}>
        <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold" }}>
          {score != null ? `${score}/10` : "—"}
        </Text>
      </View>
    </View>
  );
}
 
function formatSlabRange(min: number, max: number | null): string {
  if (max == null) return `${min.toLocaleString("en-IN")} and above`;
  if (min === 0) return `Less than ${(max + 1).toLocaleString("en-IN")}`;
  return `${min.toLocaleString("en-IN")} to ${max.toLocaleString("en-IN")}`;
}
 
// ────────────────────────────────────────────────────────────────────────────
// Main export
// ────────────────────────────────────────────────────────────────────────────
 
interface PDFReportProps {
  submission: AppraisalSubmission;
  slabs?: SerializedIncrementSlab[];
  logoSrc?: string;
}
 
export function PDFReport({
  submission: sub,
  slabs = [],
  logoSrc,
}: PDFReportProps) {
  const isQC = sub.category === "QC";
  const annualCtc = (sub.currentSalary ?? 0) * 12;
  const incrementPct = decimalToNumber(sub.mgmtIncrementPercentage);
  const newMonthlySalary =
    sub.mgmtNewSalary != null
      ? Math.round(decimalToNumber(sub.mgmtNewSalary))
      : Math.round((sub.currentSalary ?? 0) * (1 + incrementPct / 100));
  const selectedOverall = normalizeOverallRating(sub.overallRating);
 
  const mgrReasonOptions: Record<string, readonly string[]> = {
    mgrStrongReasons: STRONG_REASONS,
    mgrConditionalReasons: CONDITIONAL_REASONS,
    mgrNotRecommendedReasons: NOT_RECOMMENDED_REASONS,
  };
 
  let p = 0;
 
  // ── helpers ──────────────────────────────────────────────────────────────
  const nextPage = () => ++p;
 
  return (
    <Document>
      {/* ══════════════════════════════════════════════════════════════════
          PAGE 1 — Employee Info + Q1 + Q2
      ══════════════════════════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <InfoPanel sub={sub} />
 
        <QABlock
          number="1"
          heading="Basis of appraisal request:"
          body="Please describe on what basis we should consider your Salary appraisal request:"
          answer={pdfDisplayValue(sub.basisOfAppraisal)}
        />
 
        <QABlock
          number="2"
          heading="Support to the company:"
          body="Please describe how would you support the company to grow and generate more income as similar as your salary appraisal:"
          answer={pdfDisplayValue(sub.supportToCompany)}
        />
      </PdfPage>
 
      {/* ══════════════════════════════════════════════════════════════════
          PAGE 2 — Q3 + Q4 + Q5
      ══════════════════════════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <QABlock
          number="3"
          heading="Expectations:"
          body='Do you think you can expect same amount of appraisal from year to year as your salary grows? (Tell us "YES" OR "NO" and describe the reason accordingly)'
          answer={formatExpectationsAnswer(sub) || " "}
        />
 
        <QABlock
          number="4"
          heading="Improvement in yourself:"
          body="Please describe your strengths & weaknesses and describe what improvement in yourself compared to the previous year:"
          answer={pdfDisplayValue(sub.strengthsWeaknesses)}
        />
 
        <QABlock
          number="5"
          heading="Provide examples of instances where you demonstrated strong teamwork:"
          answer={pdfDisplayValue(sub.teamworkExamples)}
        />
      </PdfPage>
 
      {/* ══════════════════════════════════════════════════════════════════
          PAGE 3 — Q6 (Achievements, Goal & Opportunities)
      ══════════════════════════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <View style={s.qBlock}>
          <Text style={s.qHeading}>6. Achievements, Goal, &amp; Opportunities:</Text>
        </View>
 
        <QABlock
          heading="a."
          body="If achieved, what are the challenges did you face in achieving your goals, and how did you overcome them?"
          answer={pdfDisplayValue(sub.goalChallenges)}
        />
 
        <QABlock
          heading="b."
          body="Please notify what is your goal for this upcoming year and explain how that will be beneficial to both of us?"
          answer={pdfDisplayValue(sub.upcomingGoal)}
        />
 
        <QABlock
          heading="c."
          body="What are the 3 things you would like to improve?"
          answer={pdfDisplayValue(sub.threeImprovements)}
        />
 
        {/* Q6d — initiative frequency */}
        <View style={s.qBlock} wrap={false}>
          <Text style={s.qBody}>
            d. Did you demonstrate initiative and contribute innovative ideas to improve processes or solve problems?
          </Text>
          <View style={{ marginLeft: 10 }}>
            {INITIATIVE_FREQUENCY_OPTIONS.map((opt) => (
              <CheckRow
                key={opt}
                checked={sub.initiativeFrequency === opt}
                label={opt}
              />
            ))}
          </View>
        </View>
 
        {/* Q6e — abroad */}
        <View style={s.qBlock} wrap={false}>
          <Text style={s.qBody}>
            e. Do you have capability of managing yourself if company gives opportunity to work in abroad:
          </Text>
          {sub.abroadCapabilityNa ? (
            <View style={{ marginLeft: 10 }}>
              {ABROAD_OPTIONS.map((opt) => (
                <CheckRow key={opt} checked={false} label={opt} />
              ))}
              <Text style={{ marginTop: 6, fontFamily: "Helvetica-Bold", color: "#c0392b" }}>
                N/A
              </Text>
            </View>
          ) : (
            <View style={{ marginLeft: 10 }}>
              {ABROAD_OPTIONS.map((opt) => (
                <CheckRow
                  key={opt}
                  checked={sub.abroadCapability === opt}
                  label={opt}
                />
              ))}
            </View>
          )}
        </View>
      </PdfPage>
 
      {/* ══════════════════════════════════════════════════════════════════
          PAGE 4 — Q7 + Q8 + G
      ══════════════════════════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <QABlock
          number="7"
          heading="Provide examples of instances where you showed initiative or innovation."
          answer={pdfDisplayValue(sub.initiativeInnovation)}
        />
 
        {/* Q8 — learning commitment */}
        <View style={s.qBlock} wrap={false}>
          <Text style={s.qHeading}>8. Reflect on your commitment to professional development and continuous learning.</Text>
          <View style={{ marginTop: 6, marginLeft: 10 }}>
            {LEARNING_COMMITMENT_OPTIONS.map((o) => (
              <CheckRow
                key={o.value}
                checked={sub.learningCommitment === o.value}
                label={o.label}
              />
            ))}
          </View>
        </View>
 
        <QABlock
          heading="G. Professionalism and Attitude:"
          body="Please describe your professionalism and attitude with your team during office premises (including perspective vision on your career along with your team)."
          answer={pdfDisplayValue(sub.professionalismAttitude)}
        />
      </PdfPage>
 
      {/* ══════════════════════════════════════════════════════════════════
          PAGE 5 — Self Performance Ratings (a–t)
      ══════════════════════════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <View style={{ marginBottom: 10 }}>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Helvetica-Bold",
              color: BLUE,
              textDecoration: "underline",
              marginBottom: 8,
            }}
          >
            Self Performance Ratings
          </Text>
        </View>
 
        {/* Split into two columns */}
        {(() => {
          const alphas = "abcdefghijklmnopqrst".split("");
          const mid = Math.ceil(SELF_RATING_ITEMS.length / 2);
          const left = SELF_RATING_ITEMS.slice(0, mid);
          const right = SELF_RATING_ITEMS.slice(mid);
          return (
            <View style={s.twoCol}>
              <View style={s.col}>
                {left.map((item, i) => {
                  const score = sub[item.key as keyof AppraisalSubmission] as
                    | number
                    | null;
                  return (
                    <RatingRow
                      key={item.key}
                      alpha={alphas[i]}
                      label={selfRatingLabel(item)}
                      score={score}
                    />
                  );
                })}
              </View>
              <View style={s.col}>
                {right.map((item, i) => {
                  const score = sub[item.key as keyof AppraisalSubmission] as
                    | number
                    | null;
                  return (
                    <RatingRow
                      key={item.key}
                      alpha={alphas[mid + i]}
                      label={selfRatingLabel(item)}
                      score={score}
                    />
                  );
                })}
              </View>
            </View>
          );
        })()}
      </PdfPage>
 
      {/* ══════════════════════════════════════════════════════════════════
          Non-QC only: Productivity pages
      ══════════════════════════════════════════════════════════════════ */}
      {!isQC && (
        <>
          {/* PAGE — Shop Drafting + E-Drafting */}
          <PdfPage num={nextPage()} logoSrc={logoSrc}>
            <View style={{ marginBottom: 6 }}>
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: "Helvetica-Bold",
                  color: BLUE,
                  marginBottom: 2,
                }}
              >
                10. Productivity and Time Management:
              </Text>
              <Text style={s.introPara}>{PRODUCTIVITY_INTRO}</Text>
            </View>
 
            <Text style={s.subheadingCenter}>Shop Drafting and Checker</Text>
            <View style={s.twoCol}>
              <View style={s.col}>
                {SHOP_DRAFTING_ITEMS.slice(
                  0,
                  Math.ceil(SHOP_DRAFTING_ITEMS.length / 2)
                ).map((item) => (
                  <ProdRow
                    key={item.key}
                    label={item.label}
                    value={
                      pdfDisplayValue(
                        getSubmissionField(
                          sub,
                          item.key as keyof AppraisalSubmission
                        )
                      ) || "—"
                    }
                  />
                ))}
              </View>
              <View style={s.col}>
                {SHOP_DRAFTING_ITEMS.slice(
                  Math.ceil(SHOP_DRAFTING_ITEMS.length / 2)
                ).map((item) => (
                  <ProdRow
                    key={item.key}
                    label={item.label}
                    value={
                      pdfDisplayValue(
                        getSubmissionField(
                          sub,
                          item.key as keyof AppraisalSubmission
                        )
                      ) || "—"
                    }
                  />
                ))}
              </View>
            </View>
 
            <Text style={s.subheadingCenter}>E-Drafting</Text>
            <View style={s.twoCol}>
              <View style={s.col}>
                {E_DRAFTING_ITEMS.slice(
                  0,
                  Math.ceil(E_DRAFTING_ITEMS.length / 2)
                ).map((item) => (
                  <ProdRow
                    key={item.key}
                    label={item.label}
                    value={
                      pdfDisplayValue(
                        getSubmissionField(
                          sub,
                          item.key as keyof AppraisalSubmission
                        )
                      ) || "—"
                    }
                  />
                ))}
              </View>
              <View style={s.col}>
                {E_DRAFTING_ITEMS.slice(
                  Math.ceil(E_DRAFTING_ITEMS.length / 2)
                ).map((item) => (
                  <ProdRow
                    key={item.key}
                    label={item.label}
                    value={
                      pdfDisplayValue(
                        getSubmissionField(
                          sub,
                          item.key as keyof AppraisalSubmission
                        )
                      ) || "—"
                    }
                  />
                ))}
              </View>
            </View>
          </PdfPage>
 
          {/* PAGE — Modeler */}
          <PdfPage num={nextPage()} logoSrc={logoSrc}>
            <Text style={s.subheadingCenter}>Modeler</Text>
            {sub.modelerSectionNa ? (
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  fontFamily: "Helvetica-Bold",
                  marginTop: 20,
                }}
              >
                ----NA----
              </Text>
            ) : (
              <View style={s.twoCol}>
                <View style={s.col}>
                  {MODELER_ITEMS.slice(
                    0,
                    Math.ceil(MODELER_ITEMS.length / 2)
                  ).map((item) => (
                    <ProdRow
                      key={item.key}
                      label={item.label}
                      value={
                        pdfDisplayValue(
                          getSubmissionField(
                            sub,
                            item.key as keyof AppraisalSubmission
                          )
                        ) || "—"
                      }
                    />
                  ))}
                </View>
                <View style={s.col}>
                  {MODELER_ITEMS.slice(
                    Math.ceil(MODELER_ITEMS.length / 2)
                  ).map((item) => (
                    <ProdRow
                      key={item.key}
                      label={item.label}
                      value={
                        pdfDisplayValue(
                          getSubmissionField(
                            sub,
                            item.key as keyof AppraisalSubmission
                          )
                        ) || "—"
                      }
                    />
                  ))}
                </View>
              </View>
            )}
          </PdfPage>
        </>
      )}
 
      {/* ══════════════════════════════════════════════════════════════════
          PAGE — Q11 + Q12 + Overall Rating + Employee Signature
      ══════════════════════════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <QABlock
          number="11"
          heading="Work performance and Time Management:"
          body="Please describe your current year work performance and Time Management"
          answer={pdfDisplayValue(sub.currentYearPerformance)}
          minHeight={70}
        />
 
        <QABlock
          number="12"
          heading=""
          body="Please describe how you would perform and improve your productivity for this upcoming performance cycle as similar as your salary grow:"
          answer={pdfDisplayValue(sub.productivityImprovement)}
          minHeight={70}
        />
 
        {/* Overall rating checkboxes */}
        <View style={[s.qBlock, { marginTop: 4 }]} wrap={false}>
          <Text
            style={{
              fontSize: 9,
              fontFamily: "Helvetica-Bold",
              textDecoration: "underline",
              marginBottom: 6,
            }}
          >
            Rate Yourself of Your Overall Performance:
          </Text>
          {OVERALL_RATING_OPTIONS.map((opt) => (
            <CheckRow key={opt} checked={selectedOverall === opt} label={opt} />
          ))}
        </View>
 
        {/* Employee signature panel */}
        <View style={[s.infoTable, { marginTop: 12 }]}>
          <View style={s.infoRow}>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>Employee Signature:</Text>
              <Text style={s.infoValue}>
                {pdfDisplayValue(sub.employeeSignatureName) || " "}
              </Text>
            </View>
            <View style={s.infoCellRight}>
              <Text style={s.infoLabel}>Employee Code:</Text>
              <Text style={s.infoValue}>{pdfDisplayValue(sub.employeeCode)}</Text>
            </View>
          </View>
          <View style={s.infoRowLast}>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>Date:</Text>
              <Text style={s.infoValue}>
                {formatDate(sub.employeeSignatureDate) ||
                  formatDate(sub.dateOfSubmission) ||
                  " "}
              </Text>
            </View>
            <View style={s.infoCellRight} />
          </View>
        </View>
      </PdfPage>
 
      {/* ══════════════════════════════════════════════════════════════════
          PAGE — HR and Admin Feedback
      ══════════════════════════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <OvalHeading title="HR AND ADMIN FEED BACK" />
 
        {HR_RATING_ITEMS.map((item) => {
          const val = sub[item.key as keyof AppraisalSubmission] as
            | number
            | null;
          const notes =
            item.key === "hrLeaveManagement"
              ? sub.hrLeaveManagementNotes
              : item.key === "hrTimingManagement"
              ? sub.hrTimingManagementNotes
              : null;
          return (
            <HrRatingRow key={item.key} label={item.label} score={val} notes={notes} />
          );
        })}

        <View style={[s.qBlock, { marginTop: 8 }]}>
          <Text style={s.qBody}>
            Effective Date: {formatDate(sub.mgmtEffectiveDate) || " "}
          </Text>
        </View>
 
        <View style={[s.qBlock, { marginTop: 8 }]}>
          <Text style={s.qBody}>{HR_BACKLOG_QUESTION}</Text>
          <View style={[s.answerBox, { minHeight: 80 }]}>
            <Text>{pdfDisplayValue(sub.hrBacklogNotes) || " "}</Text>
          </View>
        </View>
 
        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <Text style={s.sigLabel}>Signature Of Admin Head:</Text>
            <Text style={s.sigLine}>
              {pdfDisplayValue(sub.hrAdminSignatureName) || " "}
            </Text>
          </View>
          <View style={s.sigBlock}>
            <Text style={s.sigLabel}>Date:</Text>
            <Text style={s.sigLine}>
              {formatDate(sub.hrAdminSignatureDate) || " "}
            </Text>
          </View>
        </View>
      </PdfPage>
 
      {/* ══════════════════════════════════════════════════════════════════
          PAGE — Team Head Feedback
      ══════════════════════════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <OvalHeading title="TEAM HEAD FEED BACK" />
 
        {/* Employee identification */}
        <View style={[s.infoTable, { marginBottom: 12 }]}>
          <View style={s.infoRowLast}>
            <View style={s.infoCell}>
              <Text style={s.infoLabel}>Employee Name:</Text>
              <Text style={s.infoValue}>{pdfDisplayValue(sub.employeeName)}</Text>
            </View>
            <View style={s.infoCellRight}>
              <Text style={s.infoLabel}>Employee Code:</Text>
              <Text style={s.infoValue}>{pdfDisplayValue(sub.employeeCode)}</Text>
            </View>
          </View>
        </View>
 
        {MGR_RECOMMENDATION_SECTIONS.map((section) => {
          const reasons = (sub[section.field] as string[]) ?? [];
          const options = mgrReasonOptions[section.field];
          const checked = [
            ...options.filter((r) => reasons.includes(r)),
            ...reasons.filter((r) => !options.includes(r)),
          ];
          return (
            <View key={section.level} style={{ marginBottom: 10 }}>
              <Text style={s.mgrSectionHead}>• {section.header}</Text>
              {options.map((opt) => (
                <View key={opt} style={s.mgrItem}>
                  <Text style={s.mgrBullet}>
                    {checked.includes(opt) ? "✓" : "  "}
                  </Text>
                  <Text style={s.mgrItemText}>{opt}</Text>
                </View>
              ))}
              {/* Custom reasons not in list */}
              {reasons
                .filter((r) => !options.includes(r))
                .map((r) => (
                  <View key={r} style={s.mgrItem}>
                    <Text style={s.mgrBullet}>✓</Text>
                    <Text style={s.mgrItemText}>{r}</Text>
                  </View>
                ))}
            </View>
          );
        })}

        {sub.mgrRemarks ? (
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
              Additional Remarks:
            </Text>
            <View style={[s.answerBox, { minHeight: 40 }]}>
              <Text>{pdfDisplayValue(sub.mgrRemarks) || " "}</Text>
            </View>
          </View>
        ) : null}

        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <Text style={s.sigLabel}>Signature Of Team Head:</Text>
            <Text style={s.sigLine}>
              {pdfDisplayValue(sub.mgrSignatureName) || " "}
            </Text>
          </View>
          <View style={s.sigBlock}>
            <Text style={s.sigLabel}>Date:</Text>
            <Text style={s.sigLine}>
              {formatDate(sub.mgrSignatureDate) || " "}
            </Text>
          </View>
        </View>
      </PdfPage>
 
      {/* ══════════════════════════════════════════════════════════════════
          PAGE — Management Worksheet & Final Conclusion
      ══════════════════════════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <OvalHeading title="Management Work Sheet and Final Conclusion" />
 
        <Text style={s.introPara}>{MANAGEMENT_LETTER_INTRO}</Text>
 
        <Text style={{ fontSize: 8.5, marginBottom: 4, fontFamily: "Helvetica-Bold" }}>
          Below are the criteria of increment with effect from FY 2026-27.
        </Text>
 
        {/* Increment slab table */}
        <View style={{ marginBottom: 12 }}>
          <View style={s.tableHead}>
            <Text style={s.tableHeadText}>CTC</Text>
            <Text style={[s.tableHeadText, { textAlign: "right" }]}>
              % OF INCREMENT
            </Text>
          </View>
          {slabs.map((slab) => {
            const max = slab.ctcMax ?? Infinity;
            const active = annualCtc >= slab.ctcMin && annualCtc <= max;
            return (
              <View
                key={slab.id}
                style={[s.tableRow, active ? s.tableRowHighlight : {}]}
              >
                <Text style={s.tableCell}>
                  {formatSlabRange(slab.ctcMin, slab.ctcMax)}
                </Text>
                <Text style={s.tableCellRight}>
                  0% to {decimalToNumber(slab.maxPct)}%
                </Text>
              </View>
            );
          })}
        </View>
 
        {/* Final increment statement */}
        <Text
          style={{
            fontSize: 9,
            fontFamily: "Helvetica-Bold",
            marginBottom: 6,
          }}
        >
          Dear Employee {sub.employeeName} — You have been obtained{" "}
          {incrementPct}% of Increment based on your report card. New monthly salary: ₹
          {newMonthlySalary.toLocaleString("en-IN")}
        </Text>
 
        <View style={[s.answerBox, { minHeight: 60, marginBottom: 16 }]}>
          <Text>
            {pdfDisplayValue(
              sub.mgmtFinalRemarks ?? sub.mgmtFeedbackToEmployee
            ) || " "}
          </Text>
        </View>
 
        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <Text style={s.sigLabel}>Signature of the Approver:</Text>
            <Text style={s.sigLine}>
              {pdfDisplayValue(sub.mgmtApproverName) || " "}
            </Text>
          </View>
          <View style={s.sigBlock}>
            <Text style={s.sigLabel}>Date:</Text>
            <Text style={s.sigLine}>
              {formatDate(sub.mgmtApprovalDate) || " "}
            </Text>
          </View>
        </View>
      </PdfPage>
    </Document>
  );
}