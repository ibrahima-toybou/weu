import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f8fc",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f8fc",
  },
  header: {
    backgroundColor: "#1a5c99",
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
    borderColor: "#e0eaf5",
  },
  statVal: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1a5c99",
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
    color: "#1a5c99",
    marginBottom: 10,
    marginTop: 4,
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0eaf5",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  itemDate: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0d1f16",
  },
  itemBadge: {
    backgroundColor: "#e5f1fd",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  itemBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0a3d7a",
  },
  itemNotes: {
    fontSize: 12,
    color: "#7a9c8a",
  },
  empty: {
    textAlign: "center",
    color: "#7a9c8a",
    fontSize: 13,
    padding: 20,
  },
});
