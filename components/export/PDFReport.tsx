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
const BLUE        = "#1a4f8a";
const BLUE_DARK   = "#0f3060";
const BLUE_LIGHT  = "#e8f0fb";
const TEAL        = "#2a7a8c";
const TEAL_LIGHT  = "#eef6f8";
const INK         = "#1e2740";
const SLATE       = "#4a5568";
const WHITE       = "#ffffff";
const LIGHT_GRAY  = "#f7f9fc";
const MID_GRAY    = "#edf0f5";
const BORDER_GRAY = "#c8d4e3";
const TICK_GREEN  = "#1a8c5a";
const TICK_BG     = "#e8f7ef";
const AMBER       = "#d97706";
const AMBER_LIGHT = "#fef3c7";
const RED_SOFT    = "#c0392b";

const SP = { xs: 3, sm: 6, md: 10, lg: 14, xl: 20, xxl: 28 };

const s = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 32,
    paddingHorizontal: 0,
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
    color: INK,
    backgroundColor: WHITE,
  },

  // ── Header ──────────────────────────────────────────────────────
  headerWrapper: {
    backgroundColor: BLUE_DARK,
    paddingTop: SP.sm,
    paddingBottom: SP.sm,
    paddingHorizontal: SP.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAccentBar: {
    height: 3,
    backgroundColor: TEAL,
  },
  logo: { width: 44, height: 32, objectFit: "contain", marginRight: SP.md },
  headerCenter: { alignItems: "center" },
  headerTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    textAlign: "center",
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: TEAL_LIGHT,
    textAlign: "center",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // ── Footer ──────────────────────────────────────────────────────
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: BLUE_DARK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SP.lg,
  },
  footerBrand: {
    fontSize: 7,
    fontFamily: "Helvetica",
    color: TEAL_LIGHT,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  pageNumBadge: {
    backgroundColor: TEAL,
    paddingVertical: 2,
    paddingHorizontal: SP.sm,
    borderRadius: 3,
  },
  pageNumText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    letterSpacing: 0.4,
  },

  body: {
    paddingHorizontal: SP.xxl,
    paddingTop: SP.md,
    flex: 1,
  },

  // ── Info grid ───────────────────────────────────────────────────
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: SP.md,
  },
  infoCell: {
    width: "50%",
    padding: SP.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
    borderRightWidth: 0.5,
    borderRightColor: BORDER_GRAY,
  },
  infoCellFull: {
    width: "100%",
    padding: SP.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  infoCellLast: { borderBottomWidth: 0 },
  infoLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: SLATE,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: INK,
  },
  infoValueHighlight: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },

  // ── Question card ────────────────────────────────────────────────
  qCard: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: SP.md,
  },
  qCardHeader: {
    backgroundColor: BLUE_LIGHT,
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GRAY,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  qCardNumBadge: {
    backgroundColor: BLUE,
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SP.sm,
    flexShrink: 0,
    marginTop: 1,
  },
  qCardNumText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  qCardTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    flex: 1,
  },
  qCardBody: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: SLATE,
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
    backgroundColor: WHITE,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  qCardAnswer: {
    padding: SP.md,
    backgroundColor: LIGHT_GRAY,
    minHeight: 52,
  },
  qCardAnswerText: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: INK,
    lineHeight: 1.55,
  },

  // ── Checkbox cards ───────────────────────────────────────────────
  checkCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    borderRadius: 3,
    paddingVertical: SP.xs + 1,
    paddingHorizontal: SP.sm,
    marginBottom: SP.xs,
    backgroundColor: WHITE,
  },
  checkCardSelected: {
    borderColor: TICK_GREEN,
    backgroundColor: TICK_BG,
  },
  checkDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: BORDER_GRAY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SP.sm,
    flexShrink: 0,
  },
  checkDotSelected: {
    borderColor: TICK_GREEN,
    backgroundColor: TICK_GREEN,
  },
  checkDotInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: WHITE,
  },
  checkCardText: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: INK,
    flex: 1,
  },
  checkCardTextSelected: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: TICK_GREEN,
    flex: 1,
  },

  // ── 2-column checkbox grid (for manager section) ─────────────────
  checkGrid2Col: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  checkCard2Col: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    borderRadius: 3,
    paddingVertical: SP.xs,
    paddingHorizontal: SP.sm,
    marginBottom: SP.xs,
    marginRight: SP.xs,
    backgroundColor: WHITE,
    width: "49%",
  },
  checkCard2ColSelected: {
    borderColor: TICK_GREEN,
    backgroundColor: TICK_BG,
  },

  // ── Self rating table ────────────────────────────────────────────
  ratingTable: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: SP.sm,
  },
  ratingTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SP.xs + 1,
    paddingHorizontal: SP.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  ratingTableRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  ratingTableAlpha: {
    width: 18,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: SLATE,
    flexShrink: 0,
  },
  ratingTableLabel: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica",
    paddingRight: SP.sm,
  },
  ratingScoreBadge: {
    width: 42,
    height: 26,
    backgroundColor: BLUE_LIGHT,
    borderWidth: 1,
    borderColor: BLUE,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ratingScoreBadgeHigh: {
    backgroundColor: TICK_BG,
    borderColor: TICK_GREEN,
  },
  ratingScoreBadgeMid: {
    backgroundColor: AMBER_LIGHT,
    borderColor: AMBER,
  },
  ratingScoreText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },
  ratingScoreTextHigh: { color: TICK_GREEN },
  ratingScoreTextMid: { color: AMBER },
  ratingScoreDenom: {
    fontSize: 6,
    fontFamily: "Helvetica",
    color: SLATE,
  },

  // ── Productivity ─────────────────────────────────────────────────
  prodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SP.xs + 1,
    paddingHorizontal: SP.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  prodRowAlt: { backgroundColor: LIGHT_GRAY },
  prodTable: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: SP.md,
  },
  prodLabel: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica",
    paddingRight: SP.sm,
  },
  prodValue: {
    width: 80,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textAlign: "right",
    flexShrink: 0,
  },
  prodValueNA: {
    width: 80,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: SLATE,
    textAlign: "right",
    flexShrink: 0,
    fontStyle: "italic",
  },

  // ── HR rating ────────────────────────────────────────────────────
  hrTable: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: SP.md,
  },
  hrRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
    minHeight: 32,
  },
  hrRowAlt: { backgroundColor: LIGHT_GRAY },
  hrLabel: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica",
    paddingRight: SP.sm,
  },
  hrNotes: {
    fontSize: 7,
    fontFamily: "Helvetica",
    color: SLATE,
    marginTop: 2,
  },
  hrScoreBadge: {
    width: 44,
    height: 28,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  hrScoreText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  hrScoreDenom: {
    fontSize: 6,
    fontFamily: "Helvetica",
    color: WHITE,
    opacity: 0.85,
  },

  // ── Manager section ──────────────────────────────────────────────
  mgrSectionCard: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: SP.sm,
  },
  mgrSectionHeader: {
    backgroundColor: INK,
    paddingVertical: SP.xs + 1,
    paddingHorizontal: SP.md,
  },
  mgrSectionHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },

  // ── Increment table (compact) ────────────────────────────────────
  tableHead: {
    flexDirection: "row",
    backgroundColor: BLUE_DARK,
    paddingVertical: SP.xs,
    paddingHorizontal: SP.sm,
  },
  tableHeadText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
    paddingVertical: SP.xs,
    paddingHorizontal: SP.sm,
  },
  tableRowAlt: { backgroundColor: LIGHT_GRAY },
  tableRowHighlight: {
    backgroundColor: BLUE_LIGHT,
    borderLeftWidth: 2,
    borderLeftColor: BLUE,
  },
  tableCell: { flex: 1, fontSize: 7.5 },
  tableCellRight: { flex: 1, fontSize: 7.5, textAlign: "right", fontFamily: "Helvetica-Bold" },
  tableActiveBadge: {
    backgroundColor: BLUE,
    borderRadius: 2,
    paddingHorizontal: 3,
    paddingVertical: 1,
    marginLeft: 3,
    alignSelf: "center",
  },
  tableActiveBadgeText: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },

  // ── Signature block ──────────────────────────────────────────────
  sigContainer: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginTop: SP.sm,
  },
  sigHeader: {
    backgroundColor: MID_GRAY,
    paddingVertical: SP.xs + 1,
    paddingHorizontal: SP.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  sigHeaderText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: SLATE,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sigBody: {
    flexDirection: "row",
    padding: SP.md,
    gap: SP.md,
  },
  sigField: { flex: 1 },
  sigLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: SLATE,
    marginBottom: SP.xs,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  sigValue: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: INK,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GRAY,
    paddingBottom: SP.xs,
    minHeight: 20,
  },

  // ── Misc ─────────────────────────────────────────────────────────
  introPara: {
    fontSize: 8,
    fontFamily: "Helvetica",
    lineHeight: 1.55,
    marginBottom: SP.sm,
    color: SLATE,
  },
  naChip: {
    alignSelf: "flex-start",
    backgroundColor: "#fdecea",
    borderWidth: 1,
    borderColor: RED_SOFT,
    borderRadius: 3,
    paddingVertical: SP.xs,
    paddingHorizontal: SP.sm,
    marginLeft: SP.md,
    marginBottom: SP.xs,
  },
  naChipText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: RED_SOFT,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  subheadCenter: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: TEAL,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: SP.xs,
    marginTop: SP.sm,
  },
  highlightStatement: {
    backgroundColor: BLUE_LIGHT,
    borderLeftWidth: 3,
    borderLeftColor: BLUE,
    padding: SP.sm,
    marginBottom: SP.sm,
  },
  highlightStatementText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },
  qLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginBottom: SP.xs,
  },
});

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

