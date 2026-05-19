import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../utils/axios";
import { setUser } from "../store/slices/authSlice";

const BRAND = {
  black: "#25282A",
  blue: "#0092E7",
  grey: "#64748b",
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

function SecurityModal({ onClose }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!currentPassword.trim()) return "Current password is required.";
    if (!newPassword.trim()) return "New password is required.";
    if (newPassword.length < 6) return "New password must be at least 6 characters.";
    if (newPassword === currentPassword) return "New password must be different from current password.";
    if (newPassword !== confirmPassword) return "New password and confirmation do not match.";
    return "";
  };

  const handleSave = async () => {
    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    try {
      setSaving(true);
      setError("");
      const patchPayload = {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      };
      let response;
      try {
        response = await api.patch("/api/admin/password", patchPayload);
      } catch (patchError) {
        const status = patchError?.response?.status;
        const code = patchError?.response?.data?.code;
        const isInvalidToken = status === 401 && (code === "TOKEN_INVALID" || code === "TOKEN_MISSING");
        if (!isInvalidToken) {
          throw patchError;
        }

        // Recover from stale/expired token by re-authenticating with current password.
        const { data: loginData } = await api.post("/api/admin/login", {
          password: currentPassword.trim(),
        });
        const authData = loginData?.data;
        if (!authData?.token) {
          throw patchError;
        }
        dispatch(
          setUser({
            ...(currentUser || {}),
            role: authData?.role || currentUser?.role || "AMY_SUPER_ADMIN",
            name: authData?.name || currentUser?.name || "Ammy",
            liminalAccess: currentUser?.liminalAccess || "insights",
            token: authData.token,
          })
        );
        response = await api.patch("/api/admin/password", patchPayload);
      }

      const refreshedToken = response?.data?.data?.token;
      if (refreshedToken && currentUser) {
        dispatch(setUser({ ...currentUser, token: refreshedToken }));
      }
      setSaved(true);
      toast.success("Password updated successfully.");
      window.setTimeout(() => {
        setSaved(false);
        onClose?.();
      }, 800);
    } catch (saveError) {
      const apiError = saveError.response?.data;
      const detailMessage = Array.isArray(apiError?.details) && apiError.details.length
        ? apiError.details.map((detail) => detail.message).join(" | ")
        : "";
      const message = detailMessage || apiError?.message || "Failed to update password.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const renderPasswordField = (label, value, setValue, show, setShow, placeholder) => (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, paddingRight: 44 }}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            color: BRAND.grey,
            cursor: "pointer",
            fontSize: 14,
            padding: 0,
            lineHeight: 1,
          }}
        >
          {show ? "🙈" : "👁"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 1000, overflow: "auto", padding: "20px 16px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", background: "#fff", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ background: BRAND.black, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>🔐 Security</div>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "1px solid #ffffff40", color: "#fff", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>
            ✕ Close
          </button>
        </div>
        <div style={{ padding: 22, overflowY: "auto", maxHeight: "80vh" }}>
          <div style={card}>
            <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.black, marginBottom: 6 }}>
              Update Insights Password
            </div>
            <div style={{ fontSize: 11, color: BRAND.grey, marginBottom: 14, lineHeight: 1.5 }}>
              This password is used to access the superadmin Insights dashboard. Keep it private.
            </div>

            {renderPasswordField(
              "Current Password",
              currentPassword,
              setCurrentPassword,
              showCurrent,
              setShowCurrent,
              "Enter current password"
            )}
            {renderPasswordField(
              "New Password",
              newPassword,
              setNewPassword,
              showNew,
              setShowNew,
              "At least 6 characters"
            )}
            {renderPasswordField(
              "Confirm New Password",
              confirmPassword,
              setConfirmPassword,
              showConfirm,
              setShowConfirm,
              "Re-enter new password"
            )}

            {error ? (
              <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{error}</div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: 11,
              border: "none",
              background: saved ? "#16a34a" : BRAND.black,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "'Nunito Sans',sans-serif",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Updating..." : saved ? "✓ Updated!" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecurityModal;
