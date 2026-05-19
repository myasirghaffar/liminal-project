import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { computeProgramEndDate } from "../utils/programWeek";

const BRAND = {
  black: "#25282A",
  blue: "#0092E7",
  grey: "#64748b",
  border: "#e2e8f0",
  lightBlue: "#E8F5FD",
};

const SETTINGS_MODAL_CSS = `
.settings-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:1000;overflow:auto;padding:20px 16px;box-sizing:border-box}
@media (max-width:600px){
  .settings-modal-overlay{padding:12px 10px}
}
@media (max-width:400px){
  .settings-modal-overlay{padding:0}
}
.settings-modal-card{max-width:760px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-sizing:border-box;width:100%}
@media (max-width:400px){
  .settings-modal-card{border-radius:0;min-height:100vh;max-width:none}
}
.settings-modal-body{padding:22px;overflow-y:auto;max-height:80vh;box-sizing:border-box}
@media (max-width:600px){
  .settings-modal-body{padding:16px 14px;max-height:calc(100vh - 52px)}
}
.settings-modal-header{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:14px 20px;background:#25282A}
@media (max-width:480px){
  .settings-modal-header{padding:12px 14px}
  .settings-modal-header button{min-height:40px;min-width:44px}
}
.settings-modal-section{background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;padding:18px;box-shadow:0 1px 6px #0000000a;margin-bottom:14px;min-width:0;box-sizing:border-box}
@media (max-width:480px){
  .settings-modal-section{padding:14px 12px;border-radius:12px}
}
.settings-program-grid{display:grid;grid-template-columns:1.1fr 1fr 110px 1fr auto;gap:8px;align-items:end;margin-bottom:12px}
@media (max-width:768px){
  .settings-program-grid{grid-template-columns:1fr;align-items:stretch;gap:10px}
  .settings-program-add-btn{width:100%;min-height:44px;height:auto!important;padding:10px 14px!important;justify-self:stretch}
}
.settings-section-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
@media (max-width:480px){
  .settings-section-head{flex-direction:column;align-items:stretch}
  .settings-section-head > button{width:100%;min-height:42px}
}
.settings-location-row{display:grid;grid-template-columns:1fr 90px 32px;gap:8px;align-items:start}
@media (max-width:560px){
  .settings-location-row{grid-template-columns:1fr 40px;grid-template-rows:auto auto}
  .settings-location-name{grid-column:1;grid-row:1;min-width:0}
  .settings-location-remove{grid-column:2;grid-row:1;align-self:start;justify-self:end}
  .settings-location-staff{grid-column:1/-1;grid-row:2}
}
.settings-dept-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
@media (max-width:640px){
  .settings-dept-grid{grid-template-columns:1fr}
}
.settings-dept-row{display:grid;grid-template-columns:1fr 32px;gap:6px;align-items:start;min-width:0}
@media (max-width:480px){
  .settings-dept-row{grid-template-columns:1fr 40px}
}
.settings-program-list-item{border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;background:#f8fafc;min-width:0;overflow-wrap:anywhere}
`;

const toDateKey = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
};

const normalizeLocCompare = (locations = []) =>
  locations.map((location) => ({
    id: location.id || null,
    name: String(location.name || "").trim(),
    staff: Number(location.staff) || 0,
  }));

const normalizeDeptCompare = (departments = []) =>
  departments.map((department) => ({
    id: department && typeof department === "object" ? department.id || null : null,
    name: String(
      (department && typeof department === "object" ? department.name : department) || ""
    ).trim(),
  }));

const hasSettingsChanges = (draft, baseline, { passwordDirty, newPassword }) => {
  if (passwordDirty && newPassword.trim()) return true;
  if ((draft.changeDescription || "") !== (baseline.changeDescription || "")) return true;
  if (toDateKey(draft.programmeStart) !== toDateKey(baseline.programmeStart)) return true;
  if (Number(draft.numWeeks) !== Number(baseline.numWeeks)) return true;
  if (
    JSON.stringify(normalizeLocCompare(draft.locations)) !==
    JSON.stringify(normalizeLocCompare(baseline.locations))
  ) {
    return true;
  }
  if (
    JSON.stringify(normalizeDeptCompare(draft.departments)) !==
    JSON.stringify(normalizeDeptCompare(baseline.departments))
  ) {
    return true;
  }
  return false;
};

