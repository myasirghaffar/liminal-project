import { pctLabel, scoreLabel } from "./utils";
import { buildAlerts } from "./alerts";

export const NULL_AGG = { n: 0, energy: null, belief: null, clarity: null, avg: null };

export function resolveCell(summary, week, locationId) {
  if (!summary) return NULL_AGG;
  if (week === "All" && locationId === "All") {
    return {
      n: summary.totals?.responses ?? 0,
      energy: summary.overall?.energy ?? null,
      belief: summary.overall?.belief ?? null,
      clarity: summary.overall?.clarity ?? null,
      avg: summary.overall?.avg ?? null
    };
  }
  if (week !== "All" && locationId === "All") {
    const row = summary.byWeek?.find((w) => w.week === week);
    return row
      ? { n: row.n, energy: row.energy, belief: row.belief, clarity: row.clarity, avg: row.avg }
      : NULL_AGG;
  }
  if (week === "All" && locationId !== "All") {
    const row = summary.byLocation?.find((l) => l.locationId === locationId);
    return row
      ? { n: row.n, energy: row.energy, belief: row.belief, clarity: row.clarity, avg: row.avg }
      : NULL_AGG;
  }
  const cell = summary.byWeekLocation?.find((c) => c.week === week && c.locationId === locationId);
  return cell
    ? { n: cell.n, energy: cell.energy, belief: cell.belief, clarity: cell.clarity, avg: cell.avg }
    : NULL_AGG;
}

export function resolveWeeklyTrendRow(summary, weekLabel, locationId) {
  if (!summary) return NULL_AGG;
  if (locationId === "All") {
    const row = summary.byWeek?.find((w) => w.week === weekLabel);
    return row
      ? { n: row.n, energy: row.energy, belief: row.belief, clarity: row.clarity, avg: row.avg }
      : NULL_AGG;
  }
  const cell = summary.byWeekLocation?.find((c) => c.week === weekLabel && c.locationId === locationId);
  return cell
    ? { n: cell.n, energy: cell.energy, belief: cell.belief, clarity: cell.clarity, avg: cell.avg }
    : NULL_AGG;
}

export function resolveLocationParticipationRow(summary, location, weekLabel) {
  if (!summary || !location) return { ...location, n: 0, pct: 0 };
  const locId = location.locationId;
  let cell;
  if (weekLabel === "All") {
    cell = summary.byLocation?.find((l) => l.locationId === locId);
  } else {
    cell = summary.byWeekLocation?.find((c) => c.week === weekLabel && c.locationId === locId);
  }
  const n = cell?.n ?? 0;
  const staff = location.staff ?? 0;
  const pct = staff ? Math.min(100, Math.round((n / staff) * 100)) : 0;
  return { ...location, n, pct };
}

export function resolveDepartmentRow(summary, week, locationId, dept) {
  const id = dept?.departmentId ?? dept?.id;
  if (!summary || !dept || id == null) {
    return {
      departmentId: id,
      name: dept?.name,
      n: 0,
      energy: null,
      belief: null,
      clarity: null,
      avg: null,
      atRisk: false,
      scoreLabel: scoreLabel(null)
    };
  }
  if (week === "All" && locationId === "All") {
    const row = summary.byDepartment?.find((d) => d.departmentId === id);
    if (!row) {
      return {
        departmentId: id,
        name: dept.name,
        n: 0,
        energy: null,
        belief: null,
        clarity: null,
        avg: null,
        atRisk: false,
        scoreLabel: scoreLabel(null)
      };
    }
    return { ...row };
  }
  let agg = NULL_AGG;
  if (week !== "All" && locationId === "All") {
    agg =
      summary.byWeekDepartment?.find((c) => c.week === week && c.departmentId === id) || NULL_AGG;
  } else if (week === "All" && locationId !== "All") {
    agg =
      summary.byLocationDepartment?.find(
        (c) => c.locationId === locationId && c.departmentId === id
      ) || NULL_AGG;
  } else {
    agg =
      summary.byWeekLocationDepartment?.find(
        (c) => c.week === week && c.locationId === locationId && c.departmentId === id
      ) || NULL_AGG;
  }
  const avgVal = agg.avg;
  const atRisk = avgVal != null && avgVal < 4.5;
  return {
    departmentId: id,
    name: dept.name,
    n: agg.n,
    energy: agg.energy,
    belief: agg.belief,
    clarity: agg.clarity,
    avg: avgVal,
    atRisk,
    scoreLabel: scoreLabel(avgVal)
  };
}