function PageHeader({ logoSrc }: { logoSrc?: string }) {
  return (
    <View fixed>
      <View style={s.headerWrapper}>
        {logoSrc ? <Image src={logoSrc} style={s.logo} /> : null}
        <View style={s.headerCenter}>
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
      <Text style={s.footerBrand}>Confidential — Salary Appraisal Report</Text>
      <View style={s.pageNumBadge}>
        <Text style={s.pageNumText}>PAGE {num}</Text>
      </View>
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

function InfoCell({ label, value, full, last, highlight }: {
  label: string; value: string; full?: boolean; last?: boolean; highlight?: boolean;
}) {
  return (
    <View style={[full ? s.infoCellFull : s.infoCell, last ? s.infoCellLast : {}]}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={highlight ? s.infoValueHighlight : s.infoValue}>{value || "—"}</Text>
    </View>
  );
}

// Employee info section heading (only used on page 1)
function InfoSectionHeading({ title }: { title: string }) {
  return (
    <View style={{
      backgroundColor: BLUE,
      paddingVertical: SP.sm,
      paddingHorizontal: SP.md,
      marginBottom: SP.md,
      flexDirection: "row",
      alignItems: "center",
    }}>
      <View style={{ width: 3, backgroundColor: TEAL, marginRight: SP.sm, alignSelf: "stretch", borderRadius: 1 }} />
      <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: WHITE, textTransform: "uppercase", letterSpacing: 1, flex: 1, textAlign: "center" }}>
        {title}
      </Text>
    </View>
  );
}

