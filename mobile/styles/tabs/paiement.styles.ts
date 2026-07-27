import { StyleSheet } from "react-native";
import { colors, fonts, radius, shadow } from "../../lib/theme";

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

  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  statBoxVal: {
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 26,
  },
  statBoxLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },

  moisNav: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadow.card,
  },
  moisNavBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  moisLabel: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  moisSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.red,
    marginTop: 2,
    textAlign: "center",
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

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoVal: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  infoValGreen: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.teal,
  },

  statutBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  statutText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },

  btnMobile: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  btnMobileText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#0E1210",
  },

  separateur: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  separateurLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  separateurText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textLabel,
  },

  cashCard: {
    backgroundColor: colors.bgPage,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 6,
  },
  cashTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  cashDesc: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },

  dejaPaye: {
    borderRadius: radius.lg,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    gap: 4,
  },
  dejaPayeTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 16,
    marginBottom: 2,
  },
  dejaPayeDate: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },

  moisItem: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
  },
  moisItemSelected: {
    backgroundColor: "rgba(45,212,191,0.08)",
    borderColor: colors.teal,
  },
  moisItemLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  moisItemLabelSelected: {
    fontFamily: fonts.bodySemiBold,
    color: colors.tealDark,
  },
});
