export const colors = {
  // Fonds
  bgPage: "#F4F5F8",
  bgCard: "#FFFFFF",
  bgInput: "#F4F5F8",

  // Textes
  textPrimary: "#1B1F2B",
  textSecondary: "#6B7185",
  textLabel: "#8A90A0",
  textMuted: "#5B6172",

  // Bordures
  border: "rgba(15,23,42,0.08)",
  borderInput: "rgba(15,23,42,0.12)",
  borderLight: "rgba(15,23,42,0.06)",

  // Accents
  teal: "#2DD4BF",
  tealDark: "#0E9384",
  tealHover: "#5EE6D3",
  tealBg: "rgba(45,212,191,0.12)",
  red: "#FB7185",
  redBg: "rgba(251,113,133,0.12)",
  amber: "#FBBF24",
  amberBg: "rgba(251,191,36,0.12)",
  green: "#34D399",
  greenBg: "rgba(52,211,153,0.12)",
  purple: "#9333ea",
  purpleBg: "rgba(147,51,234,0.12)",

  // Agent
  agentBlue: "#1a5c99",
  agentBlueBg: "rgba(26,92,153,0.12)",
};

export const fonts = {
  heading: "SpaceGrotesk_700Bold",
  headingSemiBold: "SpaceGrotesk_600SemiBold",
  headingMedium: "SpaceGrotesk_500Medium",
  body: "InstrumentSans_400Regular",
  bodyMedium: "InstrumentSans_500Medium",
  bodySemiBold: "InstrumentSans_600SemiBold",
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  full: 999,
};

export const shadow = {
  card: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
};
export default { colors, fonts, radius, shadow };
