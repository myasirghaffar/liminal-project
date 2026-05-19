import React, { useEffect, useState } from "react";

const BRAND = {
  black: "#25282A",
  blue: "#0092E7",
  lightBlue: "#E8F5FD",
  lightGrey: "#f8fafc",
  grey: "#64748b",
  border: "#e2e8f0",
};

function ClientsModal({
  clients,
  activeClientId,
  onSwitch,
  onCreate,
  onArchive,
  onRestore,
  onClose,
  isOpen = false,
}) {
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const activeClients = clients.filter((client) => !client.archived);
  const archivedClients = clients.filter((client) => client.archived);
  const namePattern = /^[A-Za-z0-9][A-Za-z0-9\s-]*$/;

  const normalize = (value) => value.trim().toLowerCase();
  const existingNameSet = new Set(clients.map((client) => normalize(client.clientName || "")));

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

  const validateName = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Organisation name is required";
    if (trimmed.length < 2) return "Organisation name must be at least 2 characters";
    if (!namePattern.test(trimmed)) {
      return "Use letters, numbers, spaces, and hyphens only";
    }
    if (existingNameSet.has(normalize(trimmed))) {
      return "Organisation name already exists";
    }
    return "";
  };

  const validatePassword = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Dashboard password is required";
    if (trimmed.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const resetForm = () => {
    setNewName("");
    setNewPassword("");
    setNameError("");
    setPasswordError("");
    setShowPassword(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (isCreating) {
      return;
    }

    const trimmedName = newName.trim();
    const trimmedPassword = newPassword.trim();
    const nextNameError = validateName(trimmedName);
    const nextPasswordError = validatePassword(trimmedPassword);
    setNameError(nextNameError);
    setPasswordError(nextPasswordError);
    if (nextNameError || nextPasswordError) {
      return;
    }

    try {
      setIsCreating(true);
      await onCreate({ name: trimmedName, dashboardPassword: trimmedPassword });
      resetForm();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1100, overflow: "auto", padding: "20px 16px" }}>
      <div style={{ maxWidth: 720, maxHeight: "calc(100vh - 40px)", margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ background: BRAND.black, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>👥 Client Manager</div>
          <button
            type="button"
            onClick={() => {
              if (isCreating) return;
              resetForm();
              onClose();
            }}
            disabled={isCreating}
            style={{ background: "transparent", border: "1px solid #ffffff40", color: "#fff", borderRadius: 8, padding: "5px 12px", cursor: isCreating ? "not-allowed" : "pointer", fontSize: 12, opacity: isCreating ? 0.6 : 1 }}
          >
            ✕ Close
          </button>
        </div>
        <div style={{ padding: 22, overflowY: "auto" }}>
          <div style={{ background: BRAND.lightBlue, border: `1px solid ${BRAND.blue}25`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: BRAND.black, marginBottom: 10 }}>➕ Create New Client</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={newName}
                onChange={(event) => {
                  const value = event.target.value;
                  setNewName(value);
                  setNameError(validateName(value));
                }}
                onKeyDown={(event) => event.key === "Enter" && handleCreate()}
                placeholder="Organisation name (e.g. Mercy Health)"
                autoComplete="off"
                disabled={isCreating}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            {nameError ? <div style={{ fontSize: 11, color: "#dc2626", marginBottom: 8 }}>{nameError}</div> : null}
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  value={newPassword}
                  onChange={(event) => {
                    const value = event.target.value;
                    setNewPassword(value);
                    setPasswordError(validatePassword(value));
                  }}
                  onKeyDown={(event) => event.key === "Enter" && handleCreate()}
                  type={showPassword ? "text" : "password"}
                  placeholder="Dashboard password"
                  autoComplete="new-password"
                  disabled={isCreating}
                  style={{ ...inputStyle, paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide dashboard password" : "Show dashboard password"}
                  disabled={isCreating}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: BRAND.grey,
                    cursor: isCreating ? "not-allowed" : "pointer",
                    fontSize: 16,
                    padding: 0,
                    lineHeight: 1,
                    opacity: isCreating ? 0.6 : 1,
                  }}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              <button type="button" onClick={handleCreate} disabled={isCreating} style={{ padding: "9px 16px", borderRadius: 9, border: "none", background: BRAND.blue, color: "#fff", fontSize: 13, fontWeight: 700, cursor: isCreating ? "wait" : "pointer", whiteSpace: "nowrap", opacity: isCreating ? 0.8 : 1, minWidth: 88 }}>
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
            {passwordError ? <div style={{ fontSize: 11, color: "#dc2626", marginTop: 6 }}>{passwordError}</div> : null}
            {isCreating ? <div style={{ fontSize: 11, color: BRAND.grey, marginTop: 6 }}>Creating client...</div> : null}
            <div style={{ fontSize: 10, color: BRAND.grey, marginTop: 6 }}>Each client gets isolated configuration/data and required dashboard password.</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: BRAND.black, marginBottom: 10 }}>Active Clients ({activeClients.length})</div>
            {activeClients.map((client) => (
              <div key={client.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${client.id === activeClientId ? BRAND.blue : BRAND.border}`, background: client.id === activeClientId ? BRAND.lightBlue : "#fff", marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: BRAND.black }}>{client.clientName}</div>
                  <div style={{ fontSize: 11, color: BRAND.grey }}>Created {new Date(client.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {client.id !== activeClientId ? (
                    <button type="button" onClick={() => onSwitch(client.id)} style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: BRAND.blue, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      Switch
                    </button>
                  ) : (
                    <span style={{ padding: "5px 10px", borderRadius: 7, background: BRAND.blue, color: "#fff", fontSize: 11, fontWeight: 700 }}>Active</span>
                  )}
                  {activeClients.length > 1 && (
                    <button type="button" onClick={() => onArchive(client.id)} style={{ padding: "5px 10px", borderRadius: 7, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      Archive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {archivedClients.length > 0 && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: BRAND.grey, marginBottom: 10 }}>Archived ({archivedClients.length})</div>
              {archivedClients.map((client) => (
                <div key={client.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${BRAND.border}`, background: BRAND.lightGrey, marginBottom: 8, opacity: 0.7 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: BRAND.grey }}>{client.clientName}</div>
                    <div style={{ fontSize: 11, color: BRAND.grey }}>Created {new Date(client.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                  <button type="button" onClick={() => onRestore(client.id)} style={{ padding: "5px 12px", borderRadius: 7, background: BRAND.lightGrey, color: BRAND.grey, fontSize: 11, fontWeight: 700, cursor: "pointer", border: `1px solid ${BRAND.border}` }}>
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientsModal;