export function totalStaffForFilter(summary, locationId) {
  if (!summary) return 0;
  if (locationId === "All") return summary.totals?.totalStaff ?? 0;
  const loc = summary.byLocation?.find((l) => l.locationId === locationId);
  return loc?.staff ?? 0;
}

function weightedAvg(entries, key) {
  let sum = 0;
  let count = 0;

  entries.forEach((entry) => {
    if (entry[key] != null && entry.n > 0) {
      sum += entry[key] * entry.n;
      count += entry.n;
    }
  });

  return count ? sum / count : null;
}

function averageFromTriplet(energy, belief, clarity, fallbackAvg) {
  if (energy != null && belief != null && clarity != null) {
    return (energy + belief + clarity) / 3;
  }
  return fallbackAvg;
}

export function buildProgramMonthBlocks(summary, numWeeks) {
  const weekRows = summary?.byWeek || [];
  const totalWeeks = weekRows.length || Math.max(Number(numWeeks) || 0, 0);
  const blocks = [];

  for (let index = 0; index < totalWeeks; index += 4) {
    const startIndex = index;
    const endIndex = Math.min(index + 3, totalWeeks - 1);
    const rows = weekRows.slice(startIndex, endIndex + 1);
    if (!rows.length) continue;

    blocks.push({
      id: `block-${startIndex + 1}-${endIndex + 1}`,
      label: `Weeks ${startIndex + 1}-${endIndex + 1}`,
      startWeek: rows[0].week,
      endWeek: rows[rows.length - 1].week,
      weeks: rows.map((row) => row.week),
    });
  }

  return blocks;
}

