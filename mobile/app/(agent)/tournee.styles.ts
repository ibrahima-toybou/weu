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
    gap: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e0eaf5",
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7a9c8a",
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
    fontSize: 16,
    fontWeight: "800",
    color: "#0d1f16",
  },
  tourneeNotes: {
    fontSize: 12,
    color: "#7a9c8a",
    marginTop: 4,
  },

  pointCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0eaf5",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  pointCardDone: {
    backgroundColor: "#f4faf7",
    borderColor: "#b8ddc8",
  },
  pointIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pointContent: {
    flex: 1,
  },
  pointNom: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0d1f16",
  },
  pointSecteur: {
    fontSize: 11,
    color: "#7a9c8a",
    marginTop: 2,
  },
  pointStatus: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  validerBtn: {
    backgroundColor: "#1a5c99",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  validerBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  valideBadge: {
    backgroundColor: "#e6f5ec",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  valideBadgeText: {
    color: "#1a8f69",
    fontSize: 12,
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0eaf5",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0d1f16",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#7a9c8a",
    textAlign: "center",
  },

  terminerBtn: {
    backgroundColor: "#1a8f69",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  terminerBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
