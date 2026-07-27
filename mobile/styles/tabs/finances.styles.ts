import { StyleSheet } from "react-native";
import { colors, fonts, radius, shadow } from "../../lib/theme";

const CATEGORIES_COLORS = {
  carburant: { bg: "rgba(251,191,36,0.12)", color: "#FBBF24" },
  salaire: { bg: "rgba(59,130,246,0.12)", color: "#3B82F6" },
  maintenance: { bg: "rgba(45,212,191,0.12)", color: "#2DD4BF" },
  autre: { bg: "rgba(15,23,42,0.06)", color: "#8A90A0" },
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F8",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F5F8",
  },

  headerTitle: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    marginTop: 4,
  },

  body: {
    padding: 18,
    gap: 14,
  },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textLabel,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // SOLDE
  soldeWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  soldeVal: {
    fontFamily: fonts.heading,
    fontSize: 32,
    letterSpacing: -1,
  },
  soldeLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // KPI
  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  kpiBox: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: "center",
  },
  kpiVal: {
    fontFamily: fonts.heading,
    fontSize: 16,
    marginBottom: 4,
  },
  kpiLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
  },

  // CATÉGORIES
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 12,
  },
  catItemLast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  catContent: {
    flex: 1,
  },
  catNom: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  catBarTrack: {
    height: 5,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    marginTop: 6,
    overflow: "hidden",
  },
  catBarFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  catMontant: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 14,
    color: colors.red,
  },

  // INFO
  infoCard: {
    backgroundColor: colors.tealBg,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(45,212,191,0.25)",
    gap: 6,
  },
  infoTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.tealDark,
  },
  infoText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
    gap: 4,
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  modalSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  modalTotal: {
    backgroundColor: colors.redBg,
    borderRadius: radius.lg,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  modalTotalVal: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.red,
  },
  modalTotalLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  depenseItem: {
    backgroundColor: colors.bgPage,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  depenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  depenseMontant: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  depenseDate: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  depenseDesc: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  closeBtn: {
    backgroundColor: colors.bgPage,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
