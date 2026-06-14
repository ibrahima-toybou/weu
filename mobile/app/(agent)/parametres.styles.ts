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

  // BODY
  body: {
    padding: 16,
  },

  // PROFIL CARD
  profilCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0eaf5",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#1a5c99",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  profilNom: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0d1f16",
    marginBottom: 2,
  },
  profilEmail: {
    fontSize: 13,
    color: "#7a9c8a",
    marginBottom: 4,
  },
  profilPoint: {
    fontSize: 12,
    color: "#0a3d7a",
    backgroundColor: "#e5f1fd",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },

  // SECTION
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7a9c8a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
  },

  // MENU ITEMS
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e0eaf5",
    overflow: "hidden",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f4f9",
  },
  menuItemLast: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuIconText: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0d1f16",
  },
  menuSub: {
    fontSize: 12,
    color: "#7a9c8a",
    marginTop: 1,
  },
  menuArrow: {
    fontSize: 18,
    color: "#c0d4e8",
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0d1f16",
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7a9c8a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#c0d4e8",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#0d1f16",
    backgroundColor: "#f4f8fc",
    marginBottom: 14,
  },
  modalBtn: {
    backgroundColor: "#1a5c99",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  modalBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  modalBtnOutline: {
    borderWidth: 1,
    borderColor: "#c0d4e8",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  modalBtnOutlineText: {
    color: "#4a6a58",
    fontSize: 15,
    fontWeight: "600",
  },
  alertError: {
    backgroundColor: "#fdecea",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f5b3b3",
  },
  alertErrorText: {
    color: "#8b1a1a",
    fontSize: 13,
  },
  alertSuccess: {
    backgroundColor: "#e6f5ec",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#b8ddc8",
  },
  alertSuccessText: {
    color: "#0d6349",
    fontSize: 13,
  },

  // DÉCONNEXION
  deconnexionBtn: {
    backgroundColor: "#fdecea",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f5b3b3",
    marginTop: 8,
  },
  deconnexionText: {
    color: "#c0392b",
    fontSize: 15,
    fontWeight: "700",
  },
});
