import React from "react";
import {
  pctColor,
  pctLabel,
  scoreColor,
  scoreLabel,
  riskFlag,
  trendArrow,
} from "../utils";
import {
  getTopRiskAlerts,
  kpiCardTrendDirections,
  resolveCell,
  resolveDepartmentRow,
  resolveLocationParticipationRow,
  sparkTrendsForDepartmentRow,
  sparkTrendsForLocationRow,
  totalStaffForFilter,
  weeklyTrendTableRows,
} from "../filters";
import { DASHBOARD_PAGE_RESPONSIVE_CSS } from "../dashboardPageResponsiveCss";

const Badge = ({ value, size = "md" }) => {
  const color = scoreColor(value);
  const fontSize = size === "sm" ? 11 : 14;
  const padding = size === "sm" ? "2px 8px" : "4px 12px";
  return (
    <span
      style={{
        background: `${color}18`,
        color,
        border: `1.5px solid ${color}35`,
        borderRadius: 20,
        padding,
        fontSize,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {value != null ? value.toFixed(1) : "—"}
    </span>
  );
};

const ParticipationBar = ({ n, total, label, BRAND }) => {
  const pct = total ? Math.min(100, Math.round((n / total) * 100)) : 0;
  const color = pctColor(pct);
  return (
    <div style={{ marginBottom: 8 }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            marginBottom: 3,
          }}
        >
          <span style={{ fontWeight: 600, color: BRAND.black }}>{label}</span>
          <span style={{ color, fontWeight: 700 }}>
            {n}/{total} · {pct}%{" "}
            <span style={{ fontWeight: 500, color: BRAND.grey, fontSize: 10 }}>
              ({pctLabel(pct)})
            </span>
          </span>
        </div>
      )}
      <div
        style={{
          background: "#e2e8f0",
          borderRadius: 6,
          height: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 6,
          }}
        />
      </div>
    </div>
  );
};

function trendDirGlyph(dir) {
  if (!dir) return null;
  const icon = dir === "up" ? "↑" : dir === "down" ? "↓" : "→";
  const color = dir === "up" ? "#16a34a" : dir === "down" ? "#dc2626" : "#d97706";
  return (
    <span style={{ color, fontWeight: 700, marginLeft: 4, fontSize: 12 }} aria-hidden>
      {icon}
    </span>
  );
}

function alertSummaryPreview(summary) {
  if (!summary || typeof summary !== "string") return "";
  const sentenceEnd = summary.search(/\.\s+/);
  if (sentenceEnd === -1) return summary;
  return summary.slice(0, sentenceEnd + 1);
}

