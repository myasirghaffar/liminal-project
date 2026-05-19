import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../utils/axios";
import { clearUser } from "../../../store/slices/authSlice";
import DashboardFeature from "./features/DashboardFeature";
import ExportReportFeature from "./features/ExportReportFeature";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ClientsModal from "../../../pages/Clients";
import SettingsModal from "../../../pages/Settings";
import SecurityModal from "../../../pages/SecurityModal";
import Insights from "../../../pages/Insights";
import { ADMIN_PROGRAM_BAR_CSS } from "./dashboardPageResponsiveCss";

const BRAND = {
  black: "#25282A",
  blue: "#0092E7",
  coral: "#FF8D6D",
  lightBlue: "#E8F5FD",
  lightCoral: "#FFF0EB",
  grey: "#64748b",
  lightGrey: "#f8fafc",
  border: "#e2e8f0",
};

const card = {
  background: "#fff",
  border: `1.5px solid ${BRAND.border}`,
  borderRadius: 14,
  padding: "18px",
  boxShadow: "0 1px 6px #0000000a",
  marginBottom: 14,
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

const DEFAULT_CONFIG = {
  clientName: "Client",
  changeDescription: "",
  programmeStart: "2025-03-03",
  numWeeks: 8,
  dashboardPassword: "",
  locations: [],
  departments: [],
};

const STORAGE_KEY = "liminal_clients_v1";

const stripPasswordForStorage = (client) => {
  const { dashboardPassword: _omit, ...rest } = client;
  return rest;
};

const normalizeStoredClient = (client = {}) => ({
  ...stripPasswordForStorage(client),
  clientName: client.clientName || client.name || DEFAULT_CONFIG.clientName,
  changeDescription:
    typeof client.changeDescription === "string"
      ? client.changeDescription
      : typeof client.description === "string"
        ? client.description
        : DEFAULT_CONFIG.changeDescription,
  programmeStart: client.programmeStart || DEFAULT_CONFIG.programmeStart,
  numWeeks: client.numWeeks ?? DEFAULT_CONFIG.numWeeks,
  dashboardPassword: "",
  locations: Array.isArray(client.locations) ? client.locations : [],
  departments: Array.isArray(client.departments) ? client.departments : [],
  programs: Array.isArray(client.programs) ? client.programs : [],
  archived: Boolean(client.archived),
  createdAt: client.createdAt || new Date().toISOString(),
});

const loadClients = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeStoredClient) : [];
    }
  } catch (error) {
    console.error("Failed to load liminal clients", error);
  }

  return [];
};

const mapApiClientToUiClient = (client) => ({
  id: client.id,
  slug: client.slug,
  clientName: client.name,
  changeDescription:
    typeof client.changeDescription === "string"
      ? client.changeDescription
      : typeof client.description === "string"
        ? client.description
        : DEFAULT_CONFIG.changeDescription,
  programmeStart: client.programmeStart
    ? new Date(client.programmeStart).toISOString().slice(0, 10)
    : DEFAULT_CONFIG.programmeStart,
  numWeeks: client.numWeeks ?? DEFAULT_CONFIG.numWeeks,
  dashboardPassword: client.dashboardPassword || "",
  locations: Array.isArray(client.locations) ? client.locations : [],
  departments: Array.isArray(client.departments) ? client.departments : [],
  programs: Array.isArray(client.programs)
    ? client.programs.map((program) => ({
        id: program.id,
        name: program.name,
        programmeStart: program.programmeStart
          ? new Date(program.programmeStart).toISOString().slice(0, 10)
          : "",
        numWeeks: program.numWeeks,
        programmeEnd: program.programmeEnd
          ? new Date(program.programmeEnd).toISOString().slice(0, 10)
          : "",
      }))
    : [],
  archived: Boolean(client.archived),
  createdAt: client.createdAt || new Date().toISOString(),
});

const saveClients = (clients) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients.map(stripPasswordForStorage)));
  } catch (error) {
    console.error("Failed to save liminal clients", error);
  }
};

