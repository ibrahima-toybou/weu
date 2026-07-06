import { StyleSheet } from "react-native";
import { colors, fonts, radius, shadow } from "../lib/theme";

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

  headerGreeting: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "rgba(255,255,255,0.82)",
    marginBottom: 3,
  },
  headerName: {
    fontFamily: fonts.heading,
    fontSize: 28,
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
    paddingHorizontal: 18,
    marginTop: -20,
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
    marginBottom: 12,
  },
  cardLabelHero: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // PROPOSITIONS
  propositionCard: {
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
  },
  propositionUrgent: {
    backgroundColor: colors.redBg,
    borderColor: colors.red + "40",
  },
  propositionDemain: {
    backgroundColor: colors.amberBg,
    borderColor: colors.amber + "40",
  },
  propositionVide: {
    backgroundColor: colors.bgCard,
    borderColor: colors.border,
  },
  propositionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  propositionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 14,
  },
  propositionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  propositionBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },
  propositionPoints: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  propositionBtn: {
    borderRadius: radius.md,
    padding: 13,
    alignItems: "center",
  },
  propositionBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: "#FFFFFF",
  },

  // POINTS LIST
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 12,
  },
  pointRowLast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  pointInfo: {
    flex: 1,
  },
  pointNom: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  pointSecteur: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  pointPct: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 13,
    width: 40,
    textAlign: "right",
  },
  statutDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    flexShrink: 0,
  },

  deconnexionBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  deconnexionText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: "#FFFFFF",
  },
});