export function resolveExportPeriod(summary, config, exportState) {
  const weekRows = summary?.byWeek || [];
  const weeks = weekRows.map((row) => row.week);
  const periodType = exportState?.periodType || "weekly";
  const allWeeksSelected = exportState?.week === "All";
  const defaultWeek = allWeeksSelected
    ? "All"
    : weeks.includes(exportState?.week)
      ? exportState.week
      : weeks[weeks.length - 1] || "";
  const monthBlocks = buildProgramMonthBlocks(summary, config?.numWeeks);
  const fallbackMonthBlock =
    monthBlocks.find((block) => block.weeks.includes(defaultWeek)) ||
    monthBlocks[monthBlocks.length - 1] ||
    null;
  const selectedMonthBlock =
    monthBlocks.find((block) => block.id === exportState?.monthBlock) || fallbackMonthBlock;

  if (!weekRows.length) {
    return {
      periodType,
      weeks: [],
      weekRows: [],
      selectedWeek: "",
      monthBlocks,
      selectedMonthBlockId: selectedMonthBlock?.id || "",
      periodLabel: "No program weeks available",
      isValid: false,
      validationMessage: "No program weeks are available for export yet.",
    };
  }

  if (periodType === "weekly") {
    if (defaultWeek === "All") {
      return {
        periodType,
        weeks,
        weekRows,
        selectedWeek: "All",
        monthBlocks,
        selectedMonthBlockId: selectedMonthBlock?.id || "",
        periodLabel: "All weeks",
        isValid: Boolean(weekRows.length),
        validationMessage: weekRows.length ? "" : "Choose a valid week to export.",
      };
    }
    const selectedRow = weekRows.find((row) => row.week === defaultWeek) || null;
    return {
      periodType,
      weeks: selectedRow ? [selectedRow.week] : [],
      weekRows: selectedRow ? [selectedRow] : [],
      selectedWeek: defaultWeek,
      monthBlocks,
      selectedMonthBlockId: selectedMonthBlock?.id || "",
      periodLabel: selectedRow
        ? `${selectedRow.week} · ${selectedRow.dates?.start || ""} – ${selectedRow.dates?.end || ""}`
        : "Select a week",
      isValid: Boolean(selectedRow),
      validationMessage: selectedRow ? "" : "Choose a valid week to export.",
    };
  }

  if (periodType === "monthly") {
    return {
      periodType,
      weeks: selectedMonthBlock?.weeks || [],
      weekRows: weekRows.filter((row) => selectedMonthBlock?.weeks.includes(row.week)),
      selectedWeek: defaultWeek,
      monthBlocks,
      selectedMonthBlockId: selectedMonthBlock?.id || "",
      periodLabel: selectedMonthBlock
        ? `${selectedMonthBlock.label} · ${selectedMonthBlock.startWeek} – ${selectedMonthBlock.endWeek}`
        : "Select a month block",
      isValid: Boolean(selectedMonthBlock?.weeks?.length),
      validationMessage: selectedMonthBlock
        ? ""
        : "Choose a valid month block for this program.",
    };
  }

  const startWeek = exportState?.startWeek || "";
  const endWeek = exportState?.endWeek || "";
  if (!startWeek || !endWeek) {
    return {
      periodType,
      weeks: [],
      weekRows: [],
      selectedWeek: defaultWeek,
      monthBlocks,
      selectedMonthBlockId: selectedMonthBlock?.id || "",
      periodLabel: "Custom range",
      isValid: false,
      validationMessage: "Choose both a start and end week.",
    };
  }

  const startIndex = weeks.indexOf(startWeek);
  const endIndex = weeks.indexOf(endWeek);
  if (startIndex < 0 || endIndex < 0) {
    return {
      periodType,
      weeks: [],
      weekRows: [],
      selectedWeek: defaultWeek,
      monthBlocks,
      selectedMonthBlockId: selectedMonthBlock?.id || "",
      periodLabel: "Custom range",
      isValid: false,
      validationMessage: "Choose weeks from the current program only.",
    };
  }

  if (startIndex > endIndex) {
    return {
      periodType,
      weeks: [],
      weekRows: [],
      selectedWeek: defaultWeek,
      monthBlocks,
      selectedMonthBlockId: selectedMonthBlock?.id || "",
      periodLabel: "Custom range",
      isValid: false,
      validationMessage: "Start week must come before end week.",
    };
  }

  const selectedRows = weekRows.slice(startIndex, endIndex + 1);
  return {
    periodType,
    weeks: selectedRows.map((row) => row.week),
    weekRows: selectedRows,
    selectedWeek: defaultWeek,
    monthBlocks,
    selectedMonthBlockId: selectedMonthBlock?.id || "",
    periodLabel: `${startWeek} – ${endWeek} (Custom)`,
    isValid: Boolean(selectedRows.length),
    validationMessage: selectedRows.length ? "" : "Choose a valid custom range.",
  };
}

export function aggregateWeekRange(summary, weekLabels, locationId = "All") {
  if (!summary || !Array.isArray(weekLabels) || !weekLabels.length) return { ...NULL_AGG };

  const cells = weekLabels.map((week) => resolveCell(summary, week, locationId));
  const energy = weightedAvg(cells, "energy");
  const belief = weightedAvg(cells, "belief");
  const clarity = weightedAvg(cells, "clarity");

  return {
    n: cells.reduce((sum, row) => sum + row.n, 0),
    energy,
    belief,
    clarity,
    avg: averageFromTriplet(energy, belief, clarity, weightedAvg(cells, "avg")),
  };
}

