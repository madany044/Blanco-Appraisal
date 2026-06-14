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

// ─── Spacing scale ──────────────────────────────────────────────
const SP = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// ─── Type scale ─────────────────────────────────────────────────
const TS = {
  reportTitle:  { fontSize: 14, fontFamily: "Helvetica-Bold" as const },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold" as const },
  questionTitle:{ fontSize: 9.5, fontFamily: "Helvetica-Bold" as const },
  supporting:   { fontSize: 8, fontFamily: "Helvetica" as const },
  answer:       { fontSize: 9, fontFamily: "Helvetica" as const },
  label:        { fontSize: 7.5, fontFamily: "Helvetica-Bold" as const },
  value:        { fontSize: 9.5, fontFamily: "Helvetica" as const },
  caption:      { fontSize: 7, fontFamily: "Helvetica" as const },
};

// ─── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 36,
    paddingHorizontal: 0,
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    color: INK,
    backgroundColor: WHITE,
  },

  // ── Header ──────────────────────────────────────────────────────
  headerWrapper: {
    backgroundColor: BLUE_DARK,
    paddingTop: SP.md,
    paddingBottom: SP.md,
    paddingHorizontal: SP.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerAccentBar: {
    height: 3,
    backgroundColor: TEAL,
  },
  logo: { width: 52, height: 38, objectFit: "contain" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    ...TS.reportTitle,
    color: WHITE,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    ...TS.label,
    color: TEAL_LIGHT,
    textAlign: "center",
    marginTop: SP.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // ── Footer ──────────────────────────────────────────────────────
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: BLUE_DARK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SP.lg,
  },
  footerBrand: {
    ...TS.caption,
    color: TEAL_LIGHT,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  pageNumBadge: {
    backgroundColor: TEAL,
    paddingVertical: SP.xs,
    paddingHorizontal: SP.sm,
    borderRadius: 4,
  },
  pageNumText: {
    ...TS.caption,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
    letterSpacing: 0.5,
  },

  // ── Body ────────────────────────────────────────────────────────
  body: {
    paddingHorizontal: SP.xxl,
    paddingTop: SP.lg,
    flex: 1,
  },

  // ── Section heading band ─────────────────────────────────────────
  sectionBand: {
    backgroundColor: BLUE,
    paddingVertical: SP.sm,
    paddingHorizontal: SP.lg,
    marginBottom: SP.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionBandAccent: {
    width: 3,
    backgroundColor: TEAL,
    marginRight: SP.sm,
    alignSelf: "stretch",
    borderRadius: 1,
  },
  sectionBandText: {
    ...TS.sectionTitle,
    color: WHITE,
    textTransform: "uppercase",
    letterSpacing: 1,
    flex: 1,
    textAlign: "center",
  },

  // ── Info grid (2-column) ─────────────────────────────────────────
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: SP.lg,
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
  infoCellLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    ...TS.label,
    color: SLATE,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoValue: {
    ...TS.value,
    color: INK,
  },
  infoValueHighlight: {
    ...TS.value,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },

  // ── Question card ────────────────────────────────────────────────
  qCard: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: SP.lg,
    flex: 1,
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
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SP.sm,
    flexShrink: 0,
    marginTop: 1,
  },
  qCardNumText: {
    ...TS.caption,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  qCardTitle: {
    ...TS.questionTitle,
    color: BLUE,
    flex: 1,
  },
  qCardBody: {
    ...TS.supporting,
    color: SLATE,
    fontStyle: "italic",
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
    backgroundColor: WHITE,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  qCardAnswer: {
    padding: SP.md,
    backgroundColor: LIGHT_GRAY,
    flex: 1,
    minHeight: 64,
  },
  qCardAnswerText: {
    ...TS.answer,
    color: INK,
    lineHeight: 1.6,
  },

  // ── Checkbox cards ───────────────────────────────────────────────
  checkGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SP.sm,
    marginTop: SP.sm,
    marginBottom: SP.sm,
  },
  checkCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    borderRadius: 4,
    paddingVertical: SP.xs + 2,
    paddingHorizontal: SP.sm,
    marginBottom: SP.xs,
    backgroundColor: WHITE,
  },
  checkCardSelected: {
    borderColor: TICK_GREEN,
    backgroundColor: TICK_BG,
  },
  checkDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WHITE,
  },
  checkCardText: {
    ...TS.answer,
    color: INK,
    flex: 1,
  },
  checkCardTextSelected: {
    ...TS.answer,
    color: TICK_GREEN,
    fontFamily: "Helvetica-Bold",
    flex: 1,
  },

  // ── Self rating table ────────────────────────────────────────────
  ratingTable: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginTop: SP.sm,
  },
  ratingTableHead: {
    flexDirection: "row",
    backgroundColor: BLUE,
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
  },
  ratingTableHeadText: {
    ...TS.label,
    color: WHITE,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ratingTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  ratingTableRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  ratingTableAlpha: {
    width: 20,
    ...TS.label,
    color: SLATE,
    flexShrink: 0,
  },
  ratingTableLabel: {
    flex: 1,
    ...TS.answer,
    paddingRight: SP.sm,
  },
  ratingScoreBadge: {
    width: 48,
    height: 28,
    backgroundColor: BLUE_LIGHT,
    borderWidth: 1,
    borderColor: BLUE,
    borderRadius: 4,
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
    ...TS.questionTitle,
    color: BLUE,
  },
  ratingScoreTextHigh: {
    color: TICK_GREEN,
  },
  ratingScoreTextMid: {
    color: AMBER,
  },
  ratingScoreDenom: {
    ...TS.caption,
    color: SLATE,
    marginTop: 1,
  },

  // ── Productivity table ───────────────────────────────────────────
  prodTable: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: SP.lg,
  },
  prodTableHead: {
    flexDirection: "row",
    backgroundColor: TEAL,
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
  },
  prodTableHeadText: {
    ...TS.label,
    color: WHITE,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  prodTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  prodTableRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  prodTableLabel: {
    flex: 1,
    ...TS.answer,
    paddingRight: SP.sm,
  },
  prodTableValue: {
    width: 100,
    ...TS.answer,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textAlign: "right",
    flexShrink: 0,
  },
  prodTableValueNA: {
    width: 100,
    ...TS.answer,
    color: SLATE,
    textAlign: "right",
    flexShrink: 0,
    fontStyle: "italic",
  },

  // ── HR rating card ───────────────────────────────────────────────
  hrCardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  hrCardRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  hrCardLabel: {
    flex: 1,
    ...TS.answer,
    paddingRight: SP.sm,
  },
  hrCardNotes: {
    ...TS.caption,
    color: SLATE,
    fontStyle: "italic",
    marginTop: 2,
  },
  hrScoreBadge: {
    width: 52,
    height: 30,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  hrScoreText: {
    ...TS.questionTitle,
    color: WHITE,
  },
  hrScoreDenom: {
    ...TS.caption,
    color: WHITE,
    opacity: 0.8,
  },

  // ── Manager sections ─────────────────────────────────────────────
  mgrSectionCard: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: SP.sm,
  },
  mgrSectionHeader: {
    backgroundColor: INK,
    paddingVertical: SP.xs + 2,
    paddingHorizontal: SP.md,
    flexDirection: "row",
    alignItems: "center",
  },
  mgrSectionHeaderText: {
    ...TS.questionTitle,
    color: WHITE,
    flex: 1,
  },
  mgrOptionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SP.xs,
    paddingHorizontal: SP.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  mgrOptionRowSelected: {
    backgroundColor: TICK_BG,
  },
  mgrTickBox: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: BORDER_GRAY,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SP.sm,
    marginTop: 1,
    flexShrink: 0,
  },
  mgrTickBoxSelected: {
    backgroundColor: TICK_GREEN,
    borderColor: TICK_GREEN,
  },
  mgrTickMark: {
    ...TS.caption,
    fontFamily: "Helvetica-Bold",
    color: WHITE,
  },
  mgrOptionText: {
    flex: 1,
    ...TS.answer,
    color: INK,
  },
  mgrOptionTextSelected: {
    flex: 1,
    ...TS.answer,
    fontFamily: "Helvetica-Bold",
    color: TICK_GREEN,
  },

  // ── Increment table ──────────────────────────────────────────────
  tableHead: {
    flexDirection: "row",
    backgroundColor: BLUE_DARK,
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
  },
  tableHeadText: {
    ...TS.label,
    color: WHITE,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
  },
  tableRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  tableRowHighlight: {
    backgroundColor: BLUE_LIGHT,
    borderLeftWidth: 3,
    borderLeftColor: BLUE,
  },
  tableCell: { flex: 1, ...TS.answer },
  tableCellRight: { flex: 1, ...TS.answer, textAlign: "right", fontFamily: "Helvetica-Bold" },
  tableActiveBadge: {
    backgroundColor: BLUE,
    borderRadius: 3,
    paddingHorizontal: SP.xs,
    paddingVertical: 1,
    marginLeft: SP.xs,
  },
  tableActiveBadgeText: {
    ...TS.caption,
    color: WHITE,
    fontFamily: "Helvetica-Bold",
  },

  // ── Signature block ──────────────────────────────────────────────
  sigContainer: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginTop: SP.lg,
  },
  sigHeader: {
    backgroundColor: MID_GRAY,
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  sigHeaderText: {
    ...TS.label,
    color: SLATE,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sigBody: {
    flexDirection: "row",
    padding: SP.md,
    gap: SP.lg,
  },
  sigField: {
    flex: 1,
  },
  sigLabel: {
    ...TS.label,
    color: SLATE,
    marginBottom: SP.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sigValue: {
    ...TS.value,
    color: INK,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_GRAY,
    paddingBottom: SP.xs,
    minHeight: 22,
  },

  // ── Answer box (generic) ─────────────────────────────────────────
  answerBox: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    backgroundColor: LIGHT_GRAY,
    padding: SP.md,
    minHeight: 64,
  },
  answerBoxText: {
    ...TS.answer,
    color: INK,
    lineHeight: 1.6,
  },

  // ── Misc ─────────────────────────────────────────────────────────
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
    marginVertical: SP.md,
  },
  sectionDivider: {
    borderBottomWidth: 1.5,
    borderBottomColor: TEAL,
    marginVertical: SP.md,
  },
  introPara: {
    ...TS.answer,
    lineHeight: 1.65,
    marginBottom: SP.sm,
    color: SLATE,
  },
  naChip: {
    alignSelf: "flex-start",
    backgroundColor: "#fdecea",
    borderWidth: 1,
    borderColor: RED_SOFT,
    borderRadius: 4,
    paddingVertical: SP.xs,
    paddingHorizontal: SP.sm,
    marginTop: SP.sm,
  },
  naChipText: {
    ...TS.label,
    color: RED_SOFT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subheadCenter: {
    ...TS.questionTitle,
    textAlign: "center",
    color: TEAL,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SP.sm,
  },
  highlightStatement: {
    backgroundColor: BLUE_LIGHT,
    borderLeftWidth: 3,
    borderLeftColor: BLUE,
    padding: SP.md,
    marginBottom: SP.md,
  },
  highlightStatementText: {
    ...TS.questionTitle,
    color: BLUE,
  },
});

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

