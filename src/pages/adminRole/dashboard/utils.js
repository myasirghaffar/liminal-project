export const pctColor = (pct) =>
  pct >= 60 ? "#16a34a" : pct >= 30 ? "#d97706" : "#dc2626";

export const pctLabel = (pct) => (pct >= 60 ? "Good" : pct >= 30 ? "Low" : "Critical");

export const scoreColor = (score) => {
  if (score == null) return "#94a3b8";
  if (score >= 7) return "#16a34a";
  if (score >= 4.5) return "#d97706";
  return "#dc2626";
};

export const scoreLabel = (score) => {
  if (score == null) return "—";
  if (score >= 7) return "Strong";
  if (score >= 4.5) return "Moderate";
  return "At Risk";
};

export const riskFlag = (score) => score != null && score < 4.5;

export const trendArrow = (direction) => {
  if (direction === "up") return { icon: "↑", color: "#16a34a", label: "Improving" };
  if (direction === "down") return { icon: "↓", color: "#dc2626", label: "Declining" };
  if (direction === "flat") return { icon: "→", color: "#d97706", label: "Steady" };
  return { icon: "", color: "#94a3b8", label: "" };
};

export const formatProgramDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
};