const settingsAffectSummary = (draft, baseline) => {
  if (toDateKey(draft.programmeStart) !== toDateKey(baseline.programmeStart)) return true;
  if (Number(draft.numWeeks) !== Number(baseline.numWeeks)) return true;
  if (
    JSON.stringify(normalizeLocCompare(draft.locations)) !==
    JSON.stringify(normalizeLocCompare(baseline.locations))
  ) {
    return true;
  }
  if (
    JSON.stringify(normalizeDeptCompare(draft.departments)) !==
    JSON.stringify(normalizeDeptCompare(baseline.departments))
  ) {
    return true;
  }
  return false;
};

const buildSettingsUpdatePayload = (draft, baseline, { includeDashboardPassword, dashboardPassword }) => {
  const patch = {};
  if ((draft.changeDescription || "") !== (baseline.changeDescription || "")) {
    patch.changeDescription = draft.changeDescription || "";
  }
  if (toDateKey(draft.programmeStart) !== toDateKey(baseline.programmeStart)) {
    patch.programmeStart = draft.programmeStart;
  }
  if (Number(draft.numWeeks) !== Number(baseline.numWeeks)) {
    patch.numWeeks = Number(draft.numWeeks);
  }
  if (
    JSON.stringify(normalizeLocCompare(draft.locations)) !==
    JSON.stringify(normalizeLocCompare(baseline.locations))
  ) {
    patch.locations = Array.isArray(draft.locations) ? draft.locations : [];
  }
  if (
    JSON.stringify(normalizeDeptCompare(draft.departments)) !==
    JSON.stringify(normalizeDeptCompare(baseline.departments))
  ) {
    patch.departments = Array.isArray(draft.departments) ? draft.departments : [];
  }
  if (includeDashboardPassword && dashboardPassword?.trim()) {
    patch.dashboardPassword = dashboardPassword.trim();
  }
  return patch;
};

const buildSettingsConfigSnapshot = (cfg) =>
  JSON.stringify({
    id: cfg?.id || null,
    changeDescription: cfg?.changeDescription || "",
    programmeStart: toDateKey(cfg?.programmeStart),
    numWeeks: Number(cfg?.numWeeks),
    locations: normalizeLocCompare(cfg?.locations),
    departments: normalizeDeptCompare(cfg?.departments),
    programs: (cfg?.programs || []).map((program) => ({
      id: program.id,
      name: program.name,
      programmeStart: toDateKey(program.programmeStart),
      numWeeks: Number(program.numWeeks),
    })),
    slug: cfg?.slug || "",
    clientName: cfg?.clientName || "",
    dashboardPassword: cfg?.dashboardPassword || "",
  });

