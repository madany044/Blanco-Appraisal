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
import { formatDate, decimalToNumber } from "@/lib/utils";
import type { SerializedIncrementSlab } from "@/lib/utils";
import {
  STRONG_REASONS,
  CONDITIONAL_REASONS,
  NOT_RECOMMENDED_REASONS,
  ABROAD_OPTIONS,
} from "@/lib/types";

// ─── Palette ────────────────────────────────────────────────────
const PRIMARY = "#1E293B";
const ACCENT = "#2563EB";
const ACCENT_LIGHT = "#EFF6FF";
const TEXT = "#1E293B";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const BG_ALT = "#F8FAFC";
const SUCCESS = "#16A34A";
const SUCCESS_BG = "#F0FDF4";
const AMBER = "#D97706";
const AMBER_BG = "#FFFBEB";
const RED_SOFT = "#DC2626";

const SP = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

const s = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    color: TEXT,
    backgroundColor: "#FFFFFF",
  },

  // ── Header & Footer ──────────────────────────────────────────────
  headerWrapper: {
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SP.xl,
    paddingVertical: SP.md,
  },
  logo: { width: 36, height: 36, objectFit: "contain", marginRight: SP.md },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#FFFFFF", letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 7.5, color: "#94A3B8", marginTop: 2, textTransform: "uppercase", letterSpacing: 1 },
  headerAccentBar: { height: 3, backgroundColor: ACCENT },

  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: BG_ALT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SP.xl,
    borderTopWidth: 1,
    borderColor: BORDER,
  },
  footerBrand: { fontSize: 7.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.6 },
  pageNumText: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: PRIMARY },

  body: { paddingHorizontal: SP.xl, paddingTop: SP.lg, flex: 1, flexDirection: "column" },

  // ── Cards & Sections ─────────────────────────────────────────────
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: PRIMARY,
    marginBottom: SP.sm,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
    paddingBottom: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    marginBottom: SP.md,
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: BG_ALT,
    paddingVertical: 6,
    paddingHorizontal: SP.sm,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
  },
  cardHeaderText: { fontSize: 11, fontFamily: "Helvetica-Bold", color: PRIMARY, flex: 1 },
  cardHeaderMarker: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: ACCENT_LIGHT,
  },

  // ── Info Grid ───────────────────────────────────────────────────
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    marginBottom: SP.md,
    overflow: "hidden",
  },
  infoCell: {
    width: "33.33%",
    padding: SP.sm,
    borderRightWidth: 1,
    borderRightColor: BORDER,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG_ALT,
  },
  infoCellFull: { width: "100%", padding: SP.sm, backgroundColor: BG_ALT },
  infoCellLastRow: { borderBottomWidth: 0 },
  infoCellLastCol: { borderRightWidth: 0 },
  infoLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 11, color: TEXT },
  infoValueHighlight: { fontSize: 11, fontFamily: "Helvetica-Bold", color: ACCENT },

  // ── Question Card ───────────────────────────────────────────────
  qCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    marginBottom: SP.md,
    overflow: "hidden",
  },
  qHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: SP.sm,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG_ALT,
  },
  qNum: { backgroundColor: ACCENT, borderRadius: 3, paddingHorizontal: 4, paddingVertical: 2, marginRight: SP.sm, flexShrink: 0 },
  qNumText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#FFFFFF" },
  qTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: PRIMARY, flex: 1, lineHeight: 1.3 },
  qBody: { padding: SP.sm },
  qBodyText: { fontSize: 9.5, color: MUTED, marginBottom: SP.xs, lineHeight: 1.4 },
  qAnswerBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    padding: SP.sm,
    minHeight: 40,
  },
  qAnswerText: { fontSize: 10.5, color: TEXT, lineHeight: 1.55 },

  // ── Checkboxes ───────────────────────────────────────────────────
  checkCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: SP.sm,
    marginBottom: 4,
    backgroundColor: "#FFFFFF",
  },
  checkCardSelected: { borderColor: SUCCESS, backgroundColor: SUCCESS_BG },
  checkDot: {
    width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: BORDER,
    marginRight: SP.sm, justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  checkDotSelected: { borderColor: ACCENT, backgroundColor: ACCENT },
  checkDotInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#FFFFFF" },
  checkCardText: { fontSize: 9, color: TEXT, flex: 1 }, // Increased from 8.5
  checkCardTextSelected: { fontSize: 9, fontFamily: "Helvetica-Bold", color: ACCENT, flex: 1 },

  // ── Tables (Fixed & Robust) ──────────────────────────────────────
  tableWrap: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    overflow: "hidden",
    // Removed flex: 1 and justifyContent to prevent gaps and page breaks
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SP.md,
    paddingVertical: 9, // Increased padding for better spacing
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowAlt: { backgroundColor: BG_ALT },
  tableRowLast: { borderBottomWidth: 0 },

  alphaWrap: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: ACCENT_LIGHT,
    alignItems: "center", justifyContent: "center", marginRight: SP.sm, flexShrink: 0,
  },
  alphaText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: ACCENT },
  tableLabel: { flex: 1, fontSize: 11, color: TEXT, paddingRight: SP.sm, lineHeight: 1.4 }, // Increased font size

  scoreBadge: {
    width: 52, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center",
    flexShrink: 0, backgroundColor: ACCENT_LIGHT,
  }, // Bigger badge
  scoreBadgeHigh: { backgroundColor: SUCCESS_BG },
  scoreBadgeMid: { backgroundColor: AMBER_BG },
  scoreText: { fontSize: 11, fontFamily: "Helvetica-Bold", color: ACCENT }, // Increased font size
  scoreTextHigh: { color: SUCCESS },
  scoreTextMid: { color: AMBER },
  scoreDenom: { fontSize: 7, color: MUTED }, // Increased font size

  // Manager's own rating on the same self-rating item, shown in red beside
  // the employee's score.
  mgrScoreBadge: {
    width: 52, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center",
    flexShrink: 0, backgroundColor: "#fbe4e4", marginLeft: 6,
  },
  mgrScoreText: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#a83232" },
  mgrScoreDenom: { fontSize: 7, color: "#a83232" },

  // ── 2-column checkbox grid ─────────────────────────────────────
  checkGrid2Col: { flexDirection: "row", flexWrap: "wrap", padding: SP.xs },
  checkCard2Col: { flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingHorizontal: 4, marginBottom: 4, width: "50%" },

  // ── Increment Table ────────────────────────────────────────────
  incTableHead: { flexDirection: "row", backgroundColor: PRIMARY, paddingVertical: 4, paddingHorizontal: SP.sm },
  incTableHeadText: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 0.5 },
  incTableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER, paddingVertical: 3.5, paddingHorizontal: SP.sm },
  incTableRowAlt: { backgroundColor: BG_ALT },
  incTableRowActive: { backgroundColor: "#FFF176", borderLeftWidth: 3, borderLeftColor: "#F59E0B" },
  incTableCell: { width: "60%", fontSize: 9.5, color: TEXT },
  incTableCellRight: { width: "40%", fontSize: 9.5, fontFamily: "Helvetica-Bold", color: ACCENT, textAlign: "right" },
  // ── Signature Block ──────────────────────────────────────────────
  sigCard: { borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: "hidden", marginTop: SP.lg },
  sigHeader: { backgroundColor: PRIMARY, paddingVertical: 4, paddingHorizontal: SP.sm },
  sigHeaderText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 0.5 },
  sigBody: { flexDirection: "row", padding: SP.md, gap: SP.xl },
  sigField: { flex: 1 },
  sigLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: MUTED, textTransform: "uppercase", marginBottom: 4 },
  sigValue: {
    fontSize: 10, fontFamily: "Helvetica-Bold", color: PRIMARY,
    borderBottomWidth: 1, borderBottomColor: PRIMARY, paddingBottom: 4, minHeight: 20,
  },

  // ── Management Letter ─────────────────────────────────────────────
  letterBody: { fontSize: 10.5, lineHeight: 1.6, color: TEXT, marginBottom: SP.sm, textAlign: "justify" },
  letterHighlight: { fontFamily: "Helvetica-Bold", color: ACCENT },
  letterSectionLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: PRIMARY, marginBottom: SP.sm },
  highlightStatementYellow: {
    backgroundColor: "#FEF08A", // Brighter, vivid yellow background
    borderLeftWidth: 3,
    borderLeftColor: AMBER,
    padding: SP.sm,
    marginBottom: SP.sm,
    borderRadius: 3,
  },
  highlightStatementYellowText: {
    fontSize: 10,
    color: "#1E293B", // Pure black for sharp contrast against bright yellow
    lineHeight: 1.55,
    fontFamily: "Helvetica-Bold", // Use standard bold font for React-PDF
    fontWeight: "bold", // Keep for standard React Native web/mobile
  },

  // ── Misc ─────────────────────────────────────────────────────────
  subLabel: {
    fontSize: 9, fontFamily: "Helvetica-Bold", color: ACCENT, textTransform: "uppercase",
    letterSpacing: 0.8, marginBottom: SP.xs, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  naChip: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: RED_SOFT, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, marginLeft: SP.sm },
  naChipText: { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: RED_SOFT, textTransform: "uppercase" },
});

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

