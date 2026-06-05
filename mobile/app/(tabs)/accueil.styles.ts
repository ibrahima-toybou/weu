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

  // HEADER
  header: {
    backgroundColor: "#1a8f69",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
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

  // COTISATION DANS HEADER
  cotisationInHeader: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  cotisationLeft: {
    flex: 1,
  },
  cotisationMoisLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  cotisationStatut: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  payerBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  payerBtnText: {
    color: "#1a8f69",
    fontSize: 13,
    fontWeight: "700",
  },

  // CORPS
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
    borderColor: "#e0f0e8",
    shadowColor: "#0d6349",
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

  // POINT
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  pointNom: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0d6349",
    letterSpacing: -0.3,
  },
  pointSecteur: {
    fontSize: 12,
    color: "#7a9c8a",
    marginTop: 2,
  },
  statutBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statutText: {
    fontSize: 11,
    fontWeight: "700",
  },
  barWrap: {
    marginBottom: 8,
  },
  barLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  barLabelText: {
    fontSize: 11,
    color: "#7a9c8a",
  },
  barPct: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0d6349",
  },
  barTrack: {
    height: 8,
    backgroundColor: "#f0f8f4",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  pointInfo: {
    fontSize: 11,
    color: "#7a9c8a",
    marginTop: 8,
    textAlign: "center",
  },

  // BOUTON POINTAGE
  pointageBtn: {
    backgroundColor: "#1a8f69",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#1a8f69",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  pointageBtnDisabled: {
    backgroundColor: "#9fd4be",
    shadowOpacity: 0,
    elevation: 0,
  },
  pointageBtnIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  pointageBtnText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  pointageBtnSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },

  // MODAL CONFIRMATION
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#e6f5ec",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalIconText: {
    fontSize: 34,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0d6349",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 13,
    color: "#7a9c8a",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInfo: {
    backgroundColor: "#f4faf7",
    borderRadius: 12,
    padding: 14,
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0f0e8",
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: "#7a9c8a",
  },
  modalInfoVal: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0d1f16",
  },
  modalBtn: {
    backgroundColor: "#1a8f69",
    borderRadius: 12,
    padding: 14,
    width: "100%",
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
