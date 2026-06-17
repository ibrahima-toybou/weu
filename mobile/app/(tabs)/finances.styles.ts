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
    gap: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e0f0e8",
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7a9c8a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // KPI ROW
  kpiRow: {
    flexDirection: "row",
    gap: 10,
  },
  kpiBox: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  kpiVal: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 11,
    color: "#4a6a58",
    textAlign: "center",
  },

  // SOLDE
  soldeWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  soldeVal: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  soldeLabel: {
    fontSize: 12,
    color: "#7a9c8a",
    marginTop: 4,
  },

  // CATEGORIES
  catItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f8f4",
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
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  catContent: {
    flex: 1,
  },
  catNom: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0d1f16",
    textTransform: "capitalize",
  },
  catBarTrack: {
    height: 5,
    backgroundColor: "#f0f8f4",
    borderRadius: 3,
    marginTop: 6,
    overflow: "hidden",
  },
  catBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#1a8f69",
  },
  catMontant: {
    fontSize: 14,
    fontWeight: "700",
    color: "#c0392b",
  },
  catArrow: {
    fontSize: 16,
    color: "#c0ddd0",
  },

  // INFO
  infoCard: {
    backgroundColor: "#e6f5ec",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#b8ddc8",
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0d6349",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: "#4a6a58",
    lineHeight: 18,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0d1f16",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  modalSub: {
    fontSize: 13,
    color: "#7a9c8a",
    marginBottom: 16,
  },
  modalTotal: {
    backgroundColor: "#fdecea",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  modalTotalVal: {
    fontSize: 26,
    fontWeight: "800",
    color: "#c0392b",
  },
  modalTotalLabel: {
    fontSize: 12,
    color: "#7a9c8a",
    marginTop: 2,
  },
  depenseItem: {
    backgroundColor: "#f4faf7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0f0e8",
  },
  depenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  depenseMontant: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0d1f16",
  },
  depenseDate: {
    fontSize: 11,
    color: "#7a9c8a",
  },
  depenseDesc: {
    fontSize: 12,
    color: "#4a6a58",
  },
  closeBtn: {
    backgroundColor: "#f4faf7",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e0f0e8",
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a6a58",
  },
});
