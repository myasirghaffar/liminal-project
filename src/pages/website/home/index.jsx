import React from "react";
import CheckInFeature from "./features/CheckInFeature";
import { BeliefIcon, EnergyIcon, TargetIcon } from "../../../assets/icons/icons";
import api from "../../../utils/axios";
import {
  formatProgramWeekLabel,
  getProgramWeekBounds,
  getProgramWeekNumber,
} from "../../../utils/programWeek";

const BRAND = {
  black: "#25282A",
  grey: "#64748b",
  border: "#e2e8f0",
  lightGrey: "#f8fafc",
  blue: "#0092E7",
  lightBlue: "#E8F5FD",
  coral: "#FF8D6D",
  lightCoral: "#FFF0EB",
};

const sel = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 9,
  border: `1.5px solid ${BRAND.border}`,
  fontSize: 14,
  background: "#fff",
  color: BRAND.black,
  outline: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};

const btn = {
  display: "block",
  width: "100%",
  padding: "13px",
  borderRadius: 11,
  border: "none",
  background: BRAND.black,
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Nunito Sans',sans-serif",
};

const defaultConfig = {
  clientName: "Alfred Health",
  changeDescription:
    "Alfred Health is currently undergoing a significant organisational change. This weekly check-in helps leadership understand how staff are experiencing the change — and where support is needed most. Your responses are completely anonymous.",
  programmeStart: "2025-03-03",
  numWeeks: 8,
  dashboardPassword: "alfred2025",
  insightsPassword: "amy2025",
  locations: [
    { name: "The Alfred", staff: 120 },
    { name: "Caulfield Hospital", staff: 80 },
    { name: "Sandringham Hospital", staff: 70 },
    { name: "Community Health", staff: 60 },
    { name: "Corporate/Admin", staff: 50 },
  ],
  departments: [
    "Emergency",
    "ICU / Critical Care",
    "Surgery",
    "Medicine",
    "Oncology",
    "Mental Health",
    "Nursing",
    "Allied Health",
    "Pharmacy",
    "Pathology",
    "Radiology",
    "Facilities",
    "Finance",
    "HR",
    "IT",
    "Executive",
    "Other",
  ].map((name) => ({ name })),
};

function getCurrentWeek(cfg) {
  const activeProgram = cfg.activeProgram || null;
  const programmeStart = activeProgram?.programmeStart || cfg.programmeStart;
  const numWeeks = activeProgram?.numWeeks || cfg.numWeeks;
  const weekNumber = getProgramWeekNumber(programmeStart, new Date(), numWeeks);
  if (!weekNumber) return null;
  return formatProgramWeekLabel(weekNumber);
}

function getWeekDateRange(cfg, weekLabel) {
  const activeProgram = cfg.activeProgram || null;
  const programmeStart = activeProgram?.programmeStart || cfg.programmeStart;
  const totalWeeks = activeProgram?.numWeeks || cfg.numWeeks;
  const weeks = Array.from({ length: totalWeeks }, (_, i) => `Week ${i + 1}`);
  const idx = weeks.indexOf(weekLabel);
  if (idx < 0) return null;
  const { start, end } = getProgramWeekBounds(programmeStart, idx);
  return {
    start: start.toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
    end: end.toLocaleDateString("en-AU", { day: "numeric", month: "short" }),
  };
}

function Slider({ label, description, value, onChange, color, icon }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: BRAND.black }}>{label}</div>
            <div style={{ fontSize: 11, color: BRAND.grey }}>{description}</div>
          </div>
        </div>
        <div style={{ background: `${color}18`, border: `2px solid ${color}`, borderRadius: 8, padding: "3px 12px", minWidth: 44, textAlign: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 800, color }}>{value}</span>
        </div>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="0.5"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%",
          accentColor: color,
          cursor: "pointer",
          height: "6px",
          borderRadius: "3px",
          outline: "none",
          WebkitAppearance: "none",
          appearance: "none",
          background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - 1) / 9) * 100}%, #e2e8f0 ${((value - 1) / 9) * 100}%, #e2e8f0 100%)`,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
        <span>1 — Very Low</span>
        <span>5 — Moderate</span>
        <span>10 — Very High</span>
      </div>
    </div>
  );
}

const HomePage = ({ config: configProp }) => {
  const config = configProp || defaultConfig;
  const onSubmit = async (payload) => {
    if (!config.slug || !payload.programId) {
      throw new Error("Client context missing program");
    }
    await api.post("/api/client-auth/checkins", {
      slug: config.slug,
      programId: payload.programId,
      locationId: payload.locationId,
      departmentId: payload.departmentId,
      energy: payload.energy,
      belief: payload.belief,
      clarity: payload.clarity
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Nunito Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <CheckInFeature
        onSubmit={onSubmit}
        config={config}
        BRAND={BRAND}
        getCurrentWeek={getCurrentWeek}
        getWeekDateRange={getWeekDateRange}
        sel={sel}
        btn={btn}
        Slider={Slider}
        icons={{
          energy: <EnergyIcon size={18} color={BRAND.blue} />,
          belief: <BeliefIcon size={18} color={BRAND.coral} />,
          clarity: <TargetIcon size={18} color="#16a34a" />,
        }}
      />
    </div>
  );
};

export default HomePage;
