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
const SEAL_NAVY   = "#1c3f6e";

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

  // ── Header — logo centered ABOVE the two text lines ─────────────
  headerWrapper: {
    backgroundColor: BLUE_DARK,
    paddingTop: SP.md,
    paddingBottom: SP.md,
    paddingHorizontal: SP.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAccentBar: {
    height: 3,
    backgroundColor: TEAL,
  },
  logo: { width: 40, height: 40, objectFit: "contain", marginBottom: SP.xs },
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

  // ── 2-column checkbox grid (manager section) ─────────────────────
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

  // ── Self rating table (full page utilization) ────────────────────
  ratingPageHead: {
    marginBottom: SP.md,
  },
  ratingPageTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    marginBottom: SP.xs,
  },
  ratingPageSubtitle: {
    fontSize: 8,
    color: SLATE,
  },
  ratingTable: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    flex: 1,
    flexDirection: "column",
  },
  ratingTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SP.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
    flex: 1,
  },
  ratingTableRowAlt: {
    backgroundColor: LIGHT_GRAY,
  },
  ratingTableAlphaWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BLUE_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: SP.md,
  },
  ratingTableAlpha: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },
  ratingTableLabel: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica",
    paddingRight: SP.md,
    lineHeight: 1.4,
  },
  ratingScoreBadge: {
    width: 56,
    height: 34,
    backgroundColor: BLUE_LIGHT,
    borderWidth: 1.2,
    borderColor: BLUE,
    borderRadius: 5,
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
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },
  ratingScoreTextHigh: { color: TICK_GREEN },
  ratingScoreTextMid: { color: AMBER },
  ratingScoreDenom: {
    fontSize: 6.5,
    fontFamily: "Helvetica",
    color: SLATE,
  },

  // ── Productivity (flex full-page rows) ────────────────────────────
  prodPageHead: { marginBottom: SP.sm },
  prodPageTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginBottom: SP.xs,
  },
  prodSubLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: TEAL,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingVertical: SP.xs + 1,
    backgroundColor: TEAL_LIGHT,
  },
  prodTable: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    flexDirection: "column",
  },
  prodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SP.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  prodRowAlt: { backgroundColor: LIGHT_GRAY },
  prodLabel: {
    flex: 1,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    paddingRight: SP.sm,
  },
  prodValue: {
    width: 84,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textAlign: "right",
    flexShrink: 0,
  },
  prodValueNA: {
    width: 84,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: SLATE,
    textAlign: "right",
    flexShrink: 0,
    fontStyle: "italic",
  },

  // ── HR rating (fixed overlap, multi-line safe) ────────────────────
  hrTable: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    marginBottom: SP.md,
  },
  hrRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SP.sm + 1,
    paddingHorizontal: SP.md,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_GRAY,
  },
  hrRowAlt: { backgroundColor: LIGHT_GRAY },
  hrLabelWrap: { flex: 1, paddingRight: SP.md },
  hrLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: INK,
    lineHeight: 1.4,
  },
  hrNotes: {
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: SLATE,
    fontStyle: "italic",
    marginTop: 3,
    lineHeight: 1.4,
  },
  hrScoreBadge: {
    width: 46,
    height: 30,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  hrScoreText: {
    fontSize: 9,
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

  // ── Management letter (paper-style, not boxy) ─────────────────────
  letterPage: {
    flex: 1,
    flexDirection: "column",
  },
  letterSalutation: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: INK,
    marginBottom: SP.sm,
  },
  letterBody: {
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.65,
    color: INK,
    marginBottom: SP.md,
    textAlign: "justify",
  },
  letterHighlight: {
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },
  letterSectionLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: INK,
    textDecoration: "underline",
    marginBottom: SP.sm,
  },
  letterClosing: {
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.6,
    color: INK,
    marginTop: SP.sm,
    marginBottom: SP.lg,
  },

  // ── Seal (CSS/SVG-like stamp built from Views) ────────────────────
  sealOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: SEAL_NAVY,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    transform: "rotate(-8deg)",
    opacity: 0.88,
  },
  sealInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1,
    borderColor: SEAL_NAVY,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  sealTextTop: {
    fontSize: 5.4,
    fontFamily: "Helvetica-Bold",
    color: SEAL_NAVY,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    lineHeight: 1.15,
  },
  sealTextMid: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: SEAL_NAVY,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 2,
  },
  sealTextBottom: {
    fontSize: 5.4,
    fontFamily: "Helvetica-Bold",
    color: SEAL_NAVY,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  sealStar: {
    fontSize: 8,
    color: SEAL_NAVY,
    marginVertical: 1,
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
});

