import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4faf7",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4faf7",
  },
  header: {
    backgroundColor: "#1a8f69",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  body: {
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0f0e8",
  },
  statVal: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1a8f69",
  },
  statLabel: {
    fontSize: 11,
    color: "#7a9c8a",
    marginTop: 3,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0d6349",
    marginBottom: 10,
    marginTop: 4,
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#e0f0e8",
  },
  itemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0d1f16",
  },
  itemSub: {
    fontSize: 11,
    color: "#7a9c8a",
    marginTop: 2,
  },
  itemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  itemBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    color: "#7a9c8a",
    fontSize: 13,
    padding: 20,
  },
});