function QCard({ num, heading, body, answer, minHeight = 52, flex }: {
  num?: string | number; heading: string; body?: string; answer: string; minHeight?: number; flex?: number;
}) {
  return (
    <View style={[s.qCard, flex ? { flex } : {}]} wrap={false}>
      <View style={s.qCardHeader}>
        {num != null ? (
          <View style={s.qCardNumBadge}>
            <Text style={s.qCardNumText}>{num}</Text>
          </View>
        ) : null}
        <Text style={s.qCardTitle}>{heading}</Text>
      </View>
      {body ? <Text style={s.qCardBody}>{body}</Text> : null}
      <View style={[s.qCardAnswer, flex ? { flex: 1, minHeight } : { minHeight }]}>
        <Text style={s.qCardAnswerText}>{answer || " "}</Text>
      </View>
    </View>
  );
}

function CheckCard({ checked, label }: { checked: boolean; label: string }) {
  return (
    <View style={[s.checkCard, checked ? s.checkCardSelected : {}]} wrap={false}>
      <View style={[s.checkDot, checked ? s.checkDotSelected : {}]}>
        {checked ? <View style={s.checkDotInner} /> : null}
      </View>
      <Text style={checked ? s.checkCardTextSelected : s.checkCardText}>{label}</Text>
    </View>
  );
}

// 2-column checkbox for manager sections
function CheckCard2Col({ checked, label }: { checked: boolean; label: string }) {
  return (
    <View style={[s.checkCard2Col, checked ? s.checkCard2ColSelected : {}]}>
      <View style={[s.checkDot, checked ? s.checkDotSelected : {}, { marginRight: 4 }]}>
        {checked ? <View style={s.checkDotInner} /> : null}
      </View>
      <Text style={[checked ? s.checkCardTextSelected : s.checkCardText, { fontSize: 7.5 }]}>{label}</Text>
    </View>
  );
}