export function aggregateDepartmentRange(summary, weekLabels, locationId, dept) {
  if (!Array.isArray(weekLabels) || !weekLabels.length) {
    return resolveDepartmentRow(summary, "All", locationId, dept);
  }

  const rows = weekLabels.map((week) => resolveDepartmentRow(summary, week, locationId, dept));
  const energy = weightedAvg(rows, "energy");
  const belief = weightedAvg(rows, "belief");
  const clarity = weightedAvg(rows, "clarity");
  const avg = averageFromTriplet(energy, belief, clarity, weightedAvg(rows, "avg"));

  return {
    departmentId: dept?.departmentId ?? dept?.id,
    name: dept?.name,
    n: rows.reduce((sum, row) => sum + row.n, 0),
    energy,
    belief,
    clarity,
    avg,
    atRisk: avg != null && avg < 4.5,
    scoreLabel: scoreLabel(avg),
  };
}

export function aggregateLocationRange(summary, weekLabels, location) {
  const locId = location?.locationId || location?.name;
  return { ...location, ...aggregateWeekRange(summary, weekLabels, locId) };
}

export function getAlertBuildInputsForWeeks(summary, weekLabels, filterLocId) {
  if (!summary || !Array.isArray(weekLabels) || !weekLabels.length) return null;

  const overall = aggregateWeekRange(summary, weekLabels, filterLocId);
  const totalStaff = totalStaffForFilter(summary, filterLocId);
  const participationPct =
    totalStaff > 0 ? Math.min(100, Math.round((overall.n / totalStaff) * 100)) : 0;

  const byWeek = weekLabels
    .map((week) => {
      const base = summary.byWeek?.find((row) => row.week === week);
      const row = resolveWeeklyTrendRow(summary, week, filterLocId);
      if (!base) return null;
      return {
        ...base,
        n: row.n,
        energy: row.energy,
        belief: row.belief,
        clarity: row.clarity,
        avg: row.avg,
        trend: null,
      };
    })
    .filter(Boolean);

  return {
    totals: {
      responses: overall.n,
      totalStaff,
      participationPct,
      label: totalStaff > 0 ? pctLabel(participationPct) : null,
    },
    overall: {
      energy: overall.energy,
      belief: overall.belief,
      clarity: overall.clarity,
      avg: overall.avg,
      label: null,
    },
    byWeek,
    byLocation: summary.byLocation || [],
    byDepartment: (summary.byDepartment || []).map((dept) =>
      aggregateDepartmentRange(summary, weekLabels, filterLocId, dept)
    ),
  };
}

export function getInsightsAlertsForWeeks(summary, weekLabels, filterLocId) {
  const inputs = getAlertBuildInputsForWeeks(summary, weekLabels, filterLocId);
  if (!inputs) return [];
  return buildAlerts(inputs);
}

export function getAlertBuildInputs(summary, filterWeek, filterLocId) {
  if (!summary) return null;
  const cell = resolveCell(summary, filterWeek, filterLocId);
  const totalStaff = totalStaffForFilter(summary, filterLocId);
  const responses = cell.n;
  const participationPct =
    totalStaff > 0 ? Math.min(100, Math.round((responses / totalStaff) * 100)) : 0;

  const totals = {
    responses,
    totalStaff,
    participationPct,
    label: totalStaff > 0 ? pctLabel(participationPct) : null
  };

  const overall = {
    energy: cell.energy,
    belief: cell.belief,
    clarity: cell.clarity,
    avg: cell.avg,
    label: null
  };

  const byDepartment = (summary.byDepartment || []).map((d) =>
    resolveDepartmentRow(summary, filterWeek, filterLocId, d)
  );

  const baseWeeks = summary.byWeek || [];
  let byWeek;
  if (filterLocId === "All") {
    if (filterWeek === "All") {
      byWeek = baseWeeks;
    } else {
      const row = baseWeeks.find((w) => w.week === filterWeek);
      byWeek = row ? [row] : [];
    }
  } else if (filterWeek === "All") {
    byWeek = baseWeeks.map((w) => {
      const r = resolveWeeklyTrendRow(summary, w.week, filterLocId);
      return { ...w, n: r.n, energy: r.energy, belief: r.belief, clarity: r.clarity, avg: r.avg, trend: null };
    });
  } else {
    const w = baseWeeks.find((x) => x.week === filterWeek);
    const r = w ? resolveWeeklyTrendRow(summary, filterWeek, filterLocId) : null;
    byWeek = w && r ? [{ ...w, ...r, trend: null }] : [];
  }

  return {
    totals,
    overall,
    byWeek,
    byLocation: summary.byLocation || [],
    byDepartment
  };
}