function SettingsModal({ config, setConfig, onCreateProgram, onClose }) {
  const [draft, setDraft] = useState(JSON.parse(JSON.stringify(config)));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [programError, setProgramError] = useState("");
  const [showClientPassword, setShowClientPassword] = useState(false);
  const [newDashboardPassword, setNewDashboardPassword] = useState("");
  const [programDraft, setProgramDraft] = useState({
    name: "",
    programmeStart: "",
    numWeeks: ""
  });
  const [programTouched, setProgramTouched] = useState({
    name: false,
    programmeStart: false,
    numWeeks: false
  });
  const [programSaving, setProgramSaving] = useState(false);
  const [dashboardPasswordDirty, setDashboardPasswordDirty] = useState(false);
  const draftClientIdRef = useRef(config?.id || null);
  const syncedConfigRef = useRef(config);
  const syncedConfigSnapshotRef = useRef(buildSettingsConfigSnapshot(config));
  const frontendBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
  const clientFrontendUrl = draft?.slug ? `${frontendBaseUrl}/${draft.slug}` : "";
  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().slice(0, 10);
  };
  const todayIsoDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const isBeforeToday = (isoDate) => Boolean(isoDate) && isoDate < todayIsoDate();
  const computeEndDate = (startDate, numWeeks) => {
    const weeks = Number(numWeeks);
    if (!startDate || !Number.isFinite(weeks) || weeks < 1) return "";
    const end = computeProgramEndDate(startDate, weeks);
    if (Number.isNaN(end.getTime())) return "";
    return end.toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (saving) return;

    const clientId = config?.id || null;
    const remoteSnapshot = buildSettingsConfigSnapshot(config);

    if (clientId !== draftClientIdRef.current) {
      draftClientIdRef.current = clientId;
      syncedConfigRef.current = config;
      syncedConfigSnapshotRef.current = remoteSnapshot;
      setDashboardPasswordDirty(false);
      setNewDashboardPassword("");
      setDraft(JSON.parse(JSON.stringify(config)));
      setShowClientPassword(false);
      setSaveError("");
      setProgramError("");
      setProgramTouched({
        name: false,
        programmeStart: false,
        numWeeks: false,
      });
      return;
    }

    if (remoteSnapshot === syncedConfigSnapshotRef.current) return;

    const hasLocalEdits = hasSettingsChanges(draft, syncedConfigRef.current, {
      passwordDirty: dashboardPasswordDirty,
      newPassword: newDashboardPassword,
    });
    if (hasLocalEdits) return;

    syncedConfigRef.current = config;
    syncedConfigSnapshotRef.current = remoteSnapshot;
    setDraft(JSON.parse(JSON.stringify(config)));
  }, [config, saving, draft, dashboardPasswordDirty, newDashboardPassword]);

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 9,
    border: `1.5px solid ${BRAND.border}`,
    fontSize: 13,
    background: "#fff",
    color: BRAND.black,
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: BRAND.grey,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 5,
  };

  const errorTextStyle = {
    fontSize: 11,
    color: "#dc2626",
    marginTop: 4
  };

  const normalizeName = (value) => value.trim().replace(/\s+/g, " ");

  const buildNameCountMap = (items) => {
    const counts = new Map();
    items.forEach((value) => {
      const normalized = normalizeName(value || "").toLowerCase();
      if (!normalized) return;
      counts.set(normalized, (counts.get(normalized) || 0) + 1);
    });
    return counts;
  };

  const locationNameCounts = buildNameCountMap((draft.locations || []).map((location) => location.name));
  const departmentNameCounts = buildNameCountMap(
    (draft.departments || []).map((department) =>
      typeof department === "string" ? department : department?.name || ""
    )
  );

  const locationErrors = (draft.locations || []).map((location) => {
    const normalized = normalizeName(location.name || "");
    return {
      name: !normalized
        ? "Location name is required"
        : locationNameCounts.get(normalized.toLowerCase()) > 1
          ? "Location name must be unique"
          : "",
      staff:
        location.staff === ""
          ? "Staff count is required"
          : !Number.isFinite(location.staff) || location.staff < 0
            ? "Staff count must be 0 or more"
            : ""
    };
  });

  const departmentErrors = (draft.departments || []).map((department) => {
    const rawName = typeof department === "string" ? department : department?.name || "";
    const normalized = normalizeName(rawName);
    return {
      name: !normalized
        ? "Department name is required"
        : departmentNameCounts.get(normalized.toLowerCase()) > 1
          ? "Department name must be unique"
          : ""
    };
  });

  const dashboardPasswordError =
    dashboardPasswordDirty && newDashboardPassword.trim() && newDashboardPassword.trim().length < 6
      ? "Password must be at least 6 characters"
      : "";

  const getProgramErrors = (value, touched) => {
    const next = {
      name: "",
      programmeStart: "",
      numWeeks: ""
    };

    if (touched.name) {
      const normalizedName = normalizeName(value.name || "");
      if (!normalizedName) {
        next.name = "Program name is required";
      } else if (normalizedName.length > 255) {
        next.name = "Program name must be 255 characters or less";
      }
    }

    if (touched.programmeStart && !value.programmeStart) {
      next.programmeStart = "Start date is required";
    } else if (touched.programmeStart && isBeforeToday(value.programmeStart)) {
      next.programmeStart = "Start date cannot be in the past";
    }

    if (touched.numWeeks || touched.programmeStart) {
      const endIso = computeEndDate(value.programmeStart, value.numWeeks);
      if (endIso && isBeforeToday(endIso)) {
        next.numWeeks = "End date cannot be in the past";
      }
    }

    if (touched.numWeeks) {
      if (value.numWeeks === "") {
        next.numWeeks = "Weeks is required";
      } else {
        const numericWeeks = Number(value.numWeeks);
        if (!Number.isInteger(numericWeeks) || numericWeeks < 1 || numericWeeks > 104) {
          next.numWeeks = "Weeks must be a whole number between 1 and 104";
        }
      }
    }

    return next;
  };

  const programErrors = getProgramErrors(programDraft, programTouched);
  const programHasErrors = Object.values(programErrors).some(Boolean);
  const settingsHasErrors =
    Boolean(dashboardPasswordError) ||
    locationErrors.some((entry) => entry.name || entry.staff) ||
    departmentErrors.some((entry) => entry.name);

  const updateDraft = (key, value) => {
    setSaveError("");
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const addLocation = () => {
    setSaveError("");
    setDraft((prev) => ({
      ...prev,
      locations: [...prev.locations, { name: "New Location", staff: 50 }],
    }));
  };

  const updateLocation = (index, key, value) => {
    setSaveError("");
    setDraft((prev) => {
      const nextLocations = [...prev.locations];
      nextLocations[index] = { ...nextLocations[index], [key]: value };
      return { ...prev, locations: nextLocations };
    });
  };

  const removeLocation = (index) => {
    setSaveError("");
    setDraft((prev) => ({
      ...prev,
      locations: prev.locations.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const addDepartment = () => {
    setSaveError("");
    setDraft((prev) => ({
      ...prev,
      departments: [...prev.departments, { name: "New Department" }],
    }));
  };

  const updateDepartment = (index, value) => {
    setSaveError("");
    setDraft((prev) => {
      const nextDepartments = [...prev.departments];
      const current = nextDepartments[index];
      const isObject = current && typeof current === "object";
      nextDepartments[index] = isObject ? { ...current, name: value } : { name: value };
      return { ...prev, departments: nextDepartments };
    });
  };

  const removeDepartment = (index) => {
    setSaveError("");
    setDraft((prev) => ({
      ...prev,
      departments: prev.departments.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const handleSave = async () => {
    if (settingsHasErrors) {
      setSaveError("Fix the highlighted fields before saving.");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");
      if (
        !hasSettingsChanges(draft, config, {
          passwordDirty: dashboardPasswordDirty,
          newPassword: newDashboardPassword,
        })
      ) {
        setSaved(true);
        toast.info("No changes to save.");
        window.setTimeout(() => setSaved(false), 2000);
        return;
      }
      const patch = buildSettingsUpdatePayload(draft, config, {
        includeDashboardPassword:
          dashboardPasswordDirty && Boolean(newDashboardPassword.trim()),
        dashboardPassword: newDashboardPassword,
      });
      const savedConfig = await setConfig(
        { ...draft, dashboardPassword: newDashboardPassword },
        {
          patch,
          refreshSummary: settingsAffectSummary(draft, config),
        }
      );
      if (savedConfig) {
        setDashboardPasswordDirty(false);
        setNewDashboardPassword("");
        const nextDraft = {
          ...draft,
          ...savedConfig,
          changeDescription:
            typeof savedConfig.changeDescription === "string"
              ? savedConfig.changeDescription
              : draft.changeDescription || "",
          dashboardPassword: savedConfig.dashboardPassword ?? draft.dashboardPassword ?? "",
          locations: Array.isArray(savedConfig.locations)
            ? savedConfig.locations
            : draft.locations,
          departments: Array.isArray(savedConfig.departments)
            ? savedConfig.departments
            : draft.departments,
          programs: Array.isArray(savedConfig.programs) ? savedConfig.programs : draft.programs,
        };
        syncedConfigSnapshotRef.current = buildSettingsConfigSnapshot(nextDraft);
        syncedConfigRef.current = nextDraft;
        setDraft(nextDraft);
      }
      setSaved(true);
      toast.success("Settings updated successfully.");
      window.setTimeout(() => setSaved(false), 2000);
    } catch (saveError) {
      const apiError = saveError.response?.data;
      const detailMessage = Array.isArray(apiError?.details) && apiError.details.length
        ? apiError.details.map((detail) => detail.message).join(" | ")
        : "";
      setSaveError(detailMessage || apiError?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProgram = async () => {
    if (!onCreateProgram) return;

    const nextTouched = {
      name: true,
      programmeStart: true,
      numWeeks: true
    };
    setProgramTouched(nextTouched);
    if (Object.values(getProgramErrors(programDraft, nextTouched)).some(Boolean)) {
      return;
    }

    try {
      setProgramSaving(true);
      setProgramError("");
      const createdProgram = await onCreateProgram({
        name: programDraft.name.trim(),
        programmeStart: programDraft.programmeStart,
        numWeeks: Number(programDraft.numWeeks)
      });
      if (createdProgram?.id) {
        setDraft((prev) => ({
          ...prev,
          programs: [...(prev.programs || []), createdProgram]
        }));
      }
      setProgramDraft({ name: "", programmeStart: "", numWeeks: "" });
      setProgramTouched({
        name: false,
        programmeStart: false,
        numWeeks: false
      });
    } catch (saveError) {
      const apiError = saveError.response?.data;
      const detailMessage = Array.isArray(apiError?.details) && apiError.details.length
        ? apiError.details.map((detail) => detail.message).join(" | ")
        : "";
      setProgramError(detailMessage || apiError?.message || "Failed to create program");
    } finally {
      setProgramSaving(false);
    }
  };

  return (
    <>
      <style>{SETTINGS_MODAL_CSS}</style>
      <div className="settings-modal-overlay">
        <div className="settings-modal-card">
          <div className="settings-modal-header">
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>⚙️ Client Settings</div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid #ffffff40",
                color: "#fff",
                borderRadius: 8,
                padding: "5px 12px",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              ✕ Close
            </button>
          </div>
          <div className="settings-modal-body">
            <div className="settings-modal-section">
            <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black, marginBottom: 14 }}>Client Information</div>
            {clientFrontendUrl ? (
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Client Frontend URL</label>
                <input value={clientFrontendUrl} readOnly style={{ ...inputStyle, background: "#f8fafc", color: BRAND.grey }} />
              </div>
            ) : null}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Client / Organisation Name</label>
              <input
                value={draft.clientName}
                readOnly
                style={{ ...inputStyle, background: "#f8fafc", color: BRAND.grey }}
              />
            </div>
            <div>
              <label style={labelStyle}>Change Description (shown on Check-In screen)</label>
              <textarea
                value={draft.changeDescription || ""}
                onChange={(event) => updateDraft("changeDescription", event.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 10, color: BRAND.grey, marginTop: 4 }}>This paragraph explains the change context to staff before they submit their check-in.</div>
            </div>
          </div>

          <div className="settings-modal-section">
            <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black, marginBottom: 14 }}>Programs</div>
            <div className="settings-program-grid">
              <div>
                <label style={labelStyle}>Program Name</label>
                <input
                  value={programDraft.name}
                  onChange={(event) => {
                    setProgramError("");
                    setProgramTouched((prev) => ({ ...prev, name: true }));
                    setProgramDraft((prev) => ({ ...prev, name: event.target.value }));
                  }}
                  style={{
                    ...inputStyle,
                    borderColor: programErrors.name ? "#dc2626" : BRAND.border
                  }}
                />
                {programErrors.name ? <div style={errorTextStyle}>{programErrors.name}</div> : null}
              </div>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input
                  type="date"
                  value={programDraft.programmeStart}
                  min={todayIsoDate()}
                  onChange={(event) => {
                    setProgramError("");
                    setProgramTouched((prev) => ({ ...prev, programmeStart: true }));
                    setProgramDraft((prev) => ({ ...prev, programmeStart: event.target.value }));
                  }}
                  style={{
                    ...inputStyle,
                    borderColor: programErrors.programmeStart ? "#dc2626" : BRAND.border
                  }}
                />
                {programErrors.programmeStart ? <div style={errorTextStyle}>{programErrors.programmeStart}</div> : null}
              </div>
              <div>
                <label style={labelStyle}>Weeks</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={programDraft.numWeeks}
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(/\D/g, "");
                    setProgramError("");
                    setProgramTouched((prev) => ({ ...prev, numWeeks: true }));
                    setProgramDraft((prev) => ({ ...prev, numWeeks: nextValue }));
                  }}
                  style={{
                    ...inputStyle,
                    borderColor: programErrors.numWeeks ? "#dc2626" : BRAND.border
                  }}
                />
                {programErrors.numWeeks ? <div style={errorTextStyle}>{programErrors.numWeeks}</div> : null}
              </div>
              <div>
                <label style={labelStyle}>End Date</label>
                <input
                  value={computeEndDate(programDraft.programmeStart, programDraft.numWeeks)}
                  readOnly
                  style={{ ...inputStyle, background: "#f8fafc", color: BRAND.grey }}
                />
              </div>
              <button
                type="button"
                className="settings-program-add-btn"
                onClick={handleCreateProgram}
                disabled={!programDraft.name.trim() || !programDraft.programmeStart || !programDraft.numWeeks || programSaving || programHasErrors}
                style={{ height: 40, padding: "0 14px", borderRadius: 8, border: "none", background: BRAND.blue, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: (!programDraft.name.trim() || !programDraft.programmeStart || !programDraft.numWeeks || programSaving || programHasErrors) ? 0.6 : 1 }}
              >
                {programSaving ? "Adding..." : "+ Add"}
              </button>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.grey, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
                Already Added Programs
              </div>
              {(draft.programs || []).length ? (
                <div style={{ display: "grid", gap: 6 }}>
                  {(draft.programs || []).map((program, index) => (
                    <div
                      key={program.id || `${program.name}-${index}`}
                      className="settings-program-list-item"
                    >
                      <div style={{ fontSize: 12, color: BRAND.black, fontWeight: 700 }}>{program.name}</div>
                      <div style={{ fontSize: 11, color: BRAND.grey }}>
                        {formatDate(program.programmeStart)} to {formatDate(program.programmeEnd)} · {program.numWeeks} weeks
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: BRAND.grey }}>No programs added yet.</div>
              )}
            </div>
            {programError ? <div style={{ fontSize: 12, color: "#dc2626", marginTop: 8 }}>{programError}</div> : null}
          </div>

          <div className="settings-modal-section">
            <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black, marginBottom: 14 }}>Access Passwords</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Client Dashboard Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showClientPassword ? "text" : "password"}
                    value={config.dashboardPassword || ""}
                    readOnly
                    tabIndex={-1}
                    autoComplete="off"
                    name="client-dashboard-password-current"
                    style={{
                      ...inputStyle,
                      paddingRight: 42,
                      background: BRAND.lightBlue,
                      cursor: "default",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientPassword((prev) => !prev)}
                    aria-label={showClientPassword ? "Hide client dashboard password" : "Show client dashboard password"}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      color: BRAND.grey,
                      cursor: "pointer",
                      fontSize: 16,
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    {showClientPassword ? "🙈" : "👁"}
                  </button>
                </div>
                <div style={{ fontSize: 10, color: BRAND.grey, marginTop: 4 }}>
                  Current password on file for this client
                </div>
              </div>
              <div>
                <label style={labelStyle}>Client Dashboard Password</label>
                <input
                  type="password"
                  value={newDashboardPassword}
                  onChange={(event) => {
                    setDashboardPasswordDirty(true);
                    setNewDashboardPassword(event.target.value);
                  }}
                  placeholder="Leave blank to keep current password"
                  autoComplete="new-password"
                  name="client-dashboard-password-new"
                  style={{
                    ...inputStyle,
                    borderColor: dashboardPasswordError ? "#dc2626" : BRAND.border,
                  }}
                />
                {dashboardPasswordError ? <div style={errorTextStyle}>{dashboardPasswordError}</div> : null}
                <div style={{ fontSize: 10, color: BRAND.grey, marginTop: 4 }}>
                  Enter a new value only when you want to change it
                </div>
              </div>
            </div>
          </div>

          <div className="settings-modal-section">
            <div className="settings-section-head">
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black }}>Locations & Staff Headcount</div>
                <div style={{ fontSize: 10, color: BRAND.grey, marginTop: 2 }}>Headcount is used to calculate participation rate</div>
              </div>
              <button type="button" onClick={addLocation} style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: BRAND.blue, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                + Add
              </button>
            </div>
            {draft.locations.map((location, index) => (
              <div key={`location-${index}`} style={{ marginBottom: 8 }}>
                <div className="settings-location-row">
                  <div className="settings-location-name">
                    <input
                      value={location.name}
                      onChange={(event) => updateLocation(index, "name", event.target.value)}
                      style={{
                        ...inputStyle,
                        borderColor: locationErrors[index]?.name ? "#dc2626" : BRAND.border
                      }}
                      placeholder="Location name"
                    />
                    {locationErrors[index]?.name ? <div style={errorTextStyle}>{locationErrors[index].name}</div> : null}
                  </div>
                  <div className="settings-location-staff">
                    <input
                      type="number"
                      value={location.staff ?? ""}
                      onChange={(event) => {
                        const rawValue = event.target.value;
                        if (rawValue === "") {
                          updateLocation(index, "staff", "");
                          return;
                        }
                        updateLocation(index, "staff", parseInt(rawValue, 10));
                      }}
                      style={{
                        ...inputStyle,
                        textAlign: "center",
                        borderColor: locationErrors[index]?.staff ? "#dc2626" : BRAND.border
                      }}
                      placeholder="Staff"
                    />
                    {locationErrors[index]?.staff ? <div style={errorTextStyle}>{locationErrors[index].staff}</div> : null}
                  </div>
                  <button
                    type="button"
                    className="settings-location-remove"
                    onClick={() => removeLocation(index)}
                    style={{ width: 32, height: 36, borderRadius: 7, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 16, cursor: "pointer", fontWeight: 700 }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="settings-modal-section" style={{ marginBottom: 20 }}>
            <div className="settings-section-head">
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black }}>Departments</div>
              </div>
              <button type="button" onClick={addDepartment} style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: BRAND.blue, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                + Add
              </button>
            </div>
            <div className="settings-dept-grid">
              {draft.departments.map((department, index) => {
                const departmentName = typeof department === "string" ? department : department?.name || "";
                return (
                <div key={`department-${index}`} className="settings-dept-row">
                  <div>
                    <input
                      value={departmentName}
                      onChange={(event) => updateDepartment(index, event.target.value)}
                      style={{
                        ...inputStyle,
                        borderColor: departmentErrors[index]?.name ? "#dc2626" : BRAND.border
                      }}
                    />
                    {departmentErrors[index]?.name ? <div style={errorTextStyle}>{departmentErrors[index].name}</div> : null}
                  </div>
                  <button type="button" onClick={() => removeDepartment(index)} style={{ width: 32, height: 36, borderRadius: 7, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 16, cursor: "pointer", fontWeight: 700 }}>
                    ×
                  </button>
                </div>
                );
              })}
            </div>
          </div>

          {saveError ? <div style={{ fontSize: 12, color: "#dc2626", marginBottom: 10 }}>{saveError}</div> : null}
          <button type="button" onClick={handleSave} disabled={saving} style={{ width: "100%", padding: "13px", borderRadius: 11, border: "none", background: saved ? "#16a34a" : BRAND.black, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito Sans',sans-serif" }}>
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default SettingsModal;
