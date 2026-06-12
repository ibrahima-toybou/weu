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

  // HEADER
  header: {
    backgroundColor: "#1a5c99",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerGreeting: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 3,
  },
  headerName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 3,
  },
  deconnexionBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  deconnexionText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },

  // BODY
  body: {
    padding: 16,
    gap: 12,
  },

  // CARD
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e0eaf5",
    shadowColor: "#1a5c99",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7a9c8a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  // PROPOSITIONS
  propositionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  propositionUrgent: {
    backgroundColor: "#fdecea",
    borderColor: "#f5b3b3",
  },
  propositionDemain: {
    backgroundColor: "#fdf0e0",
    borderColor: "#f5d4a0",
  },
  propositionVide: {
    backgroundColor: "#f4faf7",
    borderColor: "#d8eee4",
  },
  propositionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  propositionTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  propositionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  propositionBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  propositionPoints: {
    fontSize: 12,
    color: "#4a6a58",
    marginBottom: 12,
    lineHeight: 18,
  },
  propositionBtn: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  propositionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },

  // POINTS LIST
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f9",
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
    fontSize: 13,
    fontWeight: "600",
    color: "#0d1f16",
  },
  pointSecteur: {
    fontSize: 11,
    color: "#7a9c8a",
    marginTop: 1,
  },
  pointPct: {
    fontSize: 13,
    fontWeight: "700",
    width: 40,
    textAlign: "right",
  },
  statutDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  emptyState: {
    textAlign: "center",
    color: "#7a9c8a",
    fontSize: 13,
    padding: 16,
  },
});
