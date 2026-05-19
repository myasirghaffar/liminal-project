import React from "react";
import { getInsightsAlerts } from "./adminRole/dashboard/filters";
import { DASHBOARD_PAGE_RESPONSIVE_CSS } from "./adminRole/dashboard/dashboardPageResponsiveCss";

function InsightCard({ insight, expanded = false, BRAND }) {
  const [open, setOpen] = React.useState(expanded);
  const colors = {
    positive: { bg: "#f0fdf4", border: "#bbf7d0", icon: "#16a34a", badge: "#dcfce7", text: "#15803d", label: "Positive" },
    moderate: { bg: "#fffbeb", border: "#fde68a", icon: "#d97706", badge: "#fef3c7", text: "#92400e", label: "Watch" },
    risk: { bg: "#fef2f2", border: "#fecaca", icon: "#dc2626", badge: "#fee2e2", text: "#991b1b", label: "Action Required" },
  }[insight.flag];

  return (
    <div style={{ background: colors.bg, border: `1.5px solid ${colors.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
      <div onClick={() => setOpen((prev) => !prev)} style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{insight.icon}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black }}>{insight.category}</div>
            <span style={{ background: colors.badge, color: colors.text, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 8 }}>{colors.label}</span>
          </div>
        </div>
        <span style={{ color: colors.icon, fontWeight: 700, fontSize: 20, flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </div>
      {open && (
        <div style={{ padding: "0 18px 18px" }}>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.75, margin: "0 0 14px", borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>{insight.summary}</p>
          <div style={{ fontWeight: 700, fontSize: 11, color: BRAND.grey, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Recommendations</div>
          {insight.recommendations.map((recommendation, index) => (
            <div key={`${insight.category}-${index}`} style={{ display: "flex", gap: 9, marginBottom: 9, alignItems: "flex-start" }}>
              <div style={{ minWidth: 20, height: 20, borderRadius: "50%", background: colors.badge, color: colors.text, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{index + 1}</div>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: 0 }}>{recommendation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Insights({
  summary,
  config,
  onExport,
  BRAND,
  sel,
  filterWeek,
  filterLocId,
  onFilterWeekChange,
  onFilterLocIdChange,
}) {
  const safeSummary = summary || null;
  const totals = safeSummary?.totals || { responses: 0 };
  const isEmpty = totals.responses === 0 || safeSummary?.hasData === false;
  const emptyMessage = safeSummary?.message || "No data yet for this program";
  const byWeek = safeSummary?.byWeek || [];
  const byLocation = safeSummary?.byLocation || [];
  const frontendBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
  const clientFrontendUrl = config?.slug ? `${frontendBaseUrl}/${config.slug}` : "";

  const insights = getInsightsAlerts(safeSummary, filterWeek, filterLocId);
  const riskCount = insights.filter((insight) => insight.flag === "risk").length;
  const moderateCount = insights.filter((insight) => insight.flag === "moderate").length;
  const positiveCount = insights.filter((insight) => insight.flag === "positive").length;

  return (
    <>
      <style>{DASHBOARD_PAGE_RESPONSIVE_CSS}</style>
      <div className="liminal-page-shell">
      <div className="liminal-page-head">
        <h2 className="liminal-page-head-title" style={{ color: BRAND.black }}>
          Insights & Recommendations
        </h2>
        <button
          type="button"
          className="liminal-page-head-btn"
          onClick={() => onExport("insights")}
          style={{ background: "#16a34a", color: "#fff" }}
        >
          📄 Export Report
        </button>
      </div>
      <p style={{ color: BRAND.grey, fontSize: 12, marginBottom: 18 }}>Grounded in the Change Intelligence model — for {config.clientName} leadership action</p>
      {clientFrontendUrl && (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${BRAND.border}`,
            borderRadius: 11,
            padding: "10px 14px",
            marginBottom: 18,
            fontSize: 12,
            color: BRAND.grey,
          }}
        >
          <span style={{ fontWeight: 700, color: BRAND.black }}>Frontend URL: </span>
          <a
            href={clientFrontendUrl}
            target="_blank"
            rel="noreferrer"
            style={{ color: BRAND.blue, fontWeight: 700, textDecoration: "none" }}
          >
            {clientFrontendUrl}
          </a>
        </div>
      )}
      {isEmpty && (
        <div style={{ background: BRAND.lightBlue, border: `1px solid ${BRAND.blue}30`, borderRadius: 11, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: BRAND.blue, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700 }}>{emptyMessage}</span>
          <span style={{ color: BRAND.grey, fontWeight: 500 }}>
            — showing the layout with empty values. Insights groups will populate automatically once check-ins are submitted.
          </span>
        </div>
      )}
      <div className="liminal-page-filters" style={{ marginBottom: 18 }}>
        <div className="liminal-page-filter-group">
          <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.grey }}>Week:</span>
          <select value={filterWeek} onChange={(event) => onFilterWeekChange(event.target.value)} style={{ ...sel, width: undefined, fontSize: 12, padding: "6px 10px" }}>
            {["All", ...byWeek.map((row) => row.week)].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="liminal-page-filter-group">
          <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.grey }}>Location:</span>
          <select value={filterLocId} onChange={(event) => onFilterLocIdChange(event.target.value)} style={{ ...sel, width: undefined, fontSize: 12, padding: "6px 10px" }}>
            <option value="All">All</option>
            {byLocation.map((location) => (
              <option key={location.locationId || location.name} value={location.locationId || location.name}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="liminal-insights-stat-grid">
        {[
          { label: "Action Required", count: riskCount, color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
          { label: "Watch Closely", count: moderateCount, color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
          { label: "Positive Signal", count: positiveCount, color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
        ].map((item) => (
          <div key={item.label} style={{ background: item.bg, border: `1.5px solid ${item.border}`, borderRadius: 11, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: item.color, fontFamily: "'Nunito Sans',sans-serif" }}>{item.count}</div>
            <div style={{ fontSize: 11, color: item.color, fontWeight: 700 }}>{item.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: BRAND.lightCoral, border: `1px solid ${BRAND.coral}30`, borderRadius: 11, padding: "12px 16px", marginBottom: 18, display: "flex", gap: 10 }}>
        <span style={{ fontSize: 18 }}>🧠</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 12, color: BRAND.black, marginBottom: 3 }}>How to read these insights</div>
          <div style={{ fontSize: 11, color: BRAND.grey, lineHeight: 1.7 }}>All interpretations are grounded in the Change Intelligence model. Stage 1 must be complete before Stage 2 is effective. Stage 2 must be held before Stage 3 can succeed. Read in order — don't skip to the recommendations that feel easier.</div>
        </div>
      </div>
      {["risk", "moderate", "positive"].map((flag) => {
        const group = insights.filter((insight) => insight.flag === flag);
        const groupLabel = flag === "risk" ? "⚠️ Action Required" : flag === "moderate" ? "👀 Watch Closely" : "✅ Positive Signals";
        const groupColor = flag === "risk" ? "#dc2626" : flag === "moderate" ? "#d97706" : "#16a34a";
        const groupBg = flag === "risk" ? "#fef2f2" : flag === "moderate" ? "#fffbeb" : "#f0fdf4";
        const groupBorder = flag === "risk" ? "#fecaca" : flag === "moderate" ? "#fde68a" : "#bbf7d0";
        if (!group.length && !isEmpty) {
          return null;
        }
        return (
          <div key={flag} style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: groupColor, marginBottom: 12 }}>{groupLabel}</div>
            {group.length > 0 ? (
              group.map((insight, index) => (
                <InsightCard key={`${insight.category}-${index}`} insight={insight} expanded={flag === "risk" && index === 0} BRAND={BRAND} />
              ))
            ) : (
              <div style={{ background: groupBg, border: `1.5px solid ${groupBorder}`, borderRadius: 14, padding: "16px 18px", color: BRAND.grey, fontSize: 12 }}>
                No {flag === "risk" ? "action items" : flag === "moderate" ? "watch items" : "positive signals"} yet — they'll appear here once check-ins are submitted.
              </div>
            )}
          </div>
        );
      })}
      <div style={{ background: BRAND.lightBlue, border: `1px solid ${BRAND.blue}25`, borderRadius: 11, padding: "12px 16px" }}>
        <div style={{ fontSize: 12, color: BRAND.blue, fontWeight: 700, marginBottom: 3 }}>A note from Amy</div>
        <div style={{ fontSize: 12, color: BRAND.grey, lineHeight: 1.7 }}>Data tells you what's happening. The Change Intelligence model tells you why — and what to do about it. Don't use these insights to report upward. Use them to act. The teams in these scores are real people navigating real change. They deserve a real response.</div>
      </div>
    </div>
    </>
  );
}

export default Insights;
