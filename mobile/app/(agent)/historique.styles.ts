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
  },

  body: {
    paddingHorizontal: 18,
    marginTop: -46,
    paddingBottom: 110,
    gap: 14,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  statVal: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.teal,
    lineHeight: 28,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
    textAlign: "center",
  },

  sectionTitle: {
    fontFamily: fonts.headingSemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  item: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  itemDate: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    textTransform: "capitalize",
  },
  itemBadge: {
    backgroundColor: colors.tealBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  itemBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.tealDark,
  },
  itemNotes: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  empty: {
    fontFamily: fonts.body,
    textAlign: "center",
    color: colors.textLabel,
    fontSize: 13,
    padding: 24,
  },
});