function RatingTableRow({ alpha, label, score, index }: {
  alpha: string; label: string; score: number | null; index: number;
}) {
  const isAlt = index % 2 === 1;
  const isHigh = score != null && score >= 8;
  const isMid = score != null && score >= 5 && score < 8;
  const display = score != null ? `${score}` : "—";
  return (
    <View style={[s.ratingTableRow, isAlt ? s.ratingTableRowAlt : {}]} wrap={false}>
      <Text style={s.ratingTableAlpha}>{alpha}.</Text>
      <Text style={s.ratingTableLabel}>{label}</Text>
      <View style={[s.ratingScoreBadge, isHigh ? s.ratingScoreBadgeHigh : isMid ? s.ratingScoreBadgeMid : {}]}>
        <Text style={[s.ratingScoreText, isHigh ? s.ratingScoreTextHigh : isMid ? s.ratingScoreTextMid : {}]}>
          {display}
        </Text>
        <Text style={s.ratingScoreDenom}>/10</Text>
      </View>
    </View>
  );
}

function ProdTableRow({ label, value, index }: { label: string; value: string; index: number }) {
  const isAlt = index % 2 === 1;
  const isNA = !value || value === "—";
  return (
    <View style={[s.prodRow, isAlt ? s.prodRowAlt : {}]} wrap={false}>
      <Text style={s.prodLabel}>{label}</Text>
      <Text style={isNA ? s.prodValueNA : s.prodValue}>{value || "—"}</Text>
    </View>
  );
}

function HrTableRow({ label, score, notes, index }: {
  label: string; score: number | null; notes?: string | null; index: number;
}) {
  const isAlt = index % 2 === 1;
  const isHigh = score != null && score >= 8;
  const isMid = score != null && score >= 5 && score < 8;
  const bgColor = isHigh ? TICK_GREEN : isMid ? AMBER : BLUE;
  const display = score != null ? `${score}` : "—";
  return (
    <View style={[s.hrRow, isAlt ? s.hrRowAlt : {}]} wrap={false}>
      <View style={{ flex: 1 }}>
        <Text style={s.hrLabel}>{label}</Text>
        {notes ? <Text style={s.hrNotes}>{notes}</Text> : null}
      </View>
      <View style={[s.hrScoreBadge, { backgroundColor: bgColor }]}>
        <Text style={s.hrScoreText}>{display}</Text>
        <Text style={s.hrScoreDenom}>/10</Text>
      </View>
    </View>
  );
}

