import React, { useEffect, useMemo, useRef, useState } from "react";
import { LOGO_LIGHT } from "../../../../assets/icons";
import { pctColor, scoreColor, scoreLabel, riskFlag } from "../utils";
import {
  aggregateDepartmentRange,
  aggregateLocationRange,
  aggregateWeekRange,
  getInsightsAlertsForWeeks,
  resolveExportPeriod,
  totalStaffForFilter,
} from "../filters";

/** Layout for export modal + report preview; also injected in print window. Desktop defaults match original inline layout (≥992px). */
const EXPORT_PDF_LAYOUT_CSS = `
.export-pdf-overlay{box-sizing:border-box;padding:20px 16px}
.export-pdf-card{box-sizing:border-box;max-width:860px;margin:0 auto;border-radius:16px;overflow:hidden}
.export-pdf-topbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:14px 20px}
.export-pdf-topbar-left{display:flex;flex-wrap:wrap;align-items:center;gap:10px;flex:1;min-width:0}
.export-pdf-topbar-actions{margin-left:auto;display:flex;gap:8px;align-items:center;flex-shrink:0}
.export-pdf-toolbar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:10px 20px}
.export-pdf-toolbar-group{display:flex;align-items:center;gap:6px;flex-shrink:0}
.export-pdf-toolbar-prepared{display:flex;align-items:center;gap:6px;margin-left:auto;flex-shrink:0}
.export-pdf-prepared-input{width:170px;box-sizing:border-box}
.export-pdf-meta{display:flex;gap:16px;flex-wrap:wrap;padding:10px 20px}
.export-pdf-notes{padding:8px 20px}
.export-pdf-notes-input{width:100%;max-width:100%;box-sizing:border-box}
.export-pdf-report{padding:28px 32px}
.export-pdf-report-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px;padding-bottom:14px}
.export-pdf-report-head-aside{text-align:right}
.export-pdf-report-head-main{min-width:0}
.export-pdf-kpi-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:18px}
.export-pdf-stage-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.export-pdf-table-wrap{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;margin-bottom:0}
.export-pdf-table-wrap table{min-width:640px}
.export-pdf-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:22px;padding-top:12px}
.export-pdf-footer-note{flex:1;min-width:0}
@media (max-width:991px){
  .export-pdf-overlay{padding:12px 10px}
  .export-pdf-card{border-radius:12px;max-width:100%}
  .export-pdf-topbar{flex-direction:column;align-items:stretch;padding:12px 14px;gap:12px}
  .export-pdf-topbar-left{flex-direction:column;align-items:stretch;gap:10px}
  .export-pdf-topbar-actions{margin-left:0;width:100%}
  .export-pdf-topbar-actions>button:first-of-type{flex:1;min-height:44px}
  .export-pdf-topbar-actions>button:last-of-type{min-width:44px;min-height:44px}
  .export-pdf-toolbar{flex-direction:column;align-items:stretch;padding:10px 14px;gap:10px}
  .export-pdf-toolbar-group{flex-wrap:wrap;width:100%}
  .export-pdf-toolbar-group select{flex:1;min-width:0;max-width:100%}
  .export-pdf-toolbar-prepared{margin-left:0;width:100%}
  .export-pdf-prepared-input{width:100%;max-width:100%}
  .export-pdf-meta{padding:10px 14px;gap:12px}
  .export-pdf-notes{padding:8px 14px}
  .export-pdf-report{padding:18px 14px}
  .export-pdf-report-head{flex-direction:column;gap:14px;align-items:flex-start}
  .export-pdf-report-head-aside{text-align:left;align-self:stretch}
  .export-pdf-kpi-grid{grid-template-columns:repeat(3,1fr);gap:10px}
  .export-pdf-stage-grid{grid-template-columns:repeat(3,1fr);gap:10px}
  .export-pdf-footer{flex-direction:column;align-items:flex-start}
}
@media (max-width:600px){
  .export-pdf-kpi-grid{grid-template-columns:repeat(2,1fr)}
  .export-pdf-stage-grid{grid-template-columns:1fr}
}
@media (max-width:400px){
  .export-pdf-overlay{padding:8px 6px}
  .export-pdf-topbar{padding:10px 12px}
  .export-pdf-kpi-grid{grid-template-columns:1fr}
}
@media print{
  .export-pdf-kpi-grid{grid-template-columns:repeat(5,1fr)!important}
  .export-pdf-stage-grid{grid-template-columns:repeat(3,1fr)!important}
  .export-pdf-report-head{flex-direction:row!important;align-items:flex-start!important}
  .export-pdf-report-head-aside{text-align:right!important}
  .export-pdf-footer{flex-direction:row!important;align-items:center!important}
  .export-pdf-table-wrap{overflow:visible!important}
  .export-pdf-table-wrap table{min-width:0!important;width:100%!important}
  .export-pdf-rec-edit-row{display:none!important}
  .export-pdf-rec-text-editor{display:none!important}
  .export-pdf-summary-editor{display:none!important}
  .export-pdf-insights-actions{display:none!important}
  .export-pdf-rec-print-stack{display:flex!important;align-items:flex-start;gap:8px;margin-bottom:8px;break-inside:avoid;page-break-inside:avoid}
  .export-pdf-summary-display{display:block!important}
}
.export-pdf-rec-print-stack{display:none}
.export-pdf-summary-display{display:none}
.export-pdf-insights-preview .export-pdf-rec-print-stack{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;break-inside:avoid;page-break-inside:avoid}
.export-pdf-insights-preview .export-pdf-rec-text-editor,.export-pdf-insights-preview .export-pdf-rec-edit-row{display:none}
.export-pdf-insights-preview .export-pdf-summary-editor{display:none}
.export-pdf-insights-preview .export-pdf-summary-display{display:block}
.export-pdf-rec-text-editor{display:block;width:100%;box-sizing:border-box;font:inherit;line-height:1.6;resize:vertical;min-height:44px;border:1px solid #e2e8f0;border-radius:6px;padding:6px 8px;background:#fff}
.export-pdf-summary-editor{display:block;width:100%;box-sizing:border-box;font:inherit;line-height:1.6;resize:vertical;min-height:56px;border:1px solid #e2e8f0;border-radius:6px;padding:8px 10px;background:#fff;font-size:11px;margin-bottom:2px}
.export-pdf-rec-edit-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:6px;font-size:11px;color:#64748b}
`;

