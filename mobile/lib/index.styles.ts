import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4faf7",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#1a8f69",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoEmoji: {
    fontSize: 30,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0d6349",
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 13,
    color: "#7a9c8a",
    marginTop: 4,
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#c0ddd0",
    shadowColor: "#0d6349",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4a6a58",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#c0ddd0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#1a2a20",
    backgroundColor: "#f4faf7",
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#1a8f69",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: {
    backgroundColor: "#9fd4be",
  },
  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  forgotBtn: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotText: {
    fontSize: 13,
    color: "#7a9c8a",
  },
});