function SignatureBlock({ title, fields }: {
  title: string; fields: { label: string; value: string }[];
}) {
  return (
    <View style={s.sigContainer} wrap={false}>
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

function MgrSection2Col({ header, options, selected }: {
  header: string; options: readonly string[]; selected: string[];
}) {
  return (
    <View style={s.mgrSectionCard} wrap={false}>
      <View style={s.mgrSectionHeader}>
        <Text style={s.mgrSectionHeaderText}>{header}</Text>
      </View>
      <View style={[s.checkGrid2Col, { padding: SP.xs }]}>
        {options.map((opt) => (
          <CheckCard2Col key={opt} checked={selected.includes(opt)} label={opt} />
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
  const nextPage = () => ++p;
  const alphas = "abcdefghijklmnopqrst".split("");

  // Split self-rating into two halves
  const selfRatingFirst = SELF_RATING_ITEMS.slice(0, 10);
  const selfRatingSecond = SELF_RATING_ITEMS.slice(10);

  const logoPath = logoSrc ?? "/images/logoooo.jpg";

  return (
    <Document>

      {/* ═══════════════════════════════════════════════
          PAGE 1 — Employee Info + Q1 + Q2
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <InfoSectionHeading title="Employee Information" />

        <View style={s.infoGrid}>
          <InfoCell label="Employee Name" value={pdfDisplayValue(sub.employeeName)} highlight />
          <InfoCell label="Employee ID" value={pdfDisplayValue(sub.employeeCode)} />
          <InfoCell label="Team" value={pdfDisplayValue((sub as any).team ?? (sub as any).teamDesignation ?? "")} />
          <InfoCell label="Designation" value={pdfDisplayValue((sub as any).designation ?? "")} />
          <InfoCell label="Previous Experience in Field" value={pdfDisplayValue(sub.prevExperienceYears)} />
          <InfoCell label="Experience in This Company" value={pdfDisplayValue(sub.companyExperienceYears)} />
          <InfoCell label="Date of Submission" value={formatDate(sub.dateOfSubmission) || "—"} full last />
        </View>

        <View style={{ flex: 1, flexDirection: "column" }}>
          <QCard
            num="1"
            heading="Basis of Appraisal Request"
            body="Please describe on what basis we should consider your Salary appraisal request:"
            answer={pdfDisplayValue(sub.basisOfAppraisal)}
            flex={1}
          />
          <QCard
            num="2"
            heading="Support to the Company"
            body="Please describe how would you support the company to grow and generate more income as similar as your salary appraisal:"
            answer={pdfDisplayValue(sub.supportToCompany)}
            flex={1}
          />
        </View>
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE 2 — Q3, Q4, Q5
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <View style={{ flex: 1, flexDirection: "column" }}>
          <QCard
            num="3"
            heading="Expectations"
            body='Do you think you can expect same amount of appraisal from year to year as your salary grows? (Tell us "YES" OR "NO" and describe the reason accordingly)'
            answer={formatExpectationsAnswer(sub) || " "}
            flex={1}
          />
          <QCard
            num="4"
            heading="Improvement in Yourself"
            body="Please describe your strengths & weaknesses and describe what improvement in yourself compared to the previous year:"
            answer={pdfDisplayValue(sub.strengthsWeaknesses)}
            flex={1}
          />
          <QCard
            num="5"
            heading="Teamwork Examples"
            body="Provide examples of instances where you demonstrated strong teamwork:"
            answer={pdfDisplayValue(sub.teamworkExamples)}
            flex={1}
          />
        </View>
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE 3 — Q6 (a–e) all on one page
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        {/* 6a */}
        <View style={s.qCard} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>6a.  Goal Challenges</Text>
          </View>
          <Text style={s.qCardBody}>
            If achieved, what are the challenges did you face in achieving your goals, and how did you overcome them?
          </Text>
          <View style={[s.qCardAnswer, { minHeight: 40 }]}>
            <Text style={s.qCardAnswerText}>{pdfDisplayValue(sub.goalChallenges) || " "}</Text>
          </View>
        </View>

        {/* 6b */}
        <View style={s.qCard} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>6b.  Upcoming Goal</Text>
          </View>
          <Text style={s.qCardBody}>
            Please notify what is your goal for this upcoming year and explain how that will be beneficial to both of us?
          </Text>
          <View style={[s.qCardAnswer, { minHeight: 40 }]}>
            <Text style={s.qCardAnswerText}>{pdfDisplayValue(sub.upcomingGoal) || " "}</Text>
          </View>
        </View>

        {/* 6c */}
        <View style={s.qCard} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>6c.  Three Areas for Improvement</Text>
          </View>
          <Text style={s.qCardBody}>What are the 3 things you would like to improve?</Text>
          <View style={[s.qCardAnswer, { minHeight: 40 }]}>
            <Text style={s.qCardAnswerText}>{pdfDisplayValue(sub.threeImprovements) || " "}</Text>
          </View>
        </View>

        {/* 6d — initiative frequency */}
        <View style={s.qCard} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>6d.  Initiative &amp; Innovation Frequency</Text>
          </View>
          <Text style={s.qCardBody}>
            Did you demonstrate initiative and contribute innovative ideas to improve processes or solve problems?
          </Text>
          <View style={{ padding: SP.sm }}>
            {INITIATIVE_FREQUENCY_OPTIONS.map((opt) => (
              <CheckCard key={opt} checked={sub.initiativeFrequency === opt} label={opt} />
            ))}
          </View>
        </View>

        {/* 6e — abroad capability */}
        <View style={s.qCard} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>6e.  International Work Capability</Text>
            {sub.abroadCapabilityNa ? (
              <View style={[s.naChip, { marginLeft: SP.sm, alignSelf: "center" }]}>
                <Text style={s.naChipText}>N/A</Text>
              </View>
            ) : null}
          </View>
          <Text style={s.qCardBody}>
            Do you have capability of managing yourself if company gives opportunity to work abroad?
          </Text>
          <View style={{ padding: SP.sm }}>
            {ABROAD_OPTIONS.map((opt) => (
              <CheckCard
                key={opt}
                checked={!sub.abroadCapabilityNa && sub.abroadCapability === opt}
                label={opt}
              />
            ))}
          </View>
        </View>
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE 4 — Q7, Q8, Q9
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <QCard
          num="7"
          heading="Initiative or Innovation Examples"
          body="Provide examples of instances where you showed initiative or innovation."
          answer={pdfDisplayValue(sub.initiativeInnovation)}
          minHeight={60}
        />

        {/* Q8 — learning commitment */}
        <View style={s.qCard} wrap={false}>
          <View style={s.qCardHeader}>
            <View style={s.qCardNumBadge}>
              <Text style={s.qCardNumText}>8</Text>
            </View>
            <Text style={s.qCardTitle}>
              Commitment to Professional Development &amp; Continuous Learning
            </Text>
          </View>
          <View style={{ padding: SP.sm }}>
            {LEARNING_COMMITMENT_OPTIONS.map((o) => (
              <CheckCard key={o.value} checked={sub.learningCommitment === o.value} label={o.label} />
            ))}
          </View>
        </View>

        <QCard
          num="9"
          heading="Professionalism and Attitude"
          body="Please describe your professionalism and attitude with your team during office premises (including perspective vision on your career along with your team)."
          answer={pdfDisplayValue(sub.professionalismAttitude)}
          minHeight={70}
        />
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE 5 — Self Ratings a–j
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <View style={{ marginBottom: SP.sm }}>
          <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: SP.xs }}>
            Self Performance Ratings
          </Text>
          <Text style={{ fontSize: 7.5, color: SLATE }}>
            Rate yourself out of 10 for each criteria below.
          </Text>
        </View>

        <View style={s.ratingTable}>
          {selfRatingFirst.map((item, i) => {
            const score = sub[item.key as keyof AppraisalSubmission] as number | null;
            // Strip leading "a. " / "b. " etc. prefix that selfRatingLabel may include
            const rawLabel = selfRatingLabel(item);
            // Remove duplicate alpha prefix if present (e.g. "a. a. How..." → "How...")
            const cleanLabel = rawLabel.replace(/^[a-t]\.\s*/i, "");
            return (
              <RatingTableRow
                key={item.key}
                alpha={alphas[i]}
                label={cleanLabel}
                score={score}
                index={i}
              />
            );
          })}
        </View>
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE 6 — Self Ratings k–t
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <View style={{ marginBottom: SP.sm }}>
          <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: SP.xs }}>
            Self Performance Ratings (continued)
          </Text>
        </View>

        <View style={s.ratingTable}>
          {selfRatingSecond.map((item, i) => {
            const globalIndex = i + 10;
            const score = sub[item.key as keyof AppraisalSubmission] as number | null;
            const rawLabel = selfRatingLabel(item);
            const cleanLabel = rawLabel.replace(/^[a-t]\.\s*/i, "");
            return (
              <RatingTableRow
                key={item.key}
                alpha={alphas[globalIndex]}
                label={cleanLabel}
                score={score}
                index={i}
              />
            );
          })}
        </View>
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          Non-QC: Productivity
      ═══════════════════════════════════════════════ */}
      {!isQC && (
        <>
          <PdfPage num={nextPage()} logoSrc={logoPath}>
            <Text style={{ fontSize: 9.5, fontFamily: "Helvetica-Bold", color: INK, marginBottom: SP.xs }}>
              10.  Productivity and Time Management
            </Text>
            <Text style={s.introPara}>{PRODUCTIVITY_INTRO}</Text>

            <Text style={s.subheadCenter}>Shop Drafting and Checker</Text>
            <View style={[s.prodTable, { marginBottom: SP.lg }]}>
              {SHOP_DRAFTING_ITEMS.map((item, i) => (
                <ProdTableRow
                  key={item.key}
                  label={item.label}
                  value={pdfDisplayValue(getSubmissionField(sub, item.key as keyof AppraisalSubmission)) || "—"}
                  index={i}
                />
              ))}
            </View>

            <Text style={s.subheadCenter}>E-Drafting</Text>
            <View style={s.prodTable}>
              {E_DRAFTING_ITEMS.map((item, i) => (
                <ProdTableRow
                  key={item.key}
                  label={item.label}
                  value={pdfDisplayValue(getSubmissionField(sub, item.key as keyof AppraisalSubmission)) || "—"}
                  index={i}
                />
              ))}
            </View>
          </PdfPage>

          <PdfPage num={nextPage()} logoSrc={logoPath}>
            <Text style={s.subheadCenter}>Modeler</Text>
            {sub.modelerSectionNa ? (
              <View style={{ alignItems: "center", marginTop: SP.xl }}>
                <View style={s.naChip}>
                  <Text style={s.naChipText}>Not Applicable — This Section Does Not Apply to This Category</Text>
                </View>
              </View>
            ) : (
              <View style={s.prodTable}>
                {MODELER_ITEMS.map((item, i) => (
                  <ProdTableRow
                    key={item.key}
                    label={item.label}
                    value={pdfDisplayValue(getSubmissionField(sub, item.key as keyof AppraisalSubmission)) || "—"}
                    index={i}
                  />
                ))}
              </View>
            )}
          </PdfPage>
        </>
      )}

      {/* ═══════════════════════════════════════════════
          PAGE — Q11, Q12, Overall Rating, Employee Signature
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <View style={{ flex: 1, flexDirection: "column" }}>
          <QCard
            num="11"
            heading="Work Performance and Time Management"
            body="Please describe your current year work performance and Time Management"
            answer={pdfDisplayValue(sub.currentYearPerformance)}
            flex={1}
          />
          <QCard
            num="12"
            heading="Productivity Improvement Plan"
            body="Please describe how you would perform and improve your productivity for this upcoming performance cycle as similar as your salary grow:"
            answer={pdfDisplayValue(sub.productivityImprovement)}
            flex={1}
          />
        </View>

        <View style={[s.qCard, { marginBottom: SP.sm, marginTop: SP.xs }]} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>Rate Yourself — Overall Performance</Text>
          </View>
          <View style={{ padding: SP.sm }}>
            {OVERALL_RATING_OPTIONS.map((opt) => (
              <CheckCard key={opt} checked={selectedOverall === opt} label={opt} />
            ))}
          </View>
        </View>

        <SignatureBlock
          title="Employee Declaration & Signature"
          fields={[
            { label: "Employee Signature", value: pdfDisplayValue(sub.employeeSignatureName) },
            { label: "Employee Code", value: pdfDisplayValue(sub.employeeCode) },
            { label: "Date", value: formatDate(sub.employeeSignatureDate) || formatDate(sub.dateOfSubmission) || " " },
          ]}
        />
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE — HR and Admin Feedback (single page)
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: SP.sm }}>
          HR and Admin Feedback
        </Text>

        <View style={[s.hrTable, { marginBottom: SP.sm }]}>
          {HR_RATING_ITEMS.map((item, i) => {
            const val = sub[item.key as keyof AppraisalSubmission] as number | null;
            const notes =
              item.key === "hrLeaveManagement"
                ? (sub as any).hrLeaveManagementNotes
                : item.key === "hrTimingManagement"
                ? (sub as any).hrTimingManagementNotes
                : null;
            return <HrTableRow key={item.key} label={item.label} score={val} notes={notes} index={i} />;
          })}
        </View>

        {/* Effective date — compact inline */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SP.sm }}>
          <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: SLATE, marginRight: SP.sm }}>
            Effective Date:
          </Text>
          <Text style={{ fontSize: 9, fontFamily: "Helvetica", color: INK }}>
            {formatDate(sub.mgmtEffectiveDate) || "—"}
          </Text>
        </View>

        {/* Backlog notes */}
        <View style={[s.qCard, { marginBottom: SP.sm }]}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>Backlog / Additional Notes</Text>
          </View>
          <Text style={s.qCardBody}>{HR_BACKLOG_QUESTION}</Text>
          <View style={[s.qCardAnswer, { minHeight: 60 }]}>
            <Text style={s.qCardAnswerText}>{pdfDisplayValue(sub.hrBacklogNotes) || " "}</Text>
          </View>
        </View>

        <SignatureBlock
          title="Admin Head Signature"
          fields={[
            { label: "Signature of Admin Head", value: pdfDisplayValue(sub.hrAdminSignatureName) },
            { label: "Date", value: formatDate(sub.hrAdminSignatureDate) || " " },
          ]}
        />
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE — Team Head Feedback (single page, 2-col checkboxes)
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: SP.sm }}>
          Team Head Feedback
        </Text>

        {/* Employee strip */}
        <View style={[s.infoGrid, { marginBottom: SP.sm }]}>
          <InfoCell label="Employee Name" value={pdfDisplayValue(sub.employeeName)} highlight />
          <InfoCell label="Employee Code" value={pdfDisplayValue(sub.employeeCode)} last />
        </View>

        {MGR_RECOMMENDATION_SECTIONS.map((section) => {
          const reasons = (sub[section.field as keyof AppraisalSubmission] as string[]) ?? [];
          const options = mgrReasonOptions[section.field];
          return (
            <MgrSection2Col
              key={section.level}
              header={section.header}
              options={options}
              selected={reasons}
            />
          );
        })}

        {sub.mgrRemarks ? (
          <View style={[s.qCard, { marginBottom: SP.sm }]} wrap={false}>
            <View style={s.qCardHeader}>
              <Text style={s.qCardTitle}>Additional Remarks</Text>
            </View>
            <View style={[s.qCardAnswer, { minHeight: 36 }]}>
              <Text style={s.qCardAnswerText}>{pdfDisplayValue(sub.mgrRemarks)}</Text>
            </View>
          </View>
        ) : null}

        <SignatureBlock
          title="Team Head Signature"
          fields={[
            { label: "Signature of Team Head", value: pdfDisplayValue(sub.mgrSignatureName) },
            { label: "Date", value: formatDate(sub.mgrSignatureDate) || " " },
          ]}
        />
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE — Management Worksheet (single page)
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: SP.sm }}>
          Management Worksheet &amp; Final Conclusion
        </Text>

        <Text style={s.introPara}>{MANAGEMENT_LETTER_INTRO}</Text>

        <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: INK, marginBottom: SP.xs }}>
          Increment Criteria — FY 2026–27
        </Text>

        {/* Compact slab table */}
        <View style={{ marginBottom: SP.sm, borderWidth: 1, borderColor: BORDER_GRAY }}>
          <View style={s.tableHead}>
            <Text style={[s.tableHeadText, { flex: 1 }]}>CTC Range</Text>
            <Text style={[s.tableHeadText, { flex: 1, textAlign: "right" }]}>Increment %</Text>
          </View>
          {slabs.map((slab, i) => {
            const max = slab.ctcMax ?? Infinity;
            const active = annualCtc >= slab.ctcMin && annualCtc <= max;
            const isAlt = i % 2 === 1;
            return (
              <View key={slab.id} style={[s.tableRow, isAlt ? s.tableRowAlt : {}, active ? s.tableRowHighlight : {}]}>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                  <Text style={s.tableCell}>{formatSlabRange(slab.ctcMin, slab.ctcMax)}</Text>
                  {active ? (
                    <View style={s.tableActiveBadge}>
                      <Text style={s.tableActiveBadgeText}>YOUR SLAB</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={s.tableCellRight}>0% to {decimalToNumber(slab.maxPct)}%</Text>
              </View>
            );
          })}
        </View>

        {/* Increment statement */}
        <View style={[s.highlightStatement, { marginBottom: SP.sm }]}>
          <Text style={s.highlightStatementText}>
            Dear {sub.employeeName} — You have been awarded {incrementPct}% increment based on your report card.
            {newMonthlySalary > 0
              ? ` Your new monthly salary is ₹${newMonthlySalary.toLocaleString("en-IN")}.`
              : ""}
          </Text>
        </View>

        {/* Feedback box */}
        <View style={[s.qCard, { marginBottom: SP.sm }]} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>Management Feedback to Employee</Text>
          </View>
          <View style={[s.qCardAnswer, { minHeight: 56 }]}>
            <Text style={s.qCardAnswerText}>
              {pdfDisplayValue(sub.mgmtFinalRemarks ?? sub.mgmtFeedbackToEmployee) || " "}
            </Text>
          </View>
        </View>

        <SignatureBlock
          title="Approver Signature"
          fields={[
            { label: "Signature of Approver", value: pdfDisplayValue(sub.mgmtApproverName) },
            { label: "Date", value: formatDate(sub.mgmtApprovalDate) || " " },
          ]}
        />
      </PdfPage>

    </Document>
  );
}