import React, { useEffect, useState } from "react";
import { BulbIcon, CalendarIcon, CheckIcon } from "../../../../assets/icons/icons";

function formatProgramDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

function CheckInFeature({
  onSubmit,
  config,
  BRAND,
  getCurrentWeek,
  getWeekDateRange,
  sel,
  btn,
  Slider,
  icons = {},
}) {
  const programs = Array.isArray(config?.programs) ? config.programs : [];
  const hasPrograms = programs.length > 0;
  const showProgramPicker = programs.length > 1;

  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [energy, setEnergy] = useState(5);
  const [belief, setBelief] = useState(5);
  const [clarity, setClarity] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!config || selectedProgramId) return;
    if (programs.length === 1) {
      setSelectedProgramId(programs[0].id);
    } else if (config.activeProgram?.id) {
      setSelectedProgramId(config.activeProgram.id);
    }
  }, [config, programs, selectedProgramId]);

  const isConfigured =
    typeof onSubmit === "function" &&
    config &&
    BRAND &&
    typeof getCurrentWeek === "function" &&
    typeof getWeekDateRange === "function" &&
    sel &&
    btn &&
    Slider;

  if (!isConfigured) {
    return (
      <section className="min-h-[40vh] flex items-center justify-center px-6">
        <div className="text-center max-w-xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Website Home
          </h2>
          <p className="text-slate-600">
            This page is connected to the website layout. Feature configuration
            is not available in standalone mode yet.
          </p>
        </div>
      </section>
    );
  }

  const selectedProgram = programs.find((program) => program.id === selectedProgramId) || null;
  const programConfig = selectedProgram ? { ...config, activeProgram: selectedProgram } : config;
  const currentWeek = selectedProgram ? getCurrentWeek(programConfig) : null;
  const ok = selectedProgramId && locationId && departmentId && currentWeek;
  const dateRange = currentWeek ? getWeekDateRange(programConfig, currentWeek) : null;
  const programStart = formatProgramDate(selectedProgram?.programmeStart || config.programmeStart);
  const programEnd = formatProgramDate(selectedProgram?.programmeEnd);
  const weekNumber = currentWeek ? Number(currentWeek.replace("Week ", "")) : null;

  if (!hasPrograms) {
    return (
      <div style={{ textAlign: "center", padding: "56px 20px", maxWidth: 460, margin: "0 auto" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: BRAND.lightGrey, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <CalendarIcon size={30} color={BRAND.grey} />
        </div>
        <h2 style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 22, fontWeight: 800, color: BRAND.black, marginBottom: 8 }}>
          No Programs Available Yet
        </h2>
        <p style={{ color: BRAND.grey, fontSize: 14, lineHeight: 1.7 }}>
          This organisation doesn't have an active program set up yet. Please contact your admin to configure a program.
        </p>
      </div>
    );
  }

  if (showProgramPicker && !selectedProgramId) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
        <h2 style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 22, fontWeight: 800, color: BRAND.black, marginBottom: 6 }}>Weekly Change Check-In</h2>
        {config.changeDescription && (
          <div style={{ background: BRAND.lightGrey, border: `1px solid ${BRAND.border}`, borderRadius: 11, padding: "14px 16px", marginBottom: 16, fontSize: 13, color: BRAND.grey, lineHeight: 1.7 }}>
            {config.changeDescription}
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: BRAND.grey, marginBottom: 5 }}>Program *</label>
          <select value={selectedProgramId} onChange={(e) => setSelectedProgramId(e.target.value)} style={sel}>
            <option value="">Select your program…</option>
            {programs.map((program) => {
              const start = formatProgramDate(program.programmeStart);
              const end = formatProgramDate(program.programmeEnd);
              const range = start && end ? ` (${start} – ${end})` : "";
              return (
                <option key={program.id} value={program.id}>
                  {program.name}{range}
                </option>
              );
            })}
          </select>
        </div>
        <p style={{ fontSize: 12, color: BRAND.grey, lineHeight: 1.6 }}>
          Select the program you are checking in for. Your week will be detected automatically after you choose.
        </p>
      </div>
    );
  }

  if (!currentWeek) {
    return (
      <div style={{ textAlign: "center", padding: "56px 20px", maxWidth: 460, margin: "0 auto" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: BRAND.lightCoral, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <CalendarIcon size={30} color={BRAND.coral} />
        </div>
        <h2 style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 22, fontWeight: 800, color: BRAND.black, marginBottom: 8 }}>Programme Not Started Yet</h2>
        <p style={{ color: BRAND.grey, fontSize: 14, lineHeight: 1.7 }}>
          Check back from {programStart || "the program start date"}.
        </p>
        {selectedProgram?.name ? (
          <p style={{ color: BRAND.grey, fontSize: 12, marginTop: 8 }}>
            Selected program: <strong style={{ color: BRAND.black }}>{selectedProgram.name}</strong>
            {programStart && programEnd ? ` (${programStart} - ${programEnd})` : ""}
          </p>
        ) : null}
        {showProgramPicker ? (
          <button
            type="button"
            onClick={() => setSelectedProgramId("")}
            style={{ ...btn, marginTop: 20, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}
          >
            Choose a different program
          </button>
        ) : null}
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "56px 20px", maxWidth: 460, margin: "0 auto" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: BRAND.lightBlue, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <CheckIcon size={30} color={BRAND.blue} />
        </div>
        <h2 style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 24, fontWeight: 800, color: BRAND.black, marginBottom: 8 }}>Thank you</h2>
        <p style={{ color: BRAND.grey, fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          Your response has been recorded anonymously.<br />Your voice matters in this change journey.
        </p>
        <div style={{ background: BRAND.lightBlue, borderRadius: 12, padding: "14px 18px", marginBottom: 24, border: `1px solid ${BRAND.blue}30` }}>
          <p style={{ fontSize: 12, color: BRAND.blue, fontWeight: 600, margin: 0 }}>"The only thing you have control of in this world is yourself and how you choose to respond."</p>
          <p style={{ fontSize: 11, color: BRAND.grey, margin: "5px 0 0" }}>— Amy Jacobson</p>
        </div>
        <button onClick={() => setSubmitted(false)} style={btn}>Submit another response</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontFamily: "'Nunito Sans',sans-serif", fontSize: 22, fontWeight: 800, color: BRAND.black, marginBottom: 6 }}>Weekly Change Check-In</h2>
      {config.changeDescription && (
        <div style={{ background: BRAND.lightGrey, border: `1px solid ${BRAND.border}`, borderRadius: 11, padding: "14px 16px", marginBottom: 16, fontSize: 13, color: BRAND.grey, lineHeight: 1.7 }}>
          {config.changeDescription}
        </div>
      )}
      {showProgramPicker ? (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: BRAND.grey, marginBottom: 5 }}>Program *</label>
          <select value={selectedProgramId} onChange={(e) => setSelectedProgramId(e.target.value)} style={sel}>
            {programs.map((program) => {
              const start = formatProgramDate(program.programmeStart);
              const end = formatProgramDate(program.programmeEnd);
              const range = start && end ? ` (${start} – ${end})` : "";
              return (
                <option key={program.id} value={program.id}>
                  {program.name}{range}
                </option>
              );
            })}
          </select>
        </div>
      ) : null}
      <div style={{ background: BRAND.lightBlue, border: `1px solid ${BRAND.blue}30`, borderRadius: 11, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "inline-flex" }}>
          <CalendarIcon size={18} color={BRAND.blue} />
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 12, color: BRAND.blue }}>{currentWeek}</div>
          {dateRange && <div style={{ fontSize: 11, color: BRAND.grey }}>{dateRange.start} – {dateRange.end}</div>}
          {selectedProgram?.name ? (
            <div style={{ fontSize: 11, color: BRAND.grey }}>{selectedProgram.name}</div>
          ) : null}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: BRAND.grey }}>
          Auto-detected{weekNumber && selectedProgram?.numWeeks ? ` · Week ${weekNumber}/${selectedProgram.numWeeks}` : ""}
        </div>
      </div>
      <div style={{ background: BRAND.lightCoral, border: `1px solid ${BRAND.coral}40`, borderRadius: 11, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ display: "inline-flex" }}>
          <BulbIcon size={18} color={BRAND.coral} />
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 12, color: BRAND.black, marginBottom: 2 }}>Change Intelligence — Own It first</div>
          <div style={{ fontSize: 11, color: BRAND.grey, lineHeight: 1.6 }}>Before you score, be honest with yourself about where you actually are with this change. No right or wrong answers.</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: BRAND.grey, marginBottom: 5 }}>Location *</label>
          <select value={locationId} onChange={(e) => setLocationId(e.target.value)} style={sel}>
            <option value="">Select…</option>
            {config.locations.map((l) => (
              <option key={l.id || l.name} value={l.id || ""}>{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: BRAND.grey, marginBottom: 5 }}>Department *</label>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} style={sel}>
            <option value="">Select…</option>
            {config.departments.map((d) => {
              const id = typeof d === "object" ? d.id : "";
              const name = typeof d === "object" ? d.name : d;
              return (
                <option key={id || name} value={id || ""}>{name}</option>
              );
            })}
          </select>
        </div>
      </div>
      <div style={{ background: "#fff", border: `1.5px solid ${BRAND.border}`, borderRadius: 14, padding: "22px 18px", marginBottom: 20, boxShadow: "0 2px 10px #0000000a" }}>
        <div style={{ fontWeight: 700, fontSize: 11, color: BRAND.grey, textTransform: "uppercase", letterSpacing: 1, marginBottom: 18 }}>Rate your experience this week (1–10)</div>
        <Slider label="Energy" description="How energised do you feel about this change?" value={energy} onChange={setEnergy} color={BRAND.blue} icon={icons.energy} brandBlack={BRAND.black} brandGrey={BRAND.grey} />
        <Slider label="Belief" description="How much do you believe this change will succeed?" value={belief} onChange={setBelief} color={BRAND.coral} icon={icons.belief} brandBlack={BRAND.black} brandGrey={BRAND.grey} />
        <Slider label="Clarity" description="How clear are you on what this change means for you?" value={clarity} onChange={setClarity} color="#16a34a" icon={icons.clarity} brandBlack={BRAND.black} brandGrey={BRAND.grey} />
      </div>
      <button
        onClick={async () => {
          if (!ok || submitting) return;
          try {
            setSubmitError("");
            setSubmitting(true);
            await onSubmit({
              programId: selectedProgramId,
              week: currentWeek,
              locationId,
              departmentId,
              energy,
              belief,
              clarity,
            });
            setSubmitted(true);
          } catch (error) {
            setSubmitError(error.response?.data?.message || "Failed to submit check-in");
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={!ok || submitting}
        style={{ ...btn, opacity: ok ? 1 : 0.4, cursor: ok ? "pointer" : "not-allowed" }}
      >
        {submitting ? "Submitting..." : "Submit anonymously →"}
      </button>
      {!ok && <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 7 }}>Select your location and department to continue</p>}
      {submitError ? <p style={{ fontSize: 11, color: "#dc2626", textAlign: "center", marginTop: 7 }}>{submitError}</p> : null}
    </div>
  );
}

export default CheckInFeature;
