import { StyleSheet } from "react-native";
import { colors, fonts, radius, shadow } from "../theme";

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
    textTransform: "capitalize",
  },

  body: {
    paddingHorizontal: 18,
    marginTop: -46,
    paddingBottom: 110,
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
    marginBottom: 10,
  },

  tourneeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  tourneeDate: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  tourneeProgress: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.teal,
  },
  tourneeNotes: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },

  pointCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...shadow.card,
  },
  pointCardDone: {
    backgroundColor: colors.greenBg,
    borderColor: colors.green + "40",
  },
  pointIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pointContent: {
    flex: 1,
  },
  pointNom: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  pointSecteur: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pointStatus: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    marginTop: 4,
  },

  validerBtn: {
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  validerBtnText: {
    fontFamily: fonts.bodySemiBold,
    color: "#0E1210",
    fontSize: 13,
  },
  retirerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  retirerBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.red,
  },
  valideBadge: {
    backgroundColor: colors.greenBg,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  valideBadgeText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.green,
    fontSize: 12,
  },

  emptyCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    ...shadow.card,
  },
  emptyTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
