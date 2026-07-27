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
    paddingHorizontal: 18,
    marginTop: -46,
    gap: 14,
    paddingBottom: 110,
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
    marginBottom: 8,
    marginTop: 4,
  },

  item: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  itemDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  itemSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  itemBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
  },

  empty: {
    fontFamily: fonts.body,
    textAlign: "center",
    color: colors.textLabel,
    fontSize: 13,
    padding: 24,
  },
});