function PageHeader({ logoSrc }: { logoSrc?: string }) {
  return (
    <View fixed>
      <View style={s.headerWrapper}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {logoSrc ? <Image src={logoSrc} style={s.logo} /> : null}
        <View style={s.headerTextWrap}>
          <Text style={s.headerTitle}>Team Blanco AND Team Blanka</Text>
          <Text style={s.headerSubtitle}>Employee Progress Report Card for Salary Appraisal</Text>
        </View>
      </View>
      <View style={s.headerAccentBar} />
    </View>
  );
}

function PageFooter({ num }: { num: number }) {
  return (
    <View style={s.footerBar} fixed>
      <Text style={s.footerBrand}>Salary Appraisal Report</Text>
      <Text style={s.pageNumText}>PAGE {num}</Text>
    </View>
  );
}

function PdfPage({ num, logoSrc, children }: { num: number; logoSrc?: string; children: ReactNode }) {
  return (
    <Page size="A4" style={s.page}>
      <PageHeader logoSrc={logoSrc} />
      <View style={s.body}>{children}</View>
      <PageFooter num={num} />
    </Page>
  );
}

function InfoCell({ label, value, full, lastRow, lastCol, highlight }: {
  label: string; value: string; full?: boolean; lastRow?: boolean; lastCol?: boolean; highlight?: boolean;
}) {
  return (
    <View style={[
      full ? s.infoCellFull : s.infoCell,
      lastRow ? s.infoCellLastRow : {},
      lastCol ? s.infoCellLastCol : {}
    ]}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={highlight ? s.infoValueHighlight : s.infoValue}>{value || "—"}</Text>
    </View>
  );
}

