export const theme = {
  gradient: ["#6EA0D6", "#BFD0EA"],
  cardBg: "#FFFFFF",
  bgMuted: "#EAF1FF",
  text: "#0F172A",
  subtext: "#4B5563",
  border: "#E5E7EB",
  muted: "#F3F4F6",
  accent: "#DAA520",   // gold accent from your brand
  success: "#065f46",
  danger: "#7f1d1d",
};

export const radius = { sm: 10, md: 12, lg: 16, xl: 20, pill: 999 };
export const space =  { xs: 6, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

export const shadow = {
  card:   { shadowColor:"#000", shadowOpacity:0.12, shadowRadius:8, shadowOffset:{width:0,height:3}, elevation:4 },
  soft:   { shadowColor:"#000", shadowOpacity:0.06, shadowRadius:6, shadowOffset:{width:0,height:2}, elevation:2 },
  micro:  { shadowColor:"#000", shadowOpacity:0.04, shadowRadius:4, shadowOffset:{width:0,height:1}, elevation:1 },
};

export const textStyles = {
  h1:   { fontSize: 22, fontWeight: "800", color: theme.text },
  h2:   { fontSize: 18, fontWeight: "800", color: theme.text },
  h3:   { fontSize: 16, fontWeight: "800", color: theme.text },
  body: { fontSize: 14, color: theme.text },
  sub:  { fontSize: 12, color: theme.subtext },
  label:{ fontSize: 13, fontWeight:"600", color: theme.text },
};