const AdminDashboard = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const canSeeInsights =
    currentUser?.role === "AMY_SUPER_ADMIN" || currentUser?.liminalAccess === "insights";
  const isClientDashboardSession = currentUser?.role === "CLIENT_ADMIN";
  const defaultTab = currentUser?.role === "AMY_SUPER_ADMIN" ? "insights" : "dashboard";
  const currentTab = searchParams.get("tab") || defaultTab;
  const [clients, setClients] = useState(() => loadClients());
  const [clientsHydrated, setClientsHydrated] = useState(false);
  const [activeClientId, setActiveClientId] = useState(() => loadClients()[0]?.id || "");
  const [summary, setSummary] = useState(null);
  const [filterWeek, setFilterWeek] = useState("All");
  const [filterLocId, setFilterLocId] = useState("All");
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [exportState, setExportState] = useState(null);
  const [showClientMgr, setShowClientMgr] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const isSuperAdmin = currentUser?.role === "AMY_SUPER_ADMIN";
  const onExport = (mode) => {
    const availableWeeks = summary?.byWeek || [];
    const firstWeek = availableWeeks.length ? availableWeeks[0].week : "";
    const fallbackWeek = availableWeeks.length ? availableWeeks[availableWeeks.length - 1].week : "";
    const seededWeek =
      filterWeek === "All"
        ? "All"
        : availableWeeks.some((row) => row.week === filterWeek)
          ? filterWeek
          : fallbackWeek;

    setExportState({
      mode,
      periodType: "weekly",
      week: seededWeek,
      monthBlock: "",
      startWeek: seededWeek === "All" ? firstWeek : seededWeek,
      endWeek: seededWeek === "All" ? fallbackWeek : seededWeek,
      locId: filterLocId || "All",
      programId: resolvedProgramId,
    });
  };
  const sessionClient = clients.find(
    (client) =>
      (currentUser?.clientId && client.id === currentUser.clientId) ||
      (currentUser?.slug && client.slug === currentUser.slug)
  );
  const config = isClientDashboardSession
    ? sessionClient ||
      {
        ...DEFAULT_CONFIG,
        clientName: currentUser?.clientName || DEFAULT_CONFIG.clientName,
      }
    : clients.find((client) => client.id === activeClientId) || clients[0] || DEFAULT_CONFIG;
  const availablePrograms = Array.isArray(config.programs) ? config.programs : [];
  const resolvedProgramId =
    selectedProgramId && availablePrograms.some((program) => program.id === selectedProgramId)
      ? selectedProgramId
      : availablePrograms[0]?.id || "";
  const selectedProgram =
    availablePrograms.find((program) => program.id === resolvedProgramId) ||
    availablePrograms[0] ||
    null;

  const fetchClients = useCallback(async (preferredClientId) => {
    try {
      const { data } = await api.get("/api/admin/clients");
      const serverClients = Array.isArray(data?.data) ? data.data : [];
      if (!serverClients.length) {
        setClients([]);
        saveClients([]);
        setActiveClientId("");
        return [];
      }

      const mapped = serverClients.map(mapApiClientToUiClient);
      setClients((prev) => {
        const prevById = new Map(prev.map((client) => [client.id, client]));
        const merged = mapped.map((client) => {
          const existing = prevById.get(client.id);
          if (!existing) return client;
          return {
            ...existing,
            ...client,
            dashboardPassword: client.dashboardPassword || "",
          };
        });
        saveClients(merged);
        return merged;
      });
      setActiveClientId((prev) => {
        const nextPreferredId = preferredClientId || prev;
        if (nextPreferredId && mapped.some((client) => client.id === nextPreferredId)) {
          return nextPreferredId;
        }
        return mapped.find((client) => !client.archived)?.id || mapped[0]?.id || prev;
      });
      return mapped;
    } catch (_error) {
      // Keep current local state when API fetch fails.
      return null;
    } finally {
      setClientsHydrated(true);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (!isClientDashboardSession) return;
    if (!currentUser?.clientId && !currentUser?.slug) return;
    const matchedClient = clients.find(
      (client) =>
        (currentUser?.clientId && client.id === currentUser.clientId) ||
        (currentUser?.slug && client.slug === currentUser.slug)
    );
    if (matchedClient && activeClientId !== matchedClient.id) {
      setActiveClientId(matchedClient.id);
    }
  }, [clients, currentUser, isClientDashboardSession, activeClientId]);

  useEffect(() => {
    if (!availablePrograms.length) {
      setSelectedProgramId("");
      return;
    }
    if (!selectedProgramId || !availablePrograms.some((program) => program.id === selectedProgramId)) {
      setSelectedProgramId(availablePrograms[0].id);
    }
  }, [availablePrograms, selectedProgramId]);

  useEffect(() => {
    setFilterWeek("All");
    setFilterLocId("All");
  }, [selectedProgramId]);

  const [refreshTick, setRefreshTick] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const summaryRequestIdRef = useRef(0);
  const lastFetchedSummaryKeyRef = useRef("");
  const refreshSummary = () => setRefreshTick((tick) => tick + 1);

  useEffect(() => {
    if (!clientsHydrated) return;

    if (!resolvedProgramId) {
      setSummary(null);
      lastFetchedSummaryKeyRef.current = "";
      return;
    }
    if (!config?.id && !(isClientDashboardSession && config?.slug)) {
      setSummary(null);
      lastFetchedSummaryKeyRef.current = "";
      return;
    }
    if (!availablePrograms.some((program) => program.id === resolvedProgramId)) {
      setSummary(null);
      lastFetchedSummaryKeyRef.current = "";
      return;
    }

    const fetchKey = `${config?.id || ""}|${config?.slug || ""}|${resolvedProgramId}|${refreshTick}`;
    if (fetchKey === lastFetchedSummaryKeyRef.current) {
      return;
    }

    const requestId = (summaryRequestIdRef.current += 1);

    const fetchSummary = async () => {
      try {
        setLoadingSummary(true);
        const url =
          isClientDashboardSession && config?.slug
            ? `/api/client-auth/programs/${encodeURIComponent(resolvedProgramId)}/summary?slug=${encodeURIComponent(config.slug)}`
            : `/api/admin/clients/${config.id}/programs/${encodeURIComponent(resolvedProgramId)}/summary`;
        const { data } = await api.get(url, { suppressErrorLog: true });
        if (requestId !== summaryRequestIdRef.current) return;
        lastFetchedSummaryKeyRef.current = fetchKey;
        setSummary(data?.data || null);
      } catch (_error) {
        if (requestId !== summaryRequestIdRef.current) return;
        setSummary(null);
      } finally {
        if (requestId === summaryRequestIdRef.current) {
          setLoadingSummary(false);
        }
      }
    };

    void fetchSummary();

    return () => {
      summaryRequestIdRef.current += 1;
    };
  }, [
    clientsHydrated,
    config?.id,
    config?.slug,
    isClientDashboardSession,
    resolvedProgramId,
    refreshTick,
  ]);

  useEffect(() => {
    const onFocus = () => refreshSummary();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const setConfig = async (newConfig, options = {}) => {
    const { patch: patchPayload, refreshSummary: shouldRefreshSummary = true } = options;
    const payload = patchPayload ?? {
      changeDescription: newConfig.changeDescription || "",
      programmeStart: newConfig.programmeStart,
      numWeeks: Number(newConfig.numWeeks),
      locations: Array.isArray(newConfig.locations) ? newConfig.locations : [],
      departments: Array.isArray(newConfig.departments) ? newConfig.departments : [],
    };
    if (!patchPayload && newConfig.dashboardPassword?.trim()) {
      payload.dashboardPassword = newConfig.dashboardPassword.trim();
    }

    const { data } = await api.patch(`/api/admin/clients/${activeClientId}`, payload);
    const updatedClient = mapApiClientToUiClient(data?.data || {});
    let mergedClient = updatedClient;
    setClients((prev) => {
      const updated = prev.map((client) => {
        if (client.id !== activeClientId) return client;
        mergedClient = {
          ...client,
          ...updatedClient,
          dashboardPassword: updatedClient.dashboardPassword || client.dashboardPassword || "",
          locations: Array.isArray(updatedClient.locations)
            ? updatedClient.locations
            : client.locations,
          departments: Array.isArray(updatedClient.departments)
            ? updatedClient.departments
            : client.departments,
          programs: Array.isArray(updatedClient.programs) ? updatedClient.programs : client.programs,
        };
        return mergedClient;
      });
      saveClients(updated);
      return updated;
    });
    if (shouldRefreshSummary) {
      refreshSummary();
    }
    return mergedClient;
  };

  const headerActions = canSeeInsights ? (
    <>
      <button
        type="button"
        onClick={() => setShowClientMgr(true)}
        style={{
          background: "transparent",
          border: "1px solid #ffffff30",
          color: "#ffffff80",
          borderRadius: 10,
          padding: "7px 14px",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        👥 Clients
      </button>
      <button
        type="button"
        onClick={() => {
          setShowSettings(true);
          void fetchClients(activeClientId);
        }}
        style={{
          background: "transparent",
          border: "1px solid #ffffff30",
          color: "#ffffff80",
          borderRadius: 10,
          padding: "7px 14px",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        ⚙️ Settings
      </button>
      {isSuperAdmin ? (
        <button
          type="button"
          onClick={() => setShowSecurity(true)}
          style={{
            background: "transparent",
            border: "1px solid #ffffff30",
            color: "#ffffff80",
            borderRadius: 10,
            padding: "7px 14px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          🔐 Security
        </button>
      ) : null}
    </>
  ) : null;

  const logoutAction = (
    <button
      type="button"
      onClick={() => {
        dispatch(clearUser());
        if (isClientDashboardSession && slug) {
          navigate(`/${slug}/login`, { replace: true });
        } else {
          navigate("/admin", { replace: true });
        }
      }}
      style={{
        background: "transparent",
        border: "1px solid #ffffff30",
        color: "#ffffff80",
        borderRadius: 10,
        padding: "7px 14px",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      Logout
    </button>
  );

  const summaryConfig = selectedProgram
    ? {
        ...config,
        programId: selectedProgram.id,
        programName: selectedProgram.name,
        programmeStart: selectedProgram.programmeStart,
        numWeeks: selectedProgram.numWeeks,
        programmeEnd: selectedProgram.programmeEnd,
      }
    : config;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Nunito Sans',sans-serif" }}>
      <style>{ADMIN_PROGRAM_BAR_CSS}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <Header
        clientName={config.clientName}
        brandTitle="Amy Jacobson"
        showLogo
        actions={
          <>
            {headerActions}
            {logoutAction}
          </>
        }
      />
      {!availablePrograms.length ? (
        <div className="liminal-admin-empty-wrap">
          <div
            style={{
              background: "#fff",
              border: `1.5px solid ${BRAND.border}`,
              borderRadius: 12,
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 15, color: BRAND.black, marginBottom: 6 }}>
              No programs configured yet
            </div>
            <p style={{ fontSize: 12, color: BRAND.grey, lineHeight: 1.6, margin: 0 }}>
              {canSeeInsights
                ? "Open Settings → Programs to add the first program. Check-ins are scoped to programs, so creating one is required before data can be collected."
                : "Your administrator hasn't added a program yet. Check-ins will appear here once one is created."}
            </p>
          </div>
        </div>
      ) : null}
      {availablePrograms.length ? (
        <div className="liminal-admin-toolbar-wrap">
          <div className="liminal-admin-toolbar-card">
            <div className="liminal-admin-toolbar-program">
              <span style={{ fontSize: 12, fontWeight: 800, color: BRAND.black }}>Program</span>
              <select
                value={resolvedProgramId}
                onChange={(event) => setSelectedProgramId(event.target.value)}
                style={{
                  ...sel,
                  width: undefined,
                  minWidth: 0,
                  fontSize: 12,
                  padding: "6px 10px",
                }}
              >
                {availablePrograms.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="liminal-admin-toolbar-actions">
              {selectedProgram ? (
                <div className="liminal-admin-toolbar-date">
                  {selectedProgram.programmeStart} to {selectedProgram.programmeEnd} ·{" "}
                  {selectedProgram.numWeeks} weeks
                </div>
              ) : null}
              <div className="liminal-admin-toolbar-count">
                {summary?.totals?.responses ?? 0} response
                {(summary?.totals?.responses ?? 0) === 1 ? "" : "s"}
              </div>
              <button
                type="button"
                onClick={refreshSummary}
                disabled={loadingSummary}
                style={{
                  border: `1px solid ${BRAND.border}`,
                  background: "#fff",
                  color: BRAND.black,
                  borderRadius: 8,
                  padding: "5px 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: loadingSummary ? "not-allowed" : "pointer",
                  opacity: loadingSummary ? 0.6 : 1,
                }}
              >
                {loadingSummary ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {availablePrograms.length ? (
        currentTab === "insights" && canSeeInsights ? (
          <Insights
            summary={summary}
            config={summaryConfig}
            onExport={onExport}
            BRAND={BRAND}
            sel={sel}
            filterWeek={filterWeek}
            filterLocId={filterLocId}
            onFilterWeekChange={setFilterWeek}
            onFilterLocIdChange={setFilterLocId}
          />
        ) : (
          <DashboardFeature
            summary={summary}
            config={summaryConfig}
            onExport={onExport}
            BRAND={BRAND}
            card={card}
            sel={sel}
            filterWeek={filterWeek}
            filterLocId={filterLocId}
            onFilterWeekChange={setFilterWeek}
            onFilterLocIdChange={setFilterLocId}
          />
        )
      ) : null}
      {exportState && (
        <ExportReportFeature
          summary={summary}
          config={summaryConfig}
          mode={exportState.mode}
          exportState={exportState}
          onExportStateChange={setExportState}
          onClose={() => setExportState(null)}
          BRAND={BRAND}
          sel={sel}
        />
      )}
      {showSettings && (
        <SettingsModal
          config={config}
          setConfig={setConfig}
          onCreateProgram={async (programPayload) => {
            const { data } = await api.post(
              `/api/admin/clients/${activeClientId}/programs`,
              programPayload
            );
            const createdProgram = data?.data;
            if (!createdProgram?.id) return null;
            const nextProgram = {
              id: createdProgram.id,
              name: createdProgram.name,
              programmeStart: new Date(createdProgram.programmeStart).toISOString().slice(0, 10),
              numWeeks: createdProgram.numWeeks,
              programmeEnd: createdProgram.programmeEnd
                ? new Date(createdProgram.programmeEnd).toISOString().slice(0, 10)
                : "",
            };
            setClients((prev) => {
              const updated = prev.map((client) =>
                client.id === activeClientId
                  ? { ...client, programs: [...(client.programs || []), nextProgram] }
                  : client
              );
              saveClients(updated);
              return updated;
            });
            setSelectedProgramId(nextProgram.id);
            return nextProgram;
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showSecurity && (
        <SecurityModal onClose={() => setShowSecurity(false)} />
      )}
      {showClientMgr && (
        <ClientsModal
          isOpen={showClientMgr}
          clients={clients}
          activeClientId={activeClientId}
          onSwitch={(id) => {
            setActiveClientId(id);
            setSummary(null);
            setShowClientMgr(false);
          }}
          onCreate={async ({ name, dashboardPassword }) => {
            try {
              const { data } = await api.post("/api/admin/clients", {
                name,
                dashboardPassword,
                programmeStart: new Date().toISOString().slice(0, 10),
                numWeeks: 8,
                locations: [],
                departments: [],
              });
              const serverClient = data?.data;
              const newClient = mapApiClientToUiClient({
                ...serverClient,
                name: serverClient?.name || name,
                slug: serverClient?.slug,
                createdAt: new Date().toISOString(),
                archived: false,
              });
              const updated = [...clients, newClient];
              setClients(updated);
              saveClients(updated);
              setActiveClientId(newClient.id);
              setSummary(null);
              setShowClientMgr(false);
              toast.success("Client added successfully.");
            } catch (error) {
              const message = error.response?.data?.message || "Failed to create client.";
              toast.error(message);
            }
          }}
          onArchive={(id) => {
            const updated = clients.map((client) =>
              client.id === id ? { ...client, archived: true } : client
            );
            setClients(updated);
            saveClients(updated);
            if (id === activeClientId) {
              const firstActive = updated.find((client) => !client.archived);
              if (firstActive) {
                setActiveClientId(firstActive.id);
                setSummary(null);
              }
            }
          }}
          onRestore={(id) => {
            const updated = clients.map((client) =>
              client.id === id ? { ...client, archived: false } : client
            );
            setClients(updated);
            saveClients(updated);
          }}
          onClose={() => setShowClientMgr(false)}
        />
      )}
      <Footer brandTitle="Amy Jacobson" showLogo />
    </div>
  );
};

export default AdminDashboard;