function PageHeader({ logoSrc }: { logoSrc?: string }) {
  return (
    <View fixed>
      <View style={s.headerWrapper}>
        {logoSrc ? <Image src={logoSrc} style={s.logo} /> : <View style={{ width: 52 }} />}
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Team Blanco AND Team Blanka</Text>
          <Text style={s.headerSubtitle}>EMPLOYEE ANNUAL APPRAISAL PORTAL</Text>
        </View>
        {logoSrc ? <Image src={logoSrc} style={s.logo} /> : <View style={{ width: 52 }} />}
      </View>
      <View style={s.headerAccentBar} />
    </View>
  );
}

function PageFooter({ num }: { num: number }) {
  return (
    <View style={s.footerBar} fixed>
      <Text style={s.footerBrand}>Salary Appraisal Report</Text>
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

function SectionBand({ title }: { title: string }) {
  return (
    <View style={s.sectionBand}>
      <View style={s.sectionBandAccent} />
      <Text style={s.sectionBandText}>{title}</Text>
    </View>
  );
}

// Info cell for the 2-column grid
function InfoCell({
  label,
  value,
  full,
  last,
  highlight,
}: {
  label: string;
  value: string;
  full?: boolean;
  last?: boolean;
  highlight?: boolean;
}) {
  return (
    <View style={[full ? s.infoCellFull : s.infoCell, last ? s.infoCellLast : {}]}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={highlight ? s.infoValueHighlight : s.infoValue}>{value || "—"}</Text>
    </View>
  );
}

// Question card (bordered, header-band style)
function QCard({
  num,
  heading,
  body,
  answer,
  minHeight = 72,
  flex,
}: {
  num?: string | number;
  heading: string;
  body?: string;
  answer: string;
  minHeight?: number;
  flex?: number;
}) {
  const answerStyle = flex
    ? [s.qCardAnswer, { flex, minHeight }]
    : [s.qCardAnswer, { minHeight }];

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
      <View style={answerStyle}>
        <Text style={s.qCardAnswerText}>{answer || " "}</Text>
      </View>
    </View>
  );
}

// Checkbox selection card
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

// Self rating table row
function RatingTableRow({
  alpha,
  label,
  score,
  index,
}: {
  alpha: string;
  label: string;
  score: number | null;
  index: number;
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

// Productivity table row
function ProdTableRow({ label, value, index }: { label: string; value: string; index: number }) {
  const isAlt = index % 2 === 1;
  const isNA = !value || value === "—";
  return (
    <View style={[s.prodTableRow, isAlt ? s.prodTableRowAlt : {}]} wrap={false}>
      <Text style={s.prodTableLabel}>{label}</Text>
      <Text style={isNA ? s.prodTableValueNA : s.prodTableValue}>{value || "—"}</Text>
    </View>
  );
}

// HR rating card row
function HrCardRow({
  label,
  score,
  notes,
  index,
}: {
  label: string;
  score: number | null;
  notes?: string | null;
  index: number;
}) {
  const isAlt = index % 2 === 1;
  const isHigh = score != null && score >= 8;
  const isMid = score != null && score >= 5 && score < 8;
  const bgColor = isHigh ? TICK_GREEN : isMid ? AMBER : BLUE;
  const display = score != null ? `${score}` : "—";
  return (
    <View style={[s.hrCardRow, isAlt ? s.hrCardRowAlt : {}]} wrap={false}>
      <View style={{ flex: 1 }}>
        <Text style={s.hrCardLabel}>{label}</Text>
        {notes ? <Text style={s.hrCardNotes}>{notes}</Text> : null}
      </View>
      <View style={[s.hrScoreBadge, { backgroundColor: bgColor }]}>
        <Text style={s.hrScoreText}>{display}</Text>
        <Text style={s.hrScoreDenom}>/10</Text>
      </View>
    </View>
  );
}

function SignatureBlock({
  title,
  fields,
}: {
  title: string;
  fields: { label: string; value: string }[];
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

function MgrSection({
  header,
  options,
  selected,
}: {
  header: string;
  options: readonly string[];
  selected: string[];
}) {
  return (
    <View style={s.mgrSectionCard} wrap={false}>
      <View style={s.mgrSectionHeader}>
        <Text style={s.mgrSectionHeaderText}>{header}</Text>
      </View>
      {options.map((opt) => {
        const isChecked = selected.includes(opt);
        return (
          <View key={opt} style={[s.mgrOptionRow, isChecked ? s.mgrOptionRowSelected : {}]}>
            <View style={[s.mgrTickBox, isChecked ? s.mgrTickBoxSelected : {}]}>
              {isChecked ? <Text style={s.mgrTickMark}>✓</Text> : null}
            </View>
            <Text style={isChecked ? s.mgrOptionTextSelected : s.mgrOptionText}>{opt}</Text>
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

  return (
    <Document>

      {/* ═══════════════════════════════════════════════
          PAGE 1 — Employee Information
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <SectionBand title="Employee Information" />

        <View style={s.infoGrid}>
          <InfoCell label="Employee Name" value={pdfDisplayValue(sub.employeeName)} highlight />
          <InfoCell label="Employee ID" value={pdfDisplayValue(sub.employeeCode)} />
          <InfoCell label="Team" value={pdfDisplayValue((sub as any).team ?? (sub as any).teamDesignation ?? "")} />
          <InfoCell label="Designation" value={pdfDisplayValue((sub as any).designation ?? "")} />
          <InfoCell
            label="Previous Experience in Field"
            value={pdfDisplayValue(sub.prevExperienceYears)}
          />
          <InfoCell
            label="Experience in This Company"
            value={pdfDisplayValue(sub.companyExperienceYears)}
          />
          <InfoCell
            label="Date of Submission"
            value={formatDate(sub.dateOfSubmission) || "—"}
            full
            last
          />
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
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <SectionBand title="Employee Self-Assessment" />
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
          PAGE 3 — Q6 (a through e)
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <SectionBand title="Achievements, Goals & Opportunities" />

        <QCard
          heading="a. Goal Challenges"
          body="If achieved, what are the challenges did you face in achieving your goals, and how did you overcome them?"
          answer={pdfDisplayValue(sub.goalChallenges)}
          minHeight={56}
        />
        <QCard
          heading="b. Upcoming Goal"
          body="Please notify what is your goal for this upcoming year and explain how that will be beneficial to both of us?"
          answer={pdfDisplayValue(sub.upcomingGoal)}
          minHeight={56}
        />
        <QCard
          heading="c. Three Areas for Improvement"
          body="What are the 3 things you would like to improve?"
          answer={pdfDisplayValue(sub.threeImprovements)}
          minHeight={56}
        />

        {/* Q6d — initiative frequency */}
        <View style={[s.qCard, { marginBottom: SP.lg }]} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>
              d. Initiative & Innovation Frequency
            </Text>
          </View>
          <Text style={s.qCardBody}>
            Did you demonstrate initiative and contribute innovative ideas to improve processes or solve problems?
          </Text>
          <View style={{ padding: SP.md }}>
            {INITIATIVE_FREQUENCY_OPTIONS.map((opt) => (
              <CheckCard key={opt} checked={sub.initiativeFrequency === opt} label={opt} />
            ))}
          </View>
        </View>

        {/* Q6e — abroad capability */}
        <View style={[s.qCard, { marginBottom: SP.lg }]} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>
              e. International Work Capability
            </Text>
          </View>
          <Text style={s.qCardBody}>
            Do you have capability of managing yourself if company gives opportunity to work abroad?
          </Text>
          <View style={{ padding: SP.md }}>
            {sub.abroadCapabilityNa ? (
              <>
                {ABROAD_OPTIONS.map((opt) => (
                  <CheckCard key={opt} checked={false} label={opt} />
                ))}
                <View style={s.naChip}>
                  <Text style={s.naChipText}>N/A — Not applicable for this category</Text>
                </View>
              </>
            ) : (
              ABROAD_OPTIONS.map((opt) => (
                <CheckCard key={opt} checked={sub.abroadCapability === opt} label={opt} />
              ))
            )}
          </View>
        </View>
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE 4 — Q7, Q8, Q9(G)
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <SectionBand title="Professional Development & Attitude" />

        <QCard
          num="7"
          heading="Initiative or Innovation Examples"
          body="Provide examples of instances where you showed initiative or innovation."
          answer={pdfDisplayValue(sub.initiativeInnovation)}
          minHeight={72}
        />

        {/* Q8 — learning commitment */}
        <View style={[s.qCard, { marginBottom: SP.lg }]} wrap={false}>
          <View style={s.qCardHeader}>
            <View style={s.qCardNumBadge}>
              <Text style={s.qCardNumText}>8</Text>
            </View>
            <Text style={s.qCardTitle}>
              Commitment to Professional Development & Continuous Learning
            </Text>
          </View>
          <View style={{ padding: SP.md }}>
            {LEARNING_COMMITMENT_OPTIONS.map((o) => (
              <CheckCard key={o.value} checked={sub.learningCommitment === o.value} label={o.label} />
            ))}
          </View>
        </View>

        <QCard
          heading="G. Professionalism and Attitude"
          body="Please describe your professionalism and attitude with your team during office premises (including perspective vision on your career along with your team)."
          answer={pdfDisplayValue(sub.professionalismAttitude)}
          minHeight={80}
        />
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE 5 — Self Ratings (professional table)
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <SectionBand title="Self Performance Ratings" />

        <View style={s.ratingTable}>
          <View style={s.ratingTableHead}>
            <Text style={[s.ratingTableHeadText, { width: 20 }]}>#</Text>
            <Text style={[s.ratingTableHeadText, { flex: 1 }]}>Performance Criteria</Text>
            <Text style={[s.ratingTableHeadText, { width: 48, textAlign: "center" }]}>Score</Text>
          </View>
          {SELF_RATING_ITEMS.map((item, i) => {
            const score = sub[item.key as keyof AppraisalSubmission] as number | null;
            return (
              <RatingTableRow
                key={item.key}
                alpha={alphas[i]}
                label={selfRatingLabel(item)}
                score={score}
                index={i}
              />
            );
          })}
        </View>
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          Non-QC: Productivity pages (professional tables)
      ═══════════════════════════════════════════════ */}
      {!isQC && (
        <>
          <PdfPage num={nextPage()} logoSrc={logoSrc}>
            <SectionBand title="Productivity & Time Management" />

            <Text style={s.introPara}>{PRODUCTIVITY_INTRO}</Text>

            {/* Shop Drafting Table */}
            <Text style={s.subheadCenter}>Shop Drafting and Checker</Text>
            <View style={[s.prodTable, { marginBottom: SP.xl }]}>
              <View style={s.prodTableHead}>
                <Text style={[s.prodTableHeadText, { flex: 1 }]}>Metric</Text>
                <Text style={[s.prodTableHeadText, { width: 100, textAlign: "right" }]}>Value</Text>
              </View>
              {SHOP_DRAFTING_ITEMS.map((item, i) => (
                <ProdTableRow
                  key={item.key}
                  label={item.label}
                  value={pdfDisplayValue(getSubmissionField(sub, item.key as keyof AppraisalSubmission)) || "—"}
                  index={i}
                />
              ))}
            </View>

            {/* E-Drafting Table */}
            <Text style={s.subheadCenter}>E-Drafting</Text>
            <View style={s.prodTable}>
              <View style={s.prodTableHead}>
                <Text style={[s.prodTableHeadText, { flex: 1 }]}>Metric</Text>
                <Text style={[s.prodTableHeadText, { width: 100, textAlign: "right" }]}>Value</Text>
              </View>
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

          <PdfPage num={nextPage()} logoSrc={logoSrc}>
            <SectionBand title="Modeler Productivity" />

            {sub.modelerSectionNa ? (
              <View style={{ alignItems: "center", marginTop: SP.xxl }}>
                <View style={s.naChip}>
                  <Text style={s.naChipText}>Not Applicable — This Section Does Not Apply to This Category</Text>
                </View>
              </View>
            ) : (
              <View style={s.prodTable}>
                <View style={s.prodTableHead}>
                  <Text style={[s.prodTableHeadText, { flex: 1 }]}>Metric</Text>
                  <Text style={[s.prodTableHeadText, { width: 100, textAlign: "right" }]}>Value</Text>
                </View>
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
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <SectionBand title="Work Performance & Self-Rating" />

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

        {/* Overall rating selection cards */}
        <View style={[s.qCard, { marginBottom: SP.lg, marginTop: SP.sm }]} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>Overall Self-Performance Rating</Text>
          </View>
          <View style={{ padding: SP.md }}>
            {OVERALL_RATING_OPTIONS.map((opt) => (
              <CheckCard key={opt} checked={selectedOverall === opt} label={opt} />
            ))}
          </View>
        </View>

        {/* Employee signature */}
        <SignatureBlock
          title="Employee Declaration & Signature"
          fields={[
            { label: "Form Filled & Signed By", value: pdfDisplayValue(sub.employeeSignatureName) },
            { label: "Employee Code", value: pdfDisplayValue(sub.employeeCode) },
            {
              label: "Date",
              value: formatDate(sub.employeeSignatureDate) || formatDate(sub.dateOfSubmission) || " ",
            },
          ]}
        />
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE — HR and Admin Feedback
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <SectionBand title="HR and Administration Feedback" />

        {/* HR Ratings Table */}
        <View style={[s.ratingTable, { marginBottom: SP.lg }]}>
          <View style={s.ratingTableHead}>
            <Text style={[s.ratingTableHeadText, { flex: 1 }]}>Assessment Criteria</Text>
            <Text style={[s.ratingTableHeadText, { width: 52, textAlign: "center" }]}>Score</Text>
          </View>
          {HR_RATING_ITEMS.map((item, i) => {
            const val = sub[item.key as keyof AppraisalSubmission] as number | null;
            const notes =
              item.key === "hrLeaveManagement"
                ? (sub as any).hrLeaveManagementNotes
                : item.key === "hrTimingManagement"
                ? (sub as any).hrTimingManagementNotes
                : null;
            return <HrCardRow key={item.key} label={item.label} score={val} notes={notes} index={i} />;
          })}
        </View>

        {/* Effective date */}
        <View style={[s.qCard, { marginBottom: SP.lg }]} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>Effective Date</Text>
          </View>
          <View style={s.qCardAnswer}>
            <Text style={s.qCardAnswerText}>
              {formatDate(sub.mgmtEffectiveDate) || "—"}
            </Text>
          </View>
        </View>

        {/* Backlog notes */}
        <View style={[s.qCard, { marginBottom: SP.lg }]} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>Backlog / Additional Notes</Text>
          </View>
          <Text style={s.qCardBody}>{HR_BACKLOG_QUESTION}</Text>
          <View style={[s.qCardAnswer, { minHeight: 72 }]}>
            <Text style={s.qCardAnswerText}>{pdfDisplayValue(sub.hrBacklogNotes) || " "}</Text>
          </View>
        </View>

        <SignatureBlock
          title="Admin Head Signature"
          fields={[
            { label: "Form Filled & Signed By Head Hr & Administration", value: pdfDisplayValue(sub.hrAdminSignatureName) },
            { label: "Date", value: formatDate(sub.hrAdminSignatureDate) || " " },
          ]}
        />
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE — Team Head Feedback
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <SectionBand title="Reporting Manager Feedback" />

        {/* Employee ID strip */}
        <View style={[s.infoGrid, { marginBottom: SP.sm }]}>
          <InfoCell label="Employee Name" value={pdfDisplayValue(sub.employeeName)} highlight />
          <InfoCell label="Employee Code" value={pdfDisplayValue(sub.employeeCode)} last />
        </View>

        {MGR_RECOMMENDATION_SECTIONS.map((section) => {
          const reasons = (sub[section.field as keyof AppraisalSubmission] as string[]) ?? [];
          const options = mgrReasonOptions[section.field];
          return (
            <MgrSection
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
            <View style={[s.qCardAnswer, { minHeight: 48 }]}>
              <Text style={s.qCardAnswerText}>{pdfDisplayValue(sub.mgrRemarks)}</Text>
            </View>
          </View>
        ) : null}

        <SignatureBlock
          title="Team Head Signature"
          fields={[
            { label: "Form Filled & Signed By Team Head", value: pdfDisplayValue(sub.mgrSignatureName) },
            { label: "Date", value: formatDate(sub.mgrSignatureDate) || " " },
          ]}
        />
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE — Management Worksheet
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoSrc}>
        <SectionBand title="Management Worksheet & Final Conclusion" />

        <Text style={s.introPara}>{MANAGEMENT_LETTER_INTRO}</Text>

        <Text style={[s.introPara, { fontFamily: "Helvetica-Bold", color: INK, marginBottom: SP.sm }]}>
          Increment Criteria — FY 2026–27
        </Text>

        {/* Slab table */}
        <View style={{ marginBottom: SP.md, borderWidth: 1, borderColor: BORDER_GRAY }}>
          <View style={s.tableHead}>
            <Text style={[s.tableHeadText, { flex: 1 }]}>CTC Range</Text>
            <Text style={[s.tableHeadText, { flex: 1, textAlign: "right" }]}>Increment Percentage</Text>
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
          <View style={[s.qCardAnswer, { minHeight: 48 }]}>
            <Text style={s.qCardAnswerText}>
              {pdfDisplayValue(sub.mgmtFinalRemarks ?? sub.mgmtFeedbackToEmployee) || " "}
            </Text>
          </View>
        </View>

        <SignatureBlock
          title="Approver Signature"
          fields={[
            { label: "Aproved By", value: pdfDisplayValue(sub.mgmtApproverName) },
            { label: "Date", value: formatDate(sub.mgmtApprovalDate) || " " },
          ]}
        />
      </PdfPage>

    </Document>
  );
}