function QCard({ num, heading, body, answer, minHeight = 40 }: {
  num?: string | number; heading: string; body?: string; answer: string; minHeight?: number;
}) {
  return (
    <View style={s.qCard} wrap={false}>
      <View style={s.qHeader}>
        {num != null ? (
          <View style={s.qNum}><Text style={s.qNumText}>{num}</Text></View>
        ) : null}
        <Text style={s.qTitle}>{heading}</Text>
      </View>
      <View style={s.qBody}>
        {body ? <Text style={s.qBodyText}>{body}</Text> : null}
        <View style={[s.qAnswerBox, { minHeight }]}>
          <Text style={s.qAnswerText}>{answer || " "}</Text>
        </View>
      </View>
    </View>
  );
}

function CheckCard({ checked, label, gridStyle }: { checked: boolean; label: string; gridStyle?: boolean }) {
  return (
    <View style={[gridStyle ? s.checkCard2Col : s.checkCard, checked ? s.checkCardSelected : {}]} wrap={false}>
      <View style={[s.checkDot, checked ? s.checkDotSelected : {}]}>
        {checked ? <View style={s.checkDotInner} /> : null}
      </View>
      <Text style={checked ? s.checkCardTextSelected : s.checkCardText}>{label}</Text>
    </View>
  );
}

function RatingTableRow({ alpha, label, score, mgrScore, index, isLast }: {
  alpha: string; label: string; score: number | null; mgrScore?: number | null; index: number; isLast?: boolean;
}) {
  const isAlt = index % 2 === 1;
  const isHigh = score != null && score >= 8;
  const isMid = score != null && score >= 5 && score < 8;
  const display = score != null ? `${score}` : "—";
  return (
    <View style={[s.tableRow, { paddingVertical: 12 }, isAlt ? s.tableRowAlt : {}, isLast ? s.tableRowLast : {}]} wrap={false}>
      <View style={s.alphaWrap}>
        <Text style={s.alphaText}>{alpha}</Text>
      </View>
      <Text style={s.tableLabel}>{label}</Text>
      <View style={[s.scoreBadge, isHigh ? s.scoreBadgeHigh : isMid ? s.scoreBadgeMid : {}]}>
        <Text style={[s.scoreText, isHigh ? s.scoreTextHigh : isMid ? s.scoreTextMid : {}]}>{display}</Text>
        <Text style={s.scoreDenom}>/10</Text>
      </View>
      {mgrScore != null && (
        <View style={s.mgrScoreBadge}>
          <Text style={s.mgrScoreText}>{mgrScore}</Text>
          <Text style={s.mgrScoreDenom}>/10</Text>
        </View>
      )}
    </View>
  );
}