export function getTopRiskAlerts(summary, filterWeek, filterLocId) {
  if (!summary) return [];
  if (filterWeek === "All" && filterLocId === "All") {
    return (summary.alerts || []).filter((a) => a.flag === "risk").slice(0, 2);
  }
  const inputs = getAlertBuildInputs(summary, filterWeek, filterLocId);
  if (!inputs) return [];
  return buildAlerts(inputs).filter((a) => a.flag === "risk").slice(0, 2);
}

export function getInsightsAlerts(summary, filterWeek, filterLocId) {
  if (!summary) return [];
  if (filterWeek === "All" && filterLocId === "All") {
    return summary.alerts || [];
  }
  const inputs = getAlertBuildInputs(summary, filterWeek, filterLocId);
  if (!inputs) return [];
  return buildAlerts(inputs);
}

export function trendDirectionKey(weekRows, key) {
  const populated = weekRows.filter((row) => row[key] != null);
  if (populated.length < 2) return null;
  const last = populated[populated.length - 1][key];
  const prev = populated[populated.length - 2][key];
  if (last - prev > 0.3) return "up";
  if (last - prev < -0.3) return "down";
  return "flat";
}

/** Same ±0.3 rule as trendDirectionKey; for explicit prev vs current pair. */
export function trendFromPrevNext(prevVal, currVal) {
  if (prevVal == null || currVal == null) return null;
  const delta = currVal - prevVal;
  if (delta > 0.3) return "up";
  if (delta < -0.3) return "down";
  return "flat";
}

export function findPreviousProgramWeekLabel(byWeekRows, weekLabel) {
  if (!Array.isArray(byWeekRows) || !byWeekRows.length || weekLabel === "All") return null;
  const idx = byWeekRows.findIndex((w) => w.week === weekLabel);
  if (idx <= 0) return null;
  return byWeekRows[idx - 1].week;
}

export function kpiTrendSeries(summary, filterLocId) {
  if (!summary) return [];
  const baseWeeks = summary.byWeek || [];
  if (filterLocId === "All") return baseWeeks;
  return baseWeeks.map((w) => {
    const r = resolveWeeklyTrendRow(summary, w.week, filterLocId);
    return { ...w, n: r.n, energy: r.energy, belief: r.belief, clarity: r.clarity, avg: r.avg };
  });
}

export function kpiCardTrendDirections(summary, filterWeek, filterLocId) {
  const empty = { avg: null, energy: null, belief: null, clarity: null };
  if (!summary) return empty;
  const series = kpiTrendSeries(summary, filterLocId);
  if (filterWeek === "All") {
    return {
      avg: trendDirectionKey(series, "avg"),
      energy: trendDirectionKey(series, "energy"),
      belief: trendDirectionKey(series, "belief"),
      clarity: trendDirectionKey(series, "clarity"),
    };
  }
  const prevWeek = findPreviousProgramWeekLabel(summary.byWeek || [], filterWeek);
  if (!prevWeek) return empty;
  const cur = resolveCell(summary, filterWeek, filterLocId);
  const prev = resolveCell(summary, prevWeek, filterLocId);
  return {
    avg: trendFromPrevNext(prev.avg, cur.avg),
    energy: trendFromPrevNext(prev.energy, cur.energy),
    belief: trendFromPrevNext(prev.belief, cur.belief),
    clarity: trendFromPrevNext(prev.clarity, cur.clarity),
  };
}