function DashboardFeature({
  summary,
  config,
  onExport,
  BRAND,
  card,
  sel,
  filterWeek,
  filterLocId,
  onFilterWeekChange,
  onFilterLocIdChange,
}) {
  const safeSummary = summary || null;
  const totals = safeSummary?.totals || {
    responses: 0,
    totalStaff: 0,
    participationPct: 0,
    label: null,
  };
  const byWeek = safeSummary?.byWeek || [];
  const byLocation = safeSummary?.byLocation || [];
  const byDepartment = safeSummary?.byDepartment || [];
  const isEmpty = totals.responses === 0 || safeSummary?.hasData === false;
  const emptyMessage = safeSummary?.message || "No check-ins yet";

  const resolved = resolveCell(safeSummary, filterWeek, filterLocId);
  const oE = resolved.energy ?? null;
  const oB = resolved.belief ?? null;
  const oC = resolved.clarity ?? null;
  const oA = resolved.avg ?? null;

  const staffForParticipation = totalStaffForFilter(safeSummary, filterLocId);
  const participationData = {
    n: resolved.n,
    total: staffForParticipation,
    pct:
      staffForParticipation > 0
        ? Math.min(100, Math.round((resolved.n / staffForParticipation) * 100))
        : 0,
  };
  const participationPct = participationData.pct;

  const trendSeries = kpiCardTrendDirections(safeSummary, filterWeek, filterLocId);
  const oD = trendSeries.avg;
  const eD = trendSeries.energy;
  const bD = trendSeries.belief;
  const cD = trendSeries.clarity;

  const topAlerts = getTopRiskAlerts(safeSummary, filterWeek, filterLocId);

  const selectedLocationName =
    filterLocId !== "All"
      ? byLocation.find((row) => String(row.locationId || row.name) === String(filterLocId))?.name
      : null;
  const locationsForFilteredTables =
    filterLocId === "All"
      ? byLocation
      : byLocation.filter((row) => String(row.locationId || row.name) === String(filterLocId));
  const filterContextSubtitle =
    filterWeek !== "All" || filterLocId !== "All"
      ? [
          filterWeek === "All" ? "All weeks" : filterWeek,
          filterLocId === "All" ? "all locations" : selectedLocationName || "Selected location",
        ].join(" · ")
      : null;
  const trendRows = weeklyTrendTableRows(safeSummary, filterLocId);

  return (
    <>
      <style>{DASHBOARD_PAGE_RESPONSIVE_CSS}</style>
      <div className="liminal-page-shell">
      <div className="liminal-page-head">
        <h2 className="liminal-page-head-title" style={{ color: BRAND.black }}>
          Dashboard
        </h2>
        <button
          type="button"
          className="liminal-page-head-btn"
          onClick={() => onExport("dashboard")}
          style={{ background: BRAND.blue, color: "#fff" }}
        >
          📄 Export Report
        </button>
      </div>
      <p style={{ color: BRAND.grey, fontSize: 12, marginBottom: 16 }}>
        {config.clientName} · The Liminal Index Change Intelligence System
      </p>
      {isEmpty && (
        <div
          style={{
            background: BRAND.lightBlue,
            border: `1px solid ${BRAND.blue}30`,
            borderRadius: 11,
            padding: "10px 14px",
            marginBottom: 14,
            fontSize: 12,
            color: BRAND.blue,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 700 }}>{emptyMessage}</span>
          <span style={{ color: BRAND.grey, fontWeight: 500 }}>
            — showing the dashboard layout with empty values. Cards will populate
            automatically once staff submit weekly check-ins.
          </span>
        </div>
      )}
      <div className="liminal-page-filters" style={{ marginBottom: 16 }}>
        <div className="liminal-page-filter-group">
          <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.grey }}>Week:</span>
          <select
            value={filterWeek}
            onChange={(event) => onFilterWeekChange(event.target.value)}
            style={{ ...sel, width: undefined, fontSize: 12, padding: "6px 10px" }}
          >
            {["All", ...byWeek.map((row) => row.week)].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="liminal-page-filter-group">
          <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.grey }}>Location:</span>
          <select
            value={filterLocId}
            onChange={(event) => onFilterLocIdChange(event.target.value)}
            style={{ ...sel, width: undefined, fontSize: 12, padding: "6px 10px" }}
          >
            <option value="All">All</option>
            {byLocation.map((row) => (
              <option key={row.locationId || row.name} value={row.locationId || row.name}>
                {row.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ ...card, padding: "16px 18px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black }}>
            👥 Participation Rate
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: pctColor(participationPct),
                fontFamily: "'Nunito Sans',sans-serif",
              }}
            >
              {participationPct}%
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: pctColor(participationPct),
                background: `${pctColor(participationPct)}18`,
                padding: "2px 8px",
                borderRadius: 8,
              }}
            >
              {pctLabel(participationPct)}
            </span>
          </div>
        </div>
        <ParticipationBar n={participationData.n} total={participationData.total} BRAND={BRAND} />
        <div style={{ fontSize: 11, color: BRAND.grey, marginTop: 6 }}>
          {participationData.n} responses from ~{participationData.total} staff
          {selectedLocationName ? ` at ${selectedLocationName}` : ""}
          {filterWeek !== "All" ? ` in ${filterWeek}` : ""}
        </div>
        {participationPct < 30 && (
          <div
            style={{
              fontSize: 11,
              color: "#dc2626",
              fontWeight: 600,
              marginTop: 5,
            }}
          >
            ⚠ Low participation — data may not be representative
          </div>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {[
          { label: "Overall", val: oA, color: BRAND.black, bg: BRAND.lightGrey, dir: oD },
          { label: "Energy ⚡", val: oE, color: BRAND.blue, bg: BRAND.lightBlue, dir: eD },
          { label: "Belief 💪", val: oB, color: BRAND.coral, bg: BRAND.lightCoral, dir: bD },
          { label: "Clarity 🎯", val: oC, color: "#16a34a", bg: "#f0fdf4", dir: cD },
        ].map(({ label, val, color, bg, dir }) => {
          const ta = dir ? trendArrow(dir) : null;
          return (
            <div
              key={label}
              style={{
                background: bg,
                border: `1.5px solid ${color}22`,
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: BRAND.grey,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.7,
                  marginBottom: 6,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color,
                  fontFamily: "'Nunito Sans',sans-serif",
                  lineHeight: 1,
                }}
              >
                {val != null ? val.toFixed(1) : "—"}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 5,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 11, color: scoreColor(val), fontWeight: 600 }}>
                  {scoreLabel(val)}
                </span>
                {ta && ta.label && (
                  <span style={{ fontSize: 11, color: ta.color, fontWeight: 700 }}>
                    {ta.icon} {ta.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {topAlerts.length > 0 && (
        <div
          style={{
            background: "#fef2f2",
            border: "1.5px solid #fecaca",
            borderRadius: 11,
            padding: "12px 16px",
            marginBottom: 14,
          }}
        >
          <div style={{ fontWeight: 700, color: "#dc2626", fontSize: 13, marginBottom: 6 }}>
            ⚠ Key Alerts — see Insights tab for full detail
          </div>
          {topAlerts.map((alert, index) => (
            <div
              key={`${alert.category}-${index}`}
              style={{
                fontSize: 12,
                color: "#7f1d1d",
                lineHeight: 1.6,
                marginBottom: index < topAlerts.length - 1 ? 4 : 0,
              }}
            >
              <strong>{alert.category}:</strong> {alertSummaryPreview(alert.summary)}
            </div>
          ))}
        </div>
      )}
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black, marginBottom: 12 }}>
          Change Intelligence Stage Pulse
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {[
            {
              stage: "Stage 1",
              label: "Owning & Facing the Loss",
              metric: "Belief 💪",
              val: oB,
              color: BRAND.coral,
              trendDir: bD,
            },
            {
              stage: "Stage 2",
              label: "Through the Liminal",
              metric: "Clarity 🎯",
              val: oC,
              color: BRAND.blue,
              trendDir: cD,
            },
            {
              stage: "Stage 3",
              label: "Drive the Change",
              metric: "Energy ⚡",
              val: oE,
              color: "#16a34a",
              trendDir: eD,
            },
          ].map(({ stage, label, metric, val, color, trendDir }) => (
            <div
              key={stage}
              style={{
                background: `${color}10`,
                border: `1.5px solid ${color}30`,
                borderRadius: 9,
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  opacity: 0.8,
                }}
              >
                {stage}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color,
                  margin: "4px 0 3px",
                  lineHeight: 1.2,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color,
                  opacity: 0.65,
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                ({metric})
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color,
                  fontFamily: "'Nunito Sans',sans-serif",
                }}
              >
                {val != null ? val.toFixed(1) : "—"}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: scoreColor(val),
                  fontWeight: 600,
                  marginTop: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <span>{scoreLabel(val)}</span>
                {(() => {
                  const ta = trendDir ? trendArrow(trendDir) : null;
                  return ta ? (
                    <span style={{ color: ta.color, fontWeight: 700, marginLeft: 2 }}>{ta.icon}</span>
                  ) : null;
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black, marginBottom: 12 }}>
          Participation by Location
        </div>
        {filterContextSubtitle ? (
          <div style={{ fontSize: 11, color: BRAND.grey, marginBottom: 10 }}>
            Filtered view: {filterContextSubtitle}
            {filterLocId !== "All" ? " — other locations hidden while a location is selected above." : ""}
          </div>
        ) : null}
        {byLocation.length === 0 ? (
          <div style={{ fontSize: 12, color: BRAND.grey, padding: "8px 4px" }}>
            No locations configured yet.
          </div>
        ) : locationsForFilteredTables.length === 0 ? (
          <div style={{ fontSize: 12, color: BRAND.grey, padding: "8px 4px" }}>
            No location matches the selected location filter.
          </div>
        ) : (
          locationsForFilteredTables.map((row) => {
            const pr = resolveLocationParticipationRow(safeSummary, row, filterWeek);
            return (
              <ParticipationBar
                key={row.locationId || row.name}
                n={pr.n}
                total={row.staff}
                label={row.name}
                BRAND={BRAND}
              />
            );
          })
        )}
        <div style={{ fontSize: 10, color: BRAND.grey, marginTop: 6 }}>
          Green ≥60% · Amber 30–59% · Red &lt;30%
        </div>
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black, marginBottom: 10 }}>
          Weekly Trend
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: BRAND.lightGrey }}>
                {[
                  ["Week", ""],
                  ["Dates", ""],
                  ["Resp", ""],
                  ["Energy ⚡", "Stage 3"],
                  ["Belief 💪", "Stage 1"],
                  ["Clarity 🎯", "Stage 2"],
                  ["Avg", ""],
                ].map(([h, sub]) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 10px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      color: BRAND.grey,
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                    {sub && (
                      <div
                        style={{
                          fontSize: 9,
                          color: BRAND.blue,
                          fontWeight: 600,
                          textTransform: "none",
                          letterSpacing: 0,
                          marginTop: 1,
                        }}
                      >
                        {sub}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byWeek.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "10px 4px", color: BRAND.grey, fontSize: 12 }}>
                    Program weeks will appear once a program is configured.
                  </td>
                </tr>
              ) : (
                trendRows.map((row) => (
                    <tr key={row.week} style={{ borderBottom: `1px solid ${BRAND.border}` }}>
                      <td style={{ padding: "8px 10px", fontWeight: 600 }}>{row.week}</td>
                      <td style={{ padding: "8px 10px", color: BRAND.grey, fontSize: 10 }}>
                        {row.dates ? `${row.dates.start}–${row.dates.end}` : ""}
                      </td>
                      <td style={{ padding: "8px 10px", color: BRAND.grey }}>{row.n}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <Badge value={row.energy} size="sm" />
                        {trendDirGlyph(row.trendEnergy)}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <Badge value={row.belief} size="sm" />
                        {trendDirGlyph(row.trendBelief)}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <Badge value={row.clarity} size="sm" />
                        {trendDirGlyph(row.trendClarity)}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <Badge value={row.avg} size="sm" />
                        {trendDirGlyph(row.trend)}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black, marginBottom: 10 }}>
          Scores by Location
        </div>
        {filterContextSubtitle ? (
          <div style={{ fontSize: 11, color: BRAND.grey, marginBottom: 10 }}>
            Filtered view: {filterContextSubtitle}
            {filterLocId !== "All" ? " — only the selected location is listed." : ""}
          </div>
        ) : null}
        {byLocation.length === 0 ? (
          <div style={{ fontSize: 12, color: BRAND.grey, padding: "8px 4px" }}>
            No locations configured yet.
          </div>
        ) : locationsForFilteredTables.length === 0 ? (
          <div style={{ fontSize: 12, color: BRAND.grey, padding: "8px 4px" }}>
            No location matches the selected location filter.
          </div>
        ) : (
          locationsForFilteredTables.map((row) => {
            const locId = row.locationId || row.name;
            const cell = resolveCell(safeSummary, filterWeek, locId);
            const isAtRisk = riskFlag(cell.avg);
            const locSpark = sparkTrendsForLocationRow(safeSummary, filterWeek, locId);
            return (
              <div
                key={row.locationId || row.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                  padding: "10px 12px",
                  background: isAtRisk ? "#fff5f5" : BRAND.lightGrey,
                  borderRadius: 9,
                  border: `1px solid ${isAtRisk ? "#fecaca" : BRAND.border}`,
                  marginBottom: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: BRAND.black }}>{row.name}</div>
                  <div style={{ fontSize: 11, color: BRAND.grey }}>{cell.n} responses</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {[
                    { l: "Energy", v: cell.energy, dir: locSpark.energy },
                    { l: "Belief", v: cell.belief, dir: locSpark.belief },
                    { l: "Clarity", v: cell.clarity, dir: locSpark.clarity },
                  ].map(({ l, v, dir }) => (
                    <div key={l} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: BRAND.grey, fontWeight: 600, marginBottom: 1 }}>
                        {l}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Badge value={v} size="sm" />
                        {trendDirGlyph(dir)}
                      </div>
                    </div>
                  ))}
                  <div
                    style={{
                      textAlign: "center",
                      borderLeft: `1px solid ${BRAND.border}`,
                      paddingLeft: 8,
                    }}
                  >
                    <div style={{ fontSize: 9, color: BRAND.grey, fontWeight: 600, marginBottom: 1 }}>
                      Avg
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Badge value={cell.avg} size="sm" />
                      {trendDirGlyph(locSpark.avg)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black, marginBottom: 4 }}>
          By Department
        </div>
        <p style={{ fontSize: 11, color: BRAND.grey, marginBottom: 10 }}>
          Sorted lowest → highest — at-risk first
        </p>
        {filterContextSubtitle ? (
          <div style={{ fontSize: 11, color: BRAND.grey, marginBottom: 10 }}>
            Scores use the Week and Location filters above ({filterContextSubtitle}). Trend arrows compare
            to the previous program week when that slice had data; if the prior week had no responses for
            this department at this location, no arrow is shown.
          </div>
        ) : null}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: BRAND.lightGrey }}>
                {[
                  ["Department", ""],
                  ["n", ""],
                  ["Energy ⚡", "Stage 3"],
                  ["Belief 💪", "Stage 1"],
                  ["Clarity 🎯", "Stage 2"],
                  ["Avg", ""],
                  ["Status", ""],
                ].map(([h]) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 10px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      color: BRAND.grey,
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {byDepartment.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "10px 4px", color: BRAND.grey, fontSize: 12 }}>
                    No departments configured yet.
                  </td>
                </tr>
              ) : (
                [...byDepartment]
                  .map((dept) => ({
                    dept,
                    row: resolveDepartmentRow(safeSummary, filterWeek, filterLocId, dept),
                  }))
                  .sort((a, b) => {
                    const aAvg = a.row.avg ?? Number.POSITIVE_INFINITY;
                    const bAvg = b.row.avg ?? Number.POSITIVE_INFINITY;
                    return aAvg - bAvg;
                  })
                  .map(({ dept, row }) => {
                    const deptSpark = sparkTrendsForDepartmentRow(
                      safeSummary,
                      filterWeek,
                      filterLocId,
                      dept
                    );
                    return (
                    <tr
                      key={row.departmentId || row.name}
                      style={{
                        borderBottom: `1px solid ${BRAND.border}`,
                        background: row.atRisk ? "#fff5f5" : "transparent",
                      }}
                    >
                      <td style={{ padding: "8px 10px", fontWeight: 600 }}>
                        {row.name}
                        {row.atRisk ? " ⚠" : ""}
                      </td>
                      <td style={{ padding: "8px 10px", color: BRAND.grey }}>{row.n}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
                          <Badge value={row.energy} size="sm" />
                          {trendDirGlyph(deptSpark.energy)}
                        </div>
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
                          <Badge value={row.belief} size="sm" />
                          {trendDirGlyph(deptSpark.belief)}
                        </div>
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
                          <Badge value={row.clarity} size="sm" />
                          {trendDirGlyph(deptSpark.clarity)}
                        </div>
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
                          <Badge value={row.avg} size="sm" />
                          {trendDirGlyph(deptSpark.avg)}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          fontWeight: 700,
                          color: scoreColor(row.avg),
                          fontSize: 11,
                        }}
                      >
                        {scoreLabel(row.avg)}
                      </td>
                    </tr>
                  );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}

export default DashboardFeature;