function RatingTableHeader() {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", paddingHorizontal: SP.sm, paddingVertical: 5,
      backgroundColor: BG_ALT, borderBottomWidth: 1, borderBottomColor: BORDER,
    }}>
      <View style={{ flex: 1 }} />
      <Text style={{ width: 52, textAlign: "center", fontSize: 7.5, fontFamily: "Helvetica-Bold", color: MUTED, textTransform: "uppercase" }}>
        Employee
      </Text>
      <Text style={{ width: 52, textAlign: "center", fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#a83232", textTransform: "uppercase", marginLeft: 6 }}>
        Manager
      </Text>
    </View>
  );
}

function ProdTableRow({ label, value, index, isLast }: { label: string; value: string; index: number; isLast?: boolean }) {
  const isAlt = index % 2 === 1;
  const isNA = !value || value === "—";
  return (
    <View style={[s.tableRow, isAlt ? s.tableRowAlt : {}, isLast ? s.tableRowLast : {}]} wrap={false}>
      <Text style={s.tableLabel}>{label}</Text>
      <Text style={isNA ? { fontSize: 9, color: MUTED, fontFamily: "Helvetica" } : s.scoreText}>
        {value || "—"}
      </Text>
    </View>
  );
}

function HrTableRow({ label, score, notes, index, isLast }: {
  label: string; score: number | null; notes?: string | null; index: number; isLast?: boolean;
}) {
  const isAlt = index % 2 === 1;
  const isHigh = score != null && score >= 8;
  const isMid = score != null && score >= 5 && score < 8;
  const display = score != null ? `${score}` : "—";
  return (
    <View style={[s.tableRow, isAlt ? s.tableRowAlt : {}, isLast ? s.tableRowLast : {}]} wrap={false}>
      <View style={{ flex: 1, paddingRight: SP.sm }}>
        <Text style={{ fontSize: 9, color: TEXT, lineHeight: 1.4 }}>{label}</Text>
        {notes ? <Text style={{ fontSize: 8, color: MUTED, marginTop: 2 }}>{notes}</Text> : null}
      </View>
      <View style={[s.scoreBadge, isHigh ? s.scoreBadgeHigh : isMid ? s.scoreBadgeMid : {}]}>
        <Text style={[s.scoreText, isHigh ? s.scoreTextHigh : isMid ? s.scoreTextMid : {}]}>{display}</Text>
        <Text style={s.scoreDenom}>/10</Text>
      </View>
    </View>
  );
}