// ────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────

function PageHeader({ logoSrc }: { logoSrc?: string }) {
  return (
    <View fixed>
      <View style={s.headerWrapper}>
        {logoSrc ? <Image src={logoSrc} style={s.logo} /> : null}
        <Text style={s.headerTitle}>Team Blanco AND Team Blanka</Text>
        <Text style={s.headerSubtitle}>Employee Progress Report Card for Salary Appraisal</Text>
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

// Full-height self-rating row — uses flex:1 so 10 rows fill the entire page evenly
function RatingTableRow({ alpha, label, score, index }: {
  alpha: string; label: string; score: number | null; index: number;
}) {
  const isAlt = index % 2 === 1;
  const isHigh = score != null && score >= 8;
  const isMid = score != null && score >= 5 && score < 8;
  const display = score != null ? `${score}` : "—";
  return (
    <View style={[s.ratingTableRow, isAlt ? s.ratingTableRowAlt : {}]} wrap={false}>
      <View style={s.ratingTableAlphaWrap}>
        <Text style={s.ratingTableAlpha}>{alpha}</Text>
      </View>
      <Text style={s.ratingTableLabel}>{label}</Text>
      <View style={[s.ratingScoreBadge, isHigh ? s.ratingScoreBadgeHigh : isMid ? s.ratingScoreBadgeMid : {}]}>
        <Text style={[s.ratingScoreText, isHigh ? s.ratingScoreTextHigh : isMid ? s.ratingScoreTextMid : {}]}>
          {display}
        </Text>
        <Text style={s.ratingScoreDenom}>out of 10</Text>
      </View>
    </View>
  );
}

// Full-height productivity row
function ProdTableRow({ label, value, index, flex }: { label: string; value: string; index: number; flex?: number }) {
  const isAlt = index % 2 === 1;
  const isNA = !value || value === "—";
  return (
    <View style={[s.prodRow, isAlt ? s.prodRowAlt : {}, flex ? { flex } : {}]} wrap={false}>
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
      <View style={s.hrLabelWrap}>
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

// Circular stamp/seal built entirely from Views + Text (no image dependency)
function ApprovalSeal({ companyName = "Blanco Steel Detailing Services" }: { companyName?: string }) {
  return (
    <View style={s.sealOuter}>
      <View style={s.sealInner}>
        <Text style={s.sealTextTop}>{companyName}</Text>
        <Text style={s.sealStar}>★</Text>
        <Text style={s.sealTextMid}>MYSURU</Text>
        <Text style={s.sealTextBottom}>Approved</Text>
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

  // Self-rating split a–j / k–t
  const selfRatingFirst = SELF_RATING_ITEMS.slice(0, 10);
  const selfRatingSecond = SELF_RATING_ITEMS.slice(10);

  const logoPath = logoSrc ?? "/images/logoooo.jpg";

  // ── Slab matching by INCREMENT PERCENTAGE (matches slab whose maxPct >= awarded %, the tightest fit) ──
  const sortedSlabs = [...slabs].sort((a, b) => decimalToNumber(a.maxPct) - decimalToNumber(b.maxPct));
  const matchedSlab = sortedSlabs.find((slab) => incrementPct <= decimalToNumber(slab.maxPct)) ?? sortedSlabs[sortedSlabs.length - 1];

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

        <View style={s.qCard} wrap={false}>
          <View style={s.qCardHeader}>
            <Text style={s.qCardTitle}>6c.  Three Areas for Improvement</Text>
          </View>
          <Text style={s.qCardBody}>What are the 3 things you would like to improve?</Text>
          <View style={[s.qCardAnswer, { minHeight: 40 }]}>
            <Text style={s.qCardAnswerText}>{pdfDisplayValue(sub.threeImprovements) || " "}</Text>
          </View>
        </View>

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
          PAGE 4 — Q7, Q8, Q9 (flex to fill full page height)
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <View style={{ flex: 1, flexDirection: "column" }}>
          <QCard
            num="7"
            heading="Initiative or Innovation Examples"
            body="Provide examples of instances where you showed initiative or innovation."
            answer={pdfDisplayValue(sub.initiativeInnovation)}
            flex={1}
            minHeight={70}
          />

          <View style={[s.qCard, { flex: 1 }]} wrap={false}>
            <View style={s.qCardHeader}>
              <View style={s.qCardNumBadge}>
                <Text style={s.qCardNumText}>8</Text>
              </View>
              <Text style={s.qCardTitle}>
                Commitment to Professional Development &amp; Continuous Learning
              </Text>
            </View>
            <View style={{ padding: SP.md, flex: 1, justifyContent: "center" }}>
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
            flex={1}
            minHeight={70}
          />
        </View>
      </PdfPage>

      {/* ═══════════════════════════════════════════════
          PAGE 5 — Self Ratings a–j (full page, even spacing)
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <View style={s.ratingPageHead}>
          <Text style={s.ratingPageTitle}>Self Performance Ratings</Text>
          <Text style={s.ratingPageSubtitle}>Rate yourself out of 10 for each criteria below.</Text>
        </View>

        <View style={s.ratingTable}>
          {selfRatingFirst.map((item, i) => {
            const score = sub[item.key as keyof AppraisalSubmission] as number | null;
            const rawLabel = selfRatingLabel(item);
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
          PAGE 6 — Self Ratings k–t (full page, even spacing)
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <View style={s.ratingPageHead}>
          <Text style={s.ratingPageTitle}>Self Performance Ratings (continued)</Text>
          <Text style={s.ratingPageSubtitle}>Rate yourself out of 10 for each criteria below.</Text>
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
          Non-QC: Productivity — Shop Drafting + E-Drafting on
          ONE flex-filled page, Modeler also flex-filled
      ═══════════════════════════════════════════════ */}
      {!isQC && (
        <>
          <PdfPage num={nextPage()} logoSrc={logoPath}>
            <View style={s.prodPageHead}>
              <Text style={s.prodPageTitle}>10.  Productivity and Time Management</Text>
              <Text style={s.introPara}>{PRODUCTIVITY_INTRO}</Text>
            </View>

            <View style={{ flex: 1, flexDirection: "column" }}>
              <View style={{ flex: 1, flexDirection: "column" }}>
                <Text style={s.prodSubLabel}>Shop Drafting and Checker</Text>
                <View style={[s.prodTable, { flex: 1 }]}>
                  {SHOP_DRAFTING_ITEMS.map((item, i) => (
                    <ProdTableRow
                      key={item.key}
                      label={item.label}
                      value={pdfDisplayValue(getSubmissionField(sub, item.key as keyof AppraisalSubmission)) || "—"}
                      index={i}
                      flex={1}
                    />
                  ))}
                </View>
              </View>

              <View style={{ flex: 1, flexDirection: "column", marginTop: SP.md }}>
                <Text style={s.prodSubLabel}>E-Drafting</Text>
                <View style={[s.prodTable, { flex: 1 }]}>
                  {E_DRAFTING_ITEMS.map((item, i) => (
                    <ProdTableRow
                      key={item.key}
                      label={item.label}
                      value={pdfDisplayValue(getSubmissionField(sub, item.key as keyof AppraisalSubmission)) || "—"}
                      index={i}
                      flex={1}
                    />
                  ))}
                </View>
              </View>
            </View>
          </PdfPage>

          <PdfPage num={nextPage()} logoSrc={logoPath}>
            <Text style={[s.prodSubLabel, { marginBottom: SP.md }]}>Modeler Productivity</Text>
            {sub.modelerSectionNa ? (
              <View style={{ alignItems: "center", marginTop: SP.xl }}>
                <View style={s.naChip}>
                  <Text style={s.naChipText}>Not Applicable — This Section Does Not Apply to This Category</Text>
                </View>
              </View>
            ) : (
              <View style={[s.prodTable, { flex: 1 }]}>
                {MODELER_ITEMS.map((item, i) => (
                  <ProdTableRow
                    key={item.key}
                    label={item.label}
                    value={pdfDisplayValue(getSubmissionField(sub, item.key as keyof AppraisalSubmission)) || "—"}
                    index={i}
                    flex={1}
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
          PAGE — HR and Admin Feedback (fixed overlap +
          added Current Salary & Increment Effective Date)
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

        {/* Salary / Effective Date strip — added missing fields */}
        <View style={[s.infoGrid, { marginBottom: SP.sm }]}>
          <InfoCell
            label="Employee Current CTC (Monthly)"
            value={sub.currentSalary != null ? `₹${sub.currentSalary.toLocaleString("en-IN")}` : "—"}
            highlight
          />
          <InfoCell
            label="Increment Effective Date"
            value={formatDate(sub.mgmtEffectiveDate) || "—"}
            last
          />
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
          PAGE — Management Worksheet — rewritten as a LETTER
          (matches the warm, readable feel of the handwritten
          version) + corrected slab matching by increment % +
          circular approval seal over the signature
      ═══════════════════════════════════════════════ */}
      <PdfPage num={nextPage()} logoSrc={logoPath}>
        <View style={s.letterPage}>
          <Text style={{ fontSize: 10.5, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: SP.md }}>
            Management Worksheet &amp; Final Conclusion
          </Text>

          <Text style={s.letterSalutation}>Dear Employee of Team,</Text>

          <Text style={s.letterBody}>{MANAGEMENT_LETTER_INTRO}</Text>

          <Text style={s.letterSectionLabel}>
            Below are the criteria of increment with effect from FY 2026–27.
          </Text>

          {/* Compact slab table */}
          <View style={{ marginBottom: SP.md, borderWidth: 1, borderColor: BORDER_GRAY }}>
            <View style={s.tableHead}>
              <Text style={[s.tableHeadText, { flex: 1 }]}>CTC</Text>
              <Text style={[s.tableHeadText, { flex: 1, textAlign: "right" }]}>% of Increment</Text>
            </View>
            {sortedSlabs.map((slab, i) => {
              const isActive = matchedSlab?.id === slab.id;
              const isAlt = i % 2 === 1;
              return (
                <View key={slab.id} style={[s.tableRow, isAlt ? s.tableRowAlt : {}, isActive ? s.tableRowHighlight : {}]}>
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                    <Text style={s.tableCell}>{formatSlabRange(slab.ctcMin, slab.ctcMax)}</Text>
                    {isActive ? (
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

          {/* Letter-style increment statement, not a boxed banner */}
          <Text style={s.letterBody}>
            Dear Employee <Text style={s.letterHighlight}>{sub.employeeName}</Text> — You have been awarded{" "}
            <Text style={s.letterHighlight}>{incrementPct}%</Text> of Increment based on your report card.
            {newMonthlySalary > 0
              ? ` Your new monthly salary will be ₹${newMonthlySalary.toLocaleString("en-IN")}.`
              : ""}
          </Text>

          {pdfDisplayValue(sub.mgmtFinalRemarks ?? sub.mgmtFeedbackToEmployee) ? (
            <Text style={s.letterBody}>
              {pdfDisplayValue(sub.mgmtFinalRemarks ?? sub.mgmtFeedbackToEmployee)}
            </Text>
          ) : null}

          <Text style={s.letterClosing}>
            We wish you all the success in your career and hope you deliver your best performance in the upcoming
            performance cycle.
          </Text>

          {/* Signature row with seal overlapping the line, like the manual stamp */}
          <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: SP.md }}>
            <View style={{ flex: 1, position: "relative" }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: SLATE, marginBottom: SP.sm }}>
                Signature of the Approver:
              </Text>
              <View style={{ position: "relative", height: 60, justifyContent: "flex-end" }}>
                <View style={{ position: "absolute", left: 30, bottom: -6 }}>
                  <ApprovalSeal />
                </View>
                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: "Helvetica",
                    color: INK,
                    borderBottomWidth: 1,
                    borderBottomColor: BORDER_GRAY,
                    paddingBottom: SP.xs,
                    width: "70%",
                  }}
                >
                  {pdfDisplayValue(sub.mgmtApproverName) || " "}
                </Text>
              </View>
            </View>
            <View style={{ width: 140 }}>
              <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: SLATE, marginBottom: SP.sm }}>
                Date:
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: "Helvetica",
                  color: INK,
                  borderBottomWidth: 1,
                  borderBottomColor: BORDER_GRAY,
                  paddingBottom: SP.xs,
                }}
              >
                {formatDate(sub.mgmtApprovalDate) || " "}
              </Text>
            </View>
          </View>
        </View>
      </PdfPage>

    </Document>
  );
}