export function sparkTrendsForLocationRow(summary, filterWeek, locId) {
  const empty = { avg: null, energy: null, belief: null, clarity: null };
  if (!summary || locId == null) return empty;
  const byWeek = summary.byWeek || [];
  if (filterWeek === "All") {
    const cells = byWeek
      .map((w) => ({ week: w.week, ...resolveCell(summary, w.week, locId) }))
      .filter((c) => c.avg != null);
    if (cells.length < 2) return empty;
    const a = cells[cells.length - 2];
    const b = cells[cells.length - 1];
    return {
      avg: trendFromPrevNext(a.avg, b.avg),
      energy: trendFromPrevNext(a.energy, b.energy),
      belief: trendFromPrevNext(a.belief, b.belief),
      clarity: trendFromPrevNext(a.clarity, b.clarity),
    };
  }
  const prevWeek = findPreviousProgramWeekLabel(byWeek, filterWeek);
  if (!prevWeek) return empty;
  const cur = resolveCell(summary, filterWeek, locId);
  const prev = resolveCell(summary, prevWeek, locId);
  return {
    avg: trendFromPrevNext(prev.avg, cur.avg),
    energy: trendFromPrevNext(prev.energy, cur.energy),
    belief: trendFromPrevNext(prev.belief, cur.belief),
    clarity: trendFromPrevNext(prev.clarity, cur.clarity),
  };
}

export function sparkTrendsForDepartmentRow(summary, filterWeek, filterLocId, dept) {
  const empty = { avg: null, energy: null, belief: null, clarity: null };
  if (!summary || !dept) return empty;
  const byWeek = summary.byWeek || [];
  if (filterWeek === "All") {
    const cells = byWeek
      .map((w) => ({
        week: w.week,
        ...resolveDepartmentRow(summary, w.week, filterLocId, dept),
      }))
      .filter((c) => c.avg != null);
    if (cells.length < 2) return empty;
    const a = cells[cells.length - 2];
    const b = cells[cells.length - 1];
    return {
      avg: trendFromPrevNext(a.avg, b.avg),
      energy: trendFromPrevNext(a.energy, b.energy),
      belief: trendFromPrevNext(a.belief, b.belief),
      clarity: trendFromPrevNext(a.clarity, b.clarity),
    };
  }
  const prevWeek = findPreviousProgramWeekLabel(byWeek, filterWeek);
  if (!prevWeek) return empty;
  const cur = resolveDepartmentRow(summary, filterWeek, filterLocId, dept);
  const prev = resolveDepartmentRow(summary, prevWeek, filterLocId, dept);
  return {
    avg: trendFromPrevNext(prev.avg, cur.avg),
    energy: trendFromPrevNext(prev.energy, cur.energy),
    belief: trendFromPrevNext(prev.belief, cur.belief),
    clarity: trendFromPrevNext(prev.clarity, cur.clarity),
  };
}

function trendForColumn(rows, index, key) {
  const curr = rows[index][key];
  if (curr == null) return null;
  let prevVal = null;
  for (let i = index - 1; i >= 0; i -= 1) {
    if (rows[i][key] != null) {
      prevVal = rows[i][key];
      break;
    }
  }
  return trendFromPrevNext(prevVal, curr);
}

export function attachWeeklyRowMetricTrends(rows) {
  if (!Array.isArray(rows) || !rows.length) return rows;
  return rows.map((entry, index) => ({
    ...entry,
    trendEnergy: trendForColumn(rows, index, "energy"),
    trendBelief: trendForColumn(rows, index, "belief"),
    trendClarity: trendForColumn(rows, index, "clarity"),
    trend: trendForColumn(rows, index, "avg"),
  }));
}

export function weeklyTrendTableRows(summary, filterLocId) {
  const baseWeeks = summary?.byWeek || [];
  if (!summary || !baseWeeks.length) return [];
  let rows;
  if (filterLocId === "All") {
    rows = baseWeeks.map((w) => ({ ...w }));
  } else {
    rows = baseWeeks.map((w) => {
      const r = resolveWeeklyTrendRow(summary, w.week, filterLocId);
      return { ...w, n: r.n, energy: r.energy, belief: r.belief, clarity: r.clarity, avg: r.avg, trend: null };
    });
  }
  return attachWeeklyRowMetricTrends(rows);
}