function SignatureBlock({ title, fields }: {
  title: string; fields: { label: string; value: string }[];
}) {
  return (
    <View style={s.sigCard} wrap={false}>
      <View style={s.sigHeader}>
        <Text style={s.sigHeaderText}>{title}</Text>
      </View>
      <View style={s.sigBody}>
        {fields.map((f) => (
          <View key={f.label} style={s.sigField}>
            <Text style={s.sigLabel}>{f.label}</Text>
            <Text style={s.sigValue}>{f.value || " "}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function formatSlabRange(min: number, max: number | null): string {
  if (max == null) return `${min.toLocaleString("en-IN")} and above`;
  if (min === 0) return `Less than ${(max + 1).toLocaleString("en-IN")}`;
  return `${min.toLocaleString("en-IN")} – ${max.toLocaleString("en-IN")}`;
}

// ────────────────────────────────────────────────────────────────
// Main export
// ────────────────────────────────────────────────────────────────

interface PDFReportProps {
  submission: AppraisalSubmission;
  slabs?: SerializedIncrementSlab[];
  logoSrc?: string;
}

export function PDFReport({ submission: sub, slabs = [], logoSrc }: PDFReportProps) {
  const isQC = sub.category === "QC";
  const statementPct = decimalToNumber(sub.mgmtStatementPercentage);
  const approvedPct = decimalToNumber(sub.mgmtIncrementPercentage);
  const selectedOverall = normalizeOverallRating(sub.overallRating);

  const mgrReasonOptions: Record<string, readonly string[]> = {
    mgrStrongReasons: STRONG_REASONS,
    mgrConditionalReasons: CONDITIONAL_REASONS,
    mgrNotRecommendedReasons: NOT_RECOMMENDED_REASONS,
  };

  let p = 0;
  const nextPage = () => ++p;
  const alphas = "abcdefghijklmnopqrst".split("");

  const selfRatingFirst = SELF_RATING_ITEMS.slice(0, 10);
  const selfRatingSecond = SELF_RATING_ITEMS.slice(10);

  const logoPath = logoSrc ?? "/images/logooooo.jpg";

  const currentMonthlySalary = sub.currentSalary ?? 0;
  const sortedSlabs = [...slabs].sort((a, b) => a.ctcMin - b.ctcMin);
  const matchedSlab = sortedSlabs.find((slab) => {
    const max = slab.ctcMax ?? Infinity;
    return currentMonthlySalary >= slab.ctcMin && currentMonthlySalary <= max;
  }) ?? sortedSlabs[sortedSlabs.length - 1];

  const showAbroadQuestion = sub.category === "GROUP_A" && !isQC;

  return (
    <Document>

      {/* PAGE 1 */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <Text style={s.sectionTitle}>Employee Information</Text>
        <View style={s.infoGrid}>
          <InfoCell label="Employee Name" value={pdfDisplayValue(sub.employeeName)} highlight />
          <InfoCell label="Employee ID" value={pdfDisplayValue(sub.employeeCode)} />
          <InfoCell label="Date of Submission" value={formatDate(sub.dateOfSubmission) || "—"} lastCol />
          <InfoCell label="Team" value={pdfDisplayValue(sub.team)} lastRow />
          <InfoCell label="Designation" value={pdfDisplayValue(sub.designation)} lastRow />
          <InfoCell label="Experience (Years)" value={`${pdfDisplayValue(sub.prevExperienceYears)} Prev / ${pdfDisplayValue(sub.companyExperienceYears)} At Blanco`} lastRow lastCol />
        </View>

        <QCard num="1" heading="Basis of Appraisal Request" body="Please describe on what basis we should consider your Salary appraisal request:" answer={pdfDisplayValue(sub.basisOfAppraisal)} minHeight={110} />
        <QCard num="2" heading="Support to the Company" body="Please describe how would you support the company to grow and generate more income as similar as your salary appraisal:" answer={pdfDisplayValue(sub.supportToCompany)} minHeight={110} />
      </PdfPage>

      {/* PAGE 2 */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <QCard num="3" heading="Expectations" body='Do you think you can expect same amount of appraisal from year to year as your salary grows? (Tell us "YES" OR "NO" and describe the reason accordingly)' answer={formatExpectationsAnswer(sub) || " "} minHeight={140} />
        <QCard num="4" heading="Improvement in Yourself" body="Please describe your strengths & weaknesses and describe what improvement in yourself compared to the previous year:" answer={pdfDisplayValue(sub.strengthsWeaknesses)} minHeight={140} />
        <QCard num="5" heading="Provide examples of instances where you demonstrated strong teamwork" answer={pdfDisplayValue(sub.teamworkExamples)} minHeight={140} />
      </PdfPage>

      {/* PAGE 3 */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <Text style={s.sectionTitle}>6. Achievements, Goal & Opportunities</Text>
        <QCard heading="a. Challenges faced in achieving goals and how did you overcome them?" answer={pdfDisplayValue(sub.goalChallenges) || " "} minHeight={70} />
        <QCard heading="b. Goal for this upcoming year and explain how that will be beneficial to both of us?" answer={pdfDisplayValue(sub.upcomingGoal) || " "} minHeight={70} />
        <QCard heading="c. What are the 3 things you would like to improve?" answer={pdfDisplayValue(sub.threeImprovements) || " "} minHeight={70} />

        <View style={s.qCard} wrap={false}>
          <View style={s.qHeader}><Text style={s.qTitle}>d. Did you demonstrate initiative and contribute innovative ideas to improve processes or solve problems?</Text></View>
          <View style={s.checkGrid2Col}>
            {INITIATIVE_FREQUENCY_OPTIONS.map((opt) => (<CheckCard key={opt} checked={sub.initiativeFrequency === opt} label={opt} gridStyle />))}
          </View>
        </View>

        {showAbroadQuestion && (
          <View style={s.qCard} wrap={false}>
            <View style={s.qHeader}>
              <Text style={s.qTitle}>e. Do you have capability of managing yourself if company gives opportunity to work in abroad:</Text>
              {sub.abroadCapabilityNa ? <View style={s.naChip}><Text style={s.naChipText}>N/A</Text></View> : null}
            </View>
            {!sub.abroadCapabilityNa && (
              <View style={s.checkGrid2Col}>
                {ABROAD_OPTIONS.map((opt) => (<CheckCard key={opt} checked={sub.abroadCapability === opt} label={opt} gridStyle />))}
              </View>
            )}
          </View>
        )}
      </PdfPage>

      {/* PAGE 4 */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <QCard num="7" heading="Provide examples of instances where you showed initiative or innovation." answer={pdfDisplayValue(sub.initiativeInnovation)} minHeight={150} />
        <View style={s.qCard} wrap={false}>
          <View style={s.qHeader}>
            <View style={s.qNum}><Text style={s.qNumText}>8</Text></View>
            <Text style={s.qTitle}>Reflect on your commitment to professional development and continuous learning.</Text>
          </View>
          <View style={s.qBody}>
            {LEARNING_COMMITMENT_OPTIONS.map((o) => (<CheckCard key={o.value} checked={sub.learningCommitment === o.value} label={o.label} />))}
          </View>
        </View>
        <QCard num="9" heading="Professionalism and Attitude" body="Please describe your professionalism and attitude with your team during office premises (including perspective vision on your career along with your team)." answer={pdfDisplayValue(sub.professionalismAttitude)} minHeight={130} />
      </PdfPage>

      {/* PAGE 5 */}
      {/* PAGE 5 */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <Text style={s.sectionTitle}>Self Performance Ratings (a - j)</Text>
        <Text style={{ fontSize: 8, color: MUTED, marginBottom: SP.xs }}>Blue = Employee&apos;s self-rating · Red = Manager&apos;s rating</Text>
        <View style={{ borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: "hidden" }}>
          <RatingTableHeader />
          {selfRatingFirst.map((item, i) => {
            const score = sub[item.key as keyof AppraisalSubmission] as number | null;
            const mgrScore = sub[item.mgrKey as keyof AppraisalSubmission] as number | null;
            const rawLabel = selfRatingLabel(item);
            const cleanLabel = rawLabel.replace(/^[a-t]\.\s*/i, "");
            return <RatingTableRow key={item.key} alpha={alphas[i]} label={cleanLabel} score={score} mgrScore={mgrScore} index={i} isLast={i === selfRatingFirst.length - 1} />;
          })}
        </View>
      </PdfPage>

      {/* PAGE 6 */}
      {(isQC || sub.category === "GROUP_A") && (
        <PdfPage num={nextPage()} logoSrc={logoPath}>
          <Text style={s.sectionTitle}>Self Performance Ratings (k - t)</Text>
          <Text style={{ fontSize: 8, color: MUTED, marginBottom: SP.xs }}>Blue = Employee&apos;s self-rating · Red = Manager&apos;s rating</Text>
          <View style={s.tableWrap}>
            {selfRatingSecond.map((item, i) => {
              const globalIndex = i + 10;
              const score = sub[item.key as keyof AppraisalSubmission] as number | null;
              const mgrScore = sub[item.mgrKey as keyof AppraisalSubmission] as number | null;
              const rawLabel = selfRatingLabel(item);
              const cleanLabel = rawLabel.replace(/^[a-t]\.\s*/i, "");
              return <RatingTableRow key={item.key} alpha={alphas[globalIndex]} label={cleanLabel} score={score} mgrScore={mgrScore} index={i} isLast={i === selfRatingSecond.length - 1} />;
            })}
          </View>
        </PdfPage>
      )}

      {/* PAGE 7 - Productivity */}
      {!isQC && (
        <PdfPage num={nextPage()} logoSrc={logoPath}>
          <Text style={s.sectionTitle}>10. Productivity and Time Management</Text>
          <Text style={{ fontSize: 9, color: MUTED, marginBottom: SP.sm }}>{PRODUCTIVITY_INTRO}</Text>

          <Text style={s.subLabel}>Shop Drafting and Checker</Text>
          <View style={{ borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: "hidden" }}>
            {SHOP_DRAFTING_ITEMS.map((item, i) => (
              <ProdTableRow key={item.key} label={item.label} value={pdfDisplayValue(getSubmissionField(sub, item.key as keyof AppraisalSubmission)) || "—"} index={i} isLast={i === SHOP_DRAFTING_ITEMS.length - 1} />
            ))}
          </View>

          <Text style={{ ...s.subLabel, marginTop: SP.md }}>E-Drafting</Text>
          <View style={{ borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: "hidden" }}>
            {E_DRAFTING_ITEMS.map((item, i) => (
              <ProdTableRow key={item.key} label={item.label} value={pdfDisplayValue(getSubmissionField(sub, item.key as keyof AppraisalSubmission)) || "—"} index={i} isLast={i === E_DRAFTING_ITEMS.length - 1} />
            ))}
          </View>
        </PdfPage>
      )}

      {/* PAGE 8 - Modeler */}
      {!isQC && sub.category !== "GROUP_C" && (
        <PdfPage num={nextPage()} logoSrc={logoPath}>
          <Text style={s.sectionTitle}>Modeler Productivity</Text>
          <View style={{ borderWidth: 1, borderColor: BORDER, borderRadius: 6, overflow: "hidden" }}>
            {MODELER_ITEMS.map((item, i) => (
              <ProdTableRow key={item.key} label={item.label} value={pdfDisplayValue(getSubmissionField(sub, item.key as keyof AppraisalSubmission)) || "—"} index={i} isLast={i === MODELER_ITEMS.length - 1} />
            ))}
          </View>
        </PdfPage>
      )}

      {/* PAGE 9 - Q11, Q12, Overall */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <QCard num="11" heading="Work Performance and Time Management" body="Please describe your current year work performance and Time Management" answer={pdfDisplayValue(sub.currentYearPerformance)} minHeight={90} />
        <QCard num="12" heading="Please describe how you would perform and improve your productivity for this upcoming performance cycle as similar as your salary grow:" answer={pdfDisplayValue(sub.productivityImprovement)} minHeight={90} />

        <View style={s.qCard} wrap={false}>
          <View style={s.qHeader}>
            <View style={s.qNum}><Text style={s.qNumText}>13</Text></View>
            <Text style={s.qTitle}>Rate Yourself — Overall Performance</Text>
          </View>
          <View style={s.qBody}>
            {OVERALL_RATING_OPTIONS.map((opt) => (<CheckCard key={opt} checked={selectedOverall === opt} label={opt} />))}
          </View>
        </View>

        <View style={{ flex: 1 }} />
        <SignatureBlock title="Employee Declaration" fields={[
          { label: "Form Filled And Signed By", value: pdfDisplayValue(sub.employeeSignatureName) },
          { label: "Employee Code", value: pdfDisplayValue(sub.employeeCode) },
          { label: "Date", value: formatDate(sub.employeeSignatureDate) || formatDate(sub.dateOfSubmission) || " " },
        ]} />
      </PdfPage>

      {/* PAGE 10 - HR (Strict 1 Page) */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <Text style={s.sectionTitle}>HR & Admin Feedback</Text>
        {/* Added marginBottom to create a small gap */}
        <View style={[s.tableWrap, { marginBottom: SP.md }]}>
          {HR_RATING_ITEMS.map((item, i) => {
            const val = sub[item.key as keyof AppraisalSubmission] as number | null;
            const notes = item.key === "hrLeaveManagement" ? sub.hrLeaveManagementNotes : item.key === "hrTimingManagement" ? sub.hrTimingManagementNotes : null;
            return <HrTableRow key={item.key} label={item.label} score={val} notes={notes} index={i} isLast={i === HR_RATING_ITEMS.length - 1} />;
          })}
        </View>

        <View style={s.qCard} wrap={false}>
          <View style={s.qHeader}>
            <View style={s.qNum}><Text style={s.qNumText}>1</Text></View>
            <Text style={s.qTitle}>Backlog & Conduct Remarks</Text>
          </View>
          <View style={s.qBody}>
            <Text style={s.qBodyText}>{HR_BACKLOG_QUESTION}</Text>
            <View
              style={[
                s.qAnswerBox,
                { minHeight: 50 },
                sub.hrBacklogNotes ? { backgroundColor: "#ffb3b3", borderColor: "#a83232", borderWidth: 1 } : {},
              ]}
            >
              <Text style={[s.qAnswerText, sub.hrBacklogNotes ? { color: "#7a1f1f", fontFamily: "Helvetica-Bold" } : {}]}>
                {pdfDisplayValue(sub.hrBacklogNotes) || " "}
              </Text>
            </View>
          </View>
        </View>

        <SignatureBlock title="Authorized by HR & Admin" fields={[
          { label: "Rating & Feedback Given By", value: pdfDisplayValue(sub.hrAdminSignatureName) },
          { label: "Date", value: formatDate(sub.hrAdminSignatureDate) || " " },
        ]} />
      </PdfPage>

      {/* PAGE 11 - Team Lead (Strict 1 Page) */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <Text style={s.sectionTitle}>Team Head Feedback</Text>

        {MGR_RECOMMENDATION_SECTIONS.map((section) => {
          const reasons = (sub[section.field as keyof AppraisalSubmission] as string[]) ?? [];
          const options = mgrReasonOptions[section.field];
          return (
            <View key={section.level} style={[s.card, { marginBottom: SP.sm }]} wrap={false}>
              {/* Tightened header padding */}
              <View style={[s.cardHeader, { paddingVertical: 4 }]}>
                <Text style={s.cardHeaderText}>
                  {section.header.split("[√]")[0]}
                  <Text style={s.cardHeaderMarker}>[</Text>
                  <Text style={[s.cardHeaderMarker, { fontFamily: "Helvetica-Bold", fontSize: 12.5 }]}>o</Text>
                  <Text style={s.cardHeaderMarker}>]</Text>
                  {section.header.split("[√]")[1]}
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", paddingVertical: SP.xs, paddingHorizontal: SP.sm }}>
                {options.filter((opt) => reasons.includes(opt)).map((opt) => (
                  <View key={opt} style={{
                    width: "50%",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 3, // Tightened row padding
                    paddingRight: SP.sm,
                  }}>
                    <View style={[s.checkDot, s.checkDotSelected, { marginRight: 6 }]}>
                      <View style={s.checkDotInner} />
                    </View>
                    <Text style={s.checkCardTextSelected}>{opt}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {sub.mgrFeedback ? (
          <View style={{
            borderWidth: 1,
            borderColor: "#a83232",
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: SP.sm,
          }} wrap={false}>
            <View style={{
              backgroundColor: BG_ALT,
              borderBottomWidth: 1,
              borderBottomColor: "#a83232",
              paddingVertical: 4,
              paddingHorizontal: SP.sm,
            }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#7a1f1f", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Manager Feedback
              </Text>
            </View>
            <View style={{ backgroundColor: "#ffb3b3", padding: SP.sm }}>
              <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", color: "#7a1f1f", lineHeight: 1.4 }}>
                {sub.mgrFeedback}
              </Text>
            </View>
          </View>
        ) : null}

        <SignatureBlock title="Reviewed & Approved by Reporting Manager" fields={[
          { label: "Reporting Manager", value: pdfDisplayValue(sub.mgrSignatureName) },
          { label: "Date", value: formatDate(sub.mgrSignatureDate) || " " },
        ]} />
      </PdfPage>

      {/* PAGE 12 - Management (Strict 1 Page) */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <Text style={s.sectionTitle}>Management Worksheet & Final Conclusion</Text>

        <Text style={s.letterBody}>Dear <Text style={[s.letterHighlight, { fontSize: 11 }]}>{sub.employeeName}</Text>,</Text>
        <Text style={s.letterBody}>{MANAGEMENT_LETTER_INTRO}</Text>

        <Text style={s.letterSectionLabel}>Below are the criteria of increment with effect from FY 2026–27.</Text>

        <View style={{ borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: "hidden", marginBottom: SP.md }}>
          <View style={s.incTableHead}>
            <Text style={s.incTableHeadText}>CTC Range (Monthly)</Text>
            <Text style={s.incTableHeadText}>% of Increment</Text>
          </View>
          {sortedSlabs.map((slab, i) => {
            const isActive = matchedSlab?.id === slab.id;
            const isAlt = i % 2 === 1;
            return (
              <View key={slab.id} style={[s.incTableRow, isAlt ? s.incTableRowAlt : {}, isActive ? s.incTableRowActive : {}]}>
                <Text style={s.incTableCell}>{formatSlabRange(slab.ctcMin, slab.ctcMax)}</Text>
                <Text style={s.incTableCellRight}>0% to {decimalToNumber(slab.maxPct)}%</Text>
              </View>
            );
          })}
        </View>

        <Text style={s.letterBody}>You have obtained <Text style={s.letterHighlight}>{statementPct}%</Text> of Increment based on your report card v/s the maximum increment criteria of <Text style={s.letterHighlight}>{matchedSlab ? `0-${decimalToNumber(matchedSlab.maxPct)}%` : "—"}</Text>.</Text>
        <Text style={s.letterBody}>However, the company would like to support you as best as possible by considering that you will upgrade yourself with any and all backlogs as described by yourself in the attached report card.</Text>
        <Text style={s.letterBody}>Therefore, the company is pleased to offer you the best of <Text style={[s.letterHighlight, { fontSize: 11 }]}>{approvedPct}% </Text>Increment of your current Total CTC.</Text>

        {pdfDisplayValue(sub.mgmtFeedbackToEmployee ?? sub.mgmtFinalRemarks) ? (
          <View style={s.highlightStatementYellow}>
            <Text style={s.highlightStatementYellowText}>{pdfDisplayValue(sub.mgmtFeedbackToEmployee ?? sub.mgmtFinalRemarks)}</Text>
          </View>
        ) : null}

        <Text style={s.letterBody}>We wish you all the success in your career and hope you deliver your best performance in the upcoming performance cycle.</Text>

        <Text style={[s.letterBody, { fontWeight: 'bold' }]}>** Your compensation is subject to change at any time based on your performance and/or HR/PM decisions.</Text>
        <View style={{ flex: 1 }} />

        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: SP.md }}>
          <View style={{ width: "60%" }}>
            <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: SP.sm, textAlign: "center" }}>Final Approver Signature</Text>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: PRIMARY, textAlign: "center", borderBottomWidth: 1, borderBottomColor: PRIMARY, paddingBottom: SP.sm, marginBottom: SP.xs }}>{pdfDisplayValue(sub.mgmtApproverName) || " "}</Text>
            <Text style={{ fontSize: 8, color: MUTED, textAlign: "center" }}>Date: {formatDate(sub.mgmtApprovalDate) || " "}</Text>
          </View>
        </View>
      </PdfPage>

    </Document>
  );
}