function ExportReportFeature({
  summary,
  config,
  mode,
  exportState,
  onExportStateChange,
  onClose,
  BRAND,
  sel,
}) {
  const safeSummary = summary || null;
  const byWeek = safeSummary?.byWeek || [];
  const byLocation = safeSummary?.byLocation || [];
  const byDepartment = safeSummary?.byDepartment || [];
  const reportRef = useRef(null);
  const [notes, setNotes] = useState("");
  const [preparedBy, setPreparedBy] = useState("Amy Jacobson");
  const updateExportState = (patch) => {
    onExportStateChange((prev) => (prev ? { ...prev, ...patch } : prev));
  };
  const resolvedPeriod = resolveExportPeriod(safeSummary, config, exportState);
  const locIdForExport = exportState?.locId || "All";
  const selectedLocationName =
    locIdForExport === "All"
      ? "All locations"
      : byLocation.find((location) => (location.locationId || location.name) === locIdForExport)
          ?.name || locIdForExport;
  const visibleLocations =
    locIdForExport === "All"
      ? byLocation
      : byLocation.filter((location) => (location.locationId || location.name) === locIdForExport);
  const exportTotals = aggregateWeekRange(safeSummary, resolvedPeriod.weeks, locIdForExport);
  const oE = exportTotals.energy;
  const oB = exportTotals.belief;
  const oC = exportTotals.clarity;
  const oA = exportTotals.avg;
  const totalResponses = exportTotals.n;
  const exportStaff = totalStaffForFilter(safeSummary, locIdForExport);
  const participationPct = exportStaff
    ? Math.min(100, Math.round((totalResponses / exportStaff) * 100))
    : 0;
  const locationRowsForExport = visibleLocations.map((location) =>
    aggregateLocationRange(safeSummary, resolvedPeriod.weeks, location)
  );
  const riskDepts = byDepartment
    .map((dept) => aggregateDepartmentRange(safeSummary, resolvedPeriod.weeks, locIdForExport, dept))
    .filter((dept) => riskFlag(dept.avg));
  const exportInsights = getInsightsAlertsForWeeks(
    safeSummary,
    resolvedPeriod.weeks,
    locIdForExport
  );
  const programRangeLabel =
    config?.programmeStart && config?.programmeEnd
      ? `${config.programmeStart} to ${config.programmeEnd}`
      : config?.programmeStart || "Program dates unavailable";
  const programContext = config?.programName
    ? `${config.programName} · ${programRangeLabel} · ${config?.numWeeks || byWeek.length} weeks`
    : `${programRangeLabel} · ${config?.numWeeks || byWeek.length} weeks`;

  const recommendationSourceKey =
    mode !== "insights"
      ? ""
      : `${locIdForExport}|${(resolvedPeriod.weeks || []).join(",")}|${JSON.stringify(
          exportInsights.map((alert) => ({
            category: alert.category,
            summary: alert.summary,
            recs: alert.recommendations || []
          }))
        )}`;

  const recommendationFlatRows = useMemo(() => {
    if (mode !== "insights") return [];
    return exportInsights.flatMap((alert, insightIndex) =>
      (alert.recommendations || []).map((sourceText, recommendationIndex) => ({
        rowKey: `${insightIndex}-r-${recommendationIndex}`,
        insightIndex,
        recommendationIndex,
        alert,
        sourceText: String(sourceText ?? "")
      }))
    );
  }, [recommendationSourceKey]);

  const [recommendationOverrides, setRecommendationOverrides] = useState({});
  const [insightSummaryOverrides, setInsightSummaryOverrides] = useState({});
  const [insightsViewMode, setInsightsViewMode] = useState("edit");

  useEffect(() => {
    if (mode !== "insights") {
      setRecommendationOverrides({});
      setInsightSummaryOverrides({});
      setInsightsViewMode("edit");
      return;
    }
    const next = {};
    for (const row of recommendationFlatRows) {
      next[row.rowKey] = { included: true, text: row.sourceText };
    }
    setRecommendationOverrides(next);
    const summaries = {};
    exportInsights.forEach((alert, insightIndex) => {
      summaries[insightIndex] = String(alert.summary ?? "");
    });
    setInsightSummaryOverrides(summaries);
    setInsightsViewMode("edit");
  }, [mode, recommendationSourceKey, recommendationFlatRows]);

  const sc = (value) =>
    value == null ? "#94a3b8" : value >= 7 ? "#16a34a" : value >= 4.5 ? "#d97706" : "#dc2626";

  const handlePrint = () => {
    if (!reportRef.current) return;
    const content = reportRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>The Liminal Index — ${config.clientName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
    <style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Nunito Sans',sans-serif;padding:24px;color:#25282A;}@media print{body{padding:0;}}${EXPORT_PDF_LAYOUT_CSS}</style>
    </head><body>${content}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  return (
    <>
      <style>{EXPORT_PDF_LAYOUT_CSS}</style>
      <div
        className="export-pdf-overlay"
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000, overflow: "auto" }}
      >
        <div className="export-pdf-card" style={{ background: "#fff", overflow: "hidden" }}>
          <div className="export-pdf-topbar" style={{ background: BRAND.black, color: "#fff" }}>
            <div className="export-pdf-topbar-left">
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginRight: 8 }}>
                {mode === "dashboard" ? "📊 Dashboard Export" : "💡 Insights Export"}
              </div>
              {["weekly", "monthly", "custom"].map((m) => (
                <button
                  key={m}
                  onClick={() =>
                    updateExportState({
                      periodType: m,
                      monthBlock:
                        m === "monthly"
                          ? resolvedPeriod.selectedMonthBlockId
                          : exportState?.monthBlock || "",
                      startWeek:
                        m === "custom"
                          ? exportState?.startWeek || resolvedPeriod.selectedWeek
                          : exportState?.startWeek || "",
                      endWeek:
                        m === "custom"
                          ? exportState?.endWeek || resolvedPeriod.selectedWeek
                          : exportState?.endWeek || "",
                    })
                  }
                  style={{
                    padding: "5px 12px",
                    borderRadius: 7,
                    border: "none",
                    background: exportState?.periodType === m ? BRAND.blue : "#ffffff20",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="export-pdf-topbar-actions">
              <button
                onClick={handlePrint}
                disabled={
                  !resolvedPeriod.isValid || (mode === "insights" && exportInsights.length > 0 && insightsViewMode === "edit")
                }
                title={
                  mode === "insights" && exportInsights.length > 0 && insightsViewMode === "edit"
                    ? "Save changes on the report first, then use Print / PDF"
                    : undefined
                }
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    resolvedPeriod.isValid &&
                    !(mode === "insights" && exportInsights.length > 0 && insightsViewMode === "edit")
                      ? BRAND.blue
                      : "#94a3b8",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor:
                    resolvedPeriod.isValid &&
                    !(mode === "insights" && exportInsights.length > 0 && insightsViewMode === "edit")
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                🖨 Print / PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "1px solid #ffffff40",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div
            className="export-pdf-toolbar"
            style={{ background: BRAND.lightGrey, borderBottom: `1px solid ${BRAND.border}` }}
          >
          {exportState?.periodType === "weekly" && byWeek.length > 0 && (
            <div className="export-pdf-toolbar-group">
              <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.grey }}>Week:</span>
              <select
                value={resolvedPeriod.selectedWeek}
                onChange={(event) => {
                  const nextWeek = event.target.value;
                  const nextMonthBlock =
                    nextWeek === "All"
                      ? ""
                      : resolvedPeriod.monthBlocks.find((block) => block.weeks.includes(nextWeek))?.id || "";
                  updateExportState({
                    week: nextWeek,
                    monthBlock: nextMonthBlock,
                  });
                }}
                style={{ ...sel, width: "auto", fontSize: 12, padding: "5px 28px 5px 10px" }}
              >
                <option value="All">All</option>
                {byWeek.map((row) => (
                  <option key={row.week} value={row.week}>
                    {row.week}
                  </option>
                ))}
              </select>
            </div>
          )}
          {exportState?.periodType === "monthly" && resolvedPeriod.monthBlocks.length > 0 && (
            <div className="export-pdf-toolbar-group">
              <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.grey }}>Month block:</span>
              <select
                value={resolvedPeriod.selectedMonthBlockId}
                onChange={(event) => updateExportState({ monthBlock: event.target.value })}
                style={{ ...sel, width: "auto", fontSize: 12, padding: "5px 28px 5px 10px" }}
              >
                {resolvedPeriod.monthBlocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {exportState?.periodType === "custom" && byWeek.length > 0 && (
            <>
              <div className="export-pdf-toolbar-group">
                <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.grey }}>From:</span>
                <select
                  value={exportState?.startWeek || ""}
                  onChange={(event) => {
                    updateExportState({ startWeek: event.target.value });
                  }}
                  style={{ ...sel, width: "auto", fontSize: 12, padding: "5px 28px 5px 10px" }}
                >
                  <option value="">Select…</option>
                  {byWeek.map((row) => (
                    <option key={row.week} value={row.week}>
                      {row.week}
                    </option>
                  ))}
                </select>
              </div>
              <div className="export-pdf-toolbar-group">
                <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.grey }}>To:</span>
                <select
                  value={exportState?.endWeek || ""}
                  onChange={(event) => {
                    updateExportState({ endWeek: event.target.value });
                  }}
                  style={{ ...sel, width: "auto", fontSize: 12, padding: "5px 28px 5px 10px" }}
                >
                  <option value="">Select…</option>
                  {byWeek.map((row) => (
                    <option key={row.week} value={row.week}>
                      {row.week}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {byLocation.length > 0 && (
            <div className="export-pdf-toolbar-group">
              <select
                value={locIdForExport}
                onChange={(event) => updateExportState({ locId: event.target.value })}
                style={{ ...sel, width: "auto", fontSize: 12, padding: "5px 28px 5px 10px" }}
              >
                <option value="All">All</option>
                {byLocation.map((location) => {
                  const locationValue = location.locationId || location.name;
                  return (
                    <option key={locationValue} value={locationValue}>
                      {location.name}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
          <div className="export-pdf-toolbar-prepared">
            <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.grey }}>Prepared by:</span>
            <input
              value={preparedBy}
              onChange={(event) => setPreparedBy(event.target.value)}
              className="export-pdf-prepared-input"
              style={{ ...sel, width: undefined, fontSize: 12, padding: "5px 10px" }}
            />
          </div>
        </div>

        <div className="export-pdf-meta" style={{ background: "#fff", borderBottom: `1px solid ${BRAND.border}` }}>
          <div style={{ fontSize: 11, color: BRAND.grey, minWidth: 0, overflowWrap: "anywhere" }}>
            <strong style={{ color: BRAND.black }}>Program:</strong> {programContext}
          </div>
          <div style={{ fontSize: 11, color: BRAND.grey, minWidth: 0, overflowWrap: "anywhere" }}>
            <strong style={{ color: BRAND.black }}>Location:</strong> {selectedLocationName}
          </div>
        </div>

        {!resolvedPeriod.isValid && (
          <div style={{ background: "#fef2f2", borderBottom: "1px solid #fecaca", padding: "10px 20px", fontSize: 12, color: "#b91c1c", fontWeight: 600 }}>
            {resolvedPeriod.validationMessage}
          </div>
        )}

        <div className="export-pdf-notes" style={{ borderBottom: `1px solid ${BRAND.border}`, background: "#fffdf7" }}>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add executive summary notes (optional — appears at top of report)..."
            className="export-pdf-notes-input"
            style={{ ...sel, fontSize: 12, padding: "7px 12px" }}
          />
        </div>

        <div
          ref={reportRef}
          className={`export-pdf-report${mode === "insights" && insightsViewMode === "preview" ? " export-pdf-insights-preview" : ""}`}
          style={{ background: "#fff" }}
        >
          <div
            className="export-pdf-report-head"
            style={{ borderBottom: `3px solid ${BRAND.black}` }}
          >
            <div className="export-pdf-report-head-main">
              <img src={LOGO_LIGHT} alt="Amy Jacobson" style={{ height: 26, width: "auto", marginBottom: 8 }} />
              <div style={{ fontWeight: 800, fontSize: 19, color: BRAND.black, overflowWrap: "anywhere" }}>{mode === "dashboard" ? "Change Intelligence Report" : "Insights & Recommendations Report"}</div>
              <div style={{ fontSize: 12, color: BRAND.grey, marginTop: 3 }}>{config.clientName} · {resolvedPeriod.periodLabel || "Select a date range above"}</div>
              <div style={{ fontSize: 11, color: BRAND.grey, marginTop: 4 }}>{programContext}</div>
              <div style={{ fontSize: 11, color: BRAND.grey, marginTop: 4 }}>Location: {selectedLocationName}</div>
            </div>
            <div className="export-pdf-report-head-aside">
              <div style={{ fontSize: 10, color: BRAND.grey }}>Prepared by</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: BRAND.black }}>{preparedBy}</div>
              <div style={{ fontSize: 10, color: BRAND.grey, marginTop: 2 }}>{new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</div>
              <div style={{ marginTop: 5, fontSize: 10, color: BRAND.blue, fontWeight: 700 }}>The Liminal Index™</div>
            </div>
          </div>

          {notes && <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 9, padding: "10px 14px", marginBottom: 18, fontSize: 12, color: "#374151", lineHeight: 1.7 }}><strong>Executive Notes: </strong>{notes}</div>}

          <div className="export-pdf-kpi-grid">
            {[
              { label: "Participation", val: `${participationPct}%`, color: pctColor(participationPct), sub: `${totalResponses} responses`, bg: `${pctColor(participationPct)}12` },
              { label: "Overall", val: oA != null ? oA.toFixed(1) : "—", color: scoreColor(oA), sub: scoreLabel(oA), bg: `${scoreColor(oA)}12` },
              { label: "Energy ⚡", val: oE != null ? oE.toFixed(1) : "—", color: scoreColor(oE), sub: scoreLabel(oE), bg: BRAND.lightBlue },
              { label: "Belief 💪", val: oB != null ? oB.toFixed(1) : "—", color: scoreColor(oB), sub: scoreLabel(oB), bg: BRAND.lightCoral },
              { label: "Clarity 🎯", val: oC != null ? oC.toFixed(1) : "—", color: scoreColor(oC), sub: scoreLabel(oC), bg: "#f0fdf4" },
            ].map((k) => (
              <div key={k.label} style={{ background: k.bg, borderRadius: 9, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: BRAND.grey, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: k.color, fontFamily: "'Nunito Sans',sans-serif", lineHeight: 1 }}>{k.val}</div>
                <div style={{ fontSize: 9, color: k.color, fontWeight: 600, marginTop: 3 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: BRAND.black, marginBottom: 8 }}>Change Intelligence Stage Pulse</div>
            <div className="export-pdf-stage-grid">
              {[
                { stage: "Stage 1", label: "Owning & Facing the Loss", metric: "Belief 💪", val: oB, color: BRAND.coral },
                { stage: "Stage 2", label: "Through the Liminal", metric: "Clarity 🎯", val: oC, color: BRAND.blue },
                { stage: "Stage 3", label: "Drive the Change", metric: "Energy ⚡", val: oE, color: "#16a34a" },
              ].map((s) => (
                <div key={s.stage} style={{ background: `${s.color}10`, border: `1.5px solid ${s.color}30`, borderRadius: 8, padding: "9px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.8 }}>{s.stage}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: s.color, margin: "4px 0 3px", lineHeight: 1.2 }}>{s.label}</div>
                  <div style={{ fontSize: 8, color: s.color, opacity: 0.65, marginBottom: 6, fontWeight: 600 }}>({s.metric})</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "'Nunito Sans',sans-serif" }}>{s.val != null ? s.val.toFixed(1) : "—"}</div>
                  <div style={{ fontSize: 9, color: scoreColor(s.val), fontWeight: 600, marginTop: 3 }}>{scoreLabel(s.val)}</div>
                </div>
              ))}
            </div>
          </div>

          {mode === "dashboard" && byLocation.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: BRAND.black, marginBottom: 8 }}>
                Scores by Location{" "}
                <span style={{ fontWeight: 500, color: BRAND.grey, fontSize: 10 }}>({resolvedPeriod.periodLabel})</span>
              </div>
              <div className="export-pdf-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ background: BRAND.lightGrey }}>
                    {[["Location", ""], ["Responses", ""], ["Energy ⚡", "Stage 3"], ["Belief 💪", "Stage 1"], ["Clarity 🎯", "Stage 2"], ["Avg", ""], ["Status", ""]].map(([h, sub]) => (
                      <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontSize: 9, fontWeight: 700, color: BRAND.grey, textTransform: "uppercase" }}>{h}{sub && <div style={{ fontSize: 8, color: BRAND.blue, fontWeight: 600, textTransform: "none", letterSpacing: 0, marginTop: 1 }}>{sub}</div>}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {locationRowsForExport.map((row) => (
                    <tr key={row.locationId || row.name} style={{ borderBottom: `1px solid ${BRAND.border}`, background: riskFlag(row.avg) ? "#fff5f5" : "transparent" }}>
                      <td style={{ padding: "6px 10px", fontWeight: 600 }}>{row.name}{riskFlag(row.avg) ? " ⚠" : ""}</td>
                      <td style={{ padding: "6px 10px", color: BRAND.grey }}>{row.n}</td>
                      <td style={{ padding: "6px 10px", color: sc(row.energy), fontWeight: 700 }}>{row.energy != null ? row.energy.toFixed(1) : "—"}</td>
                      <td style={{ padding: "6px 10px", color: sc(row.belief), fontWeight: 700 }}>{row.belief != null ? row.belief.toFixed(1) : "—"}</td>
                      <td style={{ padding: "6px 10px", color: sc(row.clarity), fontWeight: 700 }}>{row.clarity != null ? row.clarity.toFixed(1) : "—"}</td>
                      <td style={{ padding: "6px 10px", color: sc(row.avg), fontWeight: 800 }}>{row.avg != null ? row.avg.toFixed(1) : "—"}</td>
                      <td style={{ padding: "6px 10px", fontWeight: 700, color: scoreColor(row.avg), fontSize: 10 }}>{scoreLabel(row.avg)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {riskDepts.length > 0 && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginTop: 10 }}>
                  <div style={{ fontWeight: 700, color: "#dc2626", fontSize: 11, marginBottom: 4 }}>⚠ At-Risk Departments</div>
                  <div style={{ fontSize: 11, color: "#7f1d1d" }}><strong>{riskDepts.map((d) => d.name).join(", ")}</strong> — scores below 4.5. Immediate leadership attention required before Stage 3 activity.</div>
                </div>
              )}
            </div>
          )}

          {mode === "insights" && exportInsights.length > 0 && (
            <div
              className="export-pdf-insights-actions"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 10,
                marginBottom: 12,
                padding: "10px 12px",
                background: BRAND.lightGrey,
                borderRadius: 8,
                border: `1px solid ${BRAND.border}`,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.black }}>
                {insightsViewMode === "edit" ? "Edit wording below, then save to see the print layout." : "Print layout — matches PDF / printer output."}
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {insightsViewMode === "edit" ? (
                  <button
                    type="button"
                    onClick={() => setInsightsViewMode("preview")}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 8,
                      border: "none",
                      background: "#16a34a",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Save changes
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setInsightsViewMode("edit")}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 8,
                      border: `1px solid ${BRAND.border}`,
                      background: "#fff",
                      color: BRAND.black,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Edit again
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === "insights" && exportInsights.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: BRAND.black, marginBottom: 8 }}>Insights & Recommendations</div>
              {exportInsights.map((alert, index) => (
                <div
                  key={`${alert.category}-${index}`}
                  style={{
                    background: alert.flag === "risk" ? "#fef2f2" : alert.flag === "moderate" ? "#fffbeb" : "#f0fdf4",
                    border: `1px solid ${alert.flag === "risk" ? "#fecaca" : alert.flag === "moderate" ? "#fde68a" : "#bbf7d0"}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    marginBottom: 8,
                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: alert.flag === "risk" ? "#b91c1c" : alert.flag === "moderate" ? "#b45309" : "#166534", marginBottom: 4 }}>{alert.category}</div>
                  <textarea
                    className="export-pdf-summary-editor"
                    value={insightSummaryOverrides[index] ?? String(alert.summary ?? "")}
                    onChange={(event) =>
                      setInsightSummaryOverrides((prev) => ({
                        ...prev,
                        [index]: event.target.value
                      }))
                    }
                    rows={4}
                    aria-label={`Edit summary for ${alert.category}`}
                  />
                  <div
                    className="export-pdf-summary-display"
                    style={{ fontSize: 13, color: "#374151", lineHeight: 1.75, marginBottom: 2, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {insightSummaryOverrides[index] ?? String(alert.summary ?? "")}
                  </div>
                  {alert.recommendations?.length ? (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 10, color: BRAND.grey, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 7 }}>
                        Recommendations
                      </div>
                      {(() => {
                        const recs = alert.recommendations || [];
                        let running = 0;
                        const printNumbers = recs.map((_, j) => {
                          const key = `${index}-r-${j}`;
                          const sourceStr = String(recs[j] ?? "");
                          const occ = recommendationOverrides[key] ?? { included: true, text: sourceStr };
                          if (!occ.included) return null;
                          running += 1;
                          return running;
                        });
                        return recs.map((recommendation, recommendationIndex) => {
                          const rowKey = `${index}-r-${recommendationIndex}`;
                          const sourceStr = String(recommendation ?? "");
                          const o = recommendationOverrides[rowKey] ?? { included: true, text: sourceStr };
                          const printNum = printNumbers[recommendationIndex];
                          return (
                            <div key={rowKey} style={{ marginBottom: 8 }}>
                              <div className="export-pdf-rec-edit-row">
                                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 600, color: BRAND.black }}>
                                  <input
                                    type="checkbox"
                                    checked={o.included}
                                    onChange={(event) => {
                                      const checked = event.target.checked;
                                      setRecommendationOverrides((prev) => {
                                        const prevRow = prev[rowKey];
                                        const text = prevRow?.text ?? sourceStr;
                                        return { ...prev, [rowKey]: { included: checked, text } };
                                      });
                                    }}
                                  />
                                  Include in PDF
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRecommendationOverrides((prev) => ({
                                      ...prev,
                                      [rowKey]: { included: true, text: sourceStr }
                                    }))
                                  }
                                  style={{
                                    border: `1px solid ${BRAND.border}`,
                                    background: "#fff",
                                    color: BRAND.black,
                                    borderRadius: 6,
                                    padding: "4px 10px",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Reset text
                                </button>
                              </div>
                              <textarea
                                className="export-pdf-rec-text-editor"
                                value={o.text}
                                disabled={!o.included}
                                onChange={(event) => {
                                  const text = event.target.value;
                                  setRecommendationOverrides((prev) => ({
                                    ...prev,
                                    [rowKey]: {
                                      included: prev[rowKey]?.included !== false,
                                      text
                                    }
                                  }));
                                }}
                                rows={3}
                                aria-label={`Edit recommendation ${recommendationIndex + 1} for ${alert.category}`}
                              />
                              {o.included ? (
                                <div
                                  className="export-pdf-rec-print-stack"
                                  style={{
                                    alignItems: "flex-start",
                                    marginBottom: 8,
                                    breakInside: "avoid",
                                    pageBreakInside: "avoid",
                                  }}
                                >
                                  <div
                                    style={{
                                      minWidth: 18,
                                      height: 18,
                                      borderRadius: "50%",
                                      background: alert.flag === "risk" ? "#fee2e2" : alert.flag === "moderate" ? "#fef3c7" : "#dcfce7",
                                      color: alert.flag === "risk" ? "#991b1b" : alert.flag === "moderate" ? "#92400e" : "#166534",
                                      fontSize: 9,
                                      fontWeight: 800,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                      marginTop: 1,
                                    }}
                                  >
                                    {printNum}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 10.5,
                                      color: BRAND.black,
                                      lineHeight: 1.6,
                                      minWidth: 0,
                                      overflowWrap: "anywhere",
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    {o.text}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <div className="export-pdf-footer" style={{ borderTop: `1px solid ${BRAND.border}` }}>
            <div className="export-pdf-footer-note" style={{ fontSize: 9, color: BRAND.grey }}>
              The Liminal Index™ · Amy Jacobson Change Intelligence System · All data is anonymous and confidential
            </div>
            <img src={LOGO_LIGHT} alt="Amy Jacobson" style={{ height: 16, width: "auto", flexShrink: 0 }} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default ExportReportFeature;
