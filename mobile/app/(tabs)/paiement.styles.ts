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
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
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
    borderColor: "#e0f0e8",
    shadowColor: "#0d6349",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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

  // INFO ROW
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f8f4",
  },
  infoLabel: {
    fontSize: 13,
    color: "#7a9c8a",
  },
  infoVal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0d1f16",
  },
  infoValGreen: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0d6349",
  },
  infoValRed: {
    fontSize: 13,
    fontWeight: "600",
    color: "#c0392b",
  },

  // STATUT BADGE
  statutBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  statutText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // BOUTONS PAIEMENT
  btnMobile: {
    backgroundColor: "#1a5c99",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },
  btnMobileText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  btnMobileIcon: {
    fontSize: 20,
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
    backgroundColor: "#e0f0e8",
  },
  separateurText: {
    fontSize: 12,
    color: "#7a9c8a",
  },

  cashCard: {
    backgroundColor: "#f4faf7",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0f0e8",
    alignItems: "center",
  },
  cashTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4a6a58",
    marginBottom: 6,
  },
  cashDesc: {
    fontSize: 12,
    color: "#7a9c8a",
    textAlign: "center",
    lineHeight: 18,
  },

  // DÉJÀ PAYÉ
  dejaPaye: {
    backgroundColor: "#e6f5ec",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#b8ddc8",
    marginBottom: 12,
  },
  dejaPayeIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  dejaPayeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0d6349",
    marginBottom: 4,
  },
  dejaPayeDate: {
    fontSize: 12,
    color: "#4a6a58",
  },
});
