import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/axios";
import { setUser } from "../store/slices/authSlice";
import Header from "../components/Header";
import Footer from "../components/Footer";

const getClientLoginErrorMessage = (error) => {
  const apiError = error?.response?.data;
  const details = Array.isArray(apiError?.details) ? apiError.details : [];
  const passwordDetail = details.find((detail) => detail?.path === "password");

  if (passwordDetail?.message) {
    return passwordDetail.message
      .replace(/"password"/gi, "Password")
      .replace(/\s+long$/i, "");
  }

  if (apiError?.code === "INVALID_CREDENTIALS") {
    return "Invalid password. Please check and try again.";
  }

  if (apiError?.message) {
    return apiError.message;
  }

  return "Unable to sign in right now. Please try again.";
};

const ClientLogin = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fallbackName = (slug || "Client")
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

  const handleSubmit = async () => {
    const normalized = password.trim();
    if (!normalized) {
      setError("Please enter your dashboard password.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const { data } = await api.post("/api/client-auth/login", {
        slug,
        password: normalized
      });

      const authData = data?.data;
      dispatch(
        setUser({
          role: authData?.role || "CLIENT_ADMIN",
          slug: authData?.client?.slug || slug,
          clientId: authData?.client?.id,
          clientName: authData?.client?.name,
          token: authData?.token
        })
      );
      toast.success("Dashboard access granted.");
      navigate(`/${slug}/dashboard`, { replace: true });
    } catch (err) {
      const message = getClientLoginErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Nunito Sans',sans-serif", display: "flex", flexDirection: "column" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <Header clientName={fallbackName} brandTitle="Amy Jacobson" showLogo homePath={`/${slug}`} />
      <div style={{ maxWidth: 380, margin: "40px auto", padding: "0 16px", flex: 1, width: "100%" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "36px 28px",
            border: "1.5px solid #e2e8f0",
            boxShadow: "0 4px 24px #00000010",
            textAlign: "center",
            minHeight: 430,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: "#25282A", marginBottom: 8 }}>
            {fallbackName}
          </div>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "#E8F5FD",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              margin: "0 auto 14px",
            }}
          >
            🔒
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: "#25282A", marginBottom: 5 }}>Dashboard Access</h2>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
            Enter dashboard password for <strong>{fallbackName}</strong>
          </p>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) {
                  setError("");
                }
              }}
              onKeyDown={(event) => event.key === "Enter" && handleSubmit()}
              placeholder="Dashboard password"
              aria-invalid={Boolean(error)}
              style={{
                width: "100%",
                border: `1px solid ${error ? "#dc2626" : "#e2e8f0"}`,
                borderRadius: 10,
                background: error ? "#fef2f2" : "#fff",
                color: "#25282A",
                outline: "none",
                fontSize: 13,
                padding: "10px 40px 10px 12px",
                marginBottom: 0,
                textAlign: "center",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                color: "#64748b",
                cursor: "pointer",
                fontSize: 16,
                padding: 0,
                lineHeight: 1,
              }}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>
          {error ? (
            <p style={{ fontSize: 11, color: "#dc2626", marginBottom: 8, textAlign: "left" }}>{error}</p>
          ) : (
            <p style={{ fontSize: 11, color: "#64748b", marginBottom: 8, textAlign: "left" }}>
              Use the dashboard password shared by your admin.
            </p>
          )}
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 10,
              background: "#25282A",
              color: "#fff",
              padding: "10px 12px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {submitting ? "Checking..." : "Access Dashboard"}
          </button>
          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              background: "#f8fafc",
              borderRadius: 8,
              fontSize: 11,
              color: "#64748b",
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Access level:</div>
            <div>📊 Dashboard password — scores, trends & participation</div>
          </div>
          <p style={{ fontSize: 10, color: "#cbd5e1", marginTop: 12 }}>
            Contact admin if password is not working.
          </p>
          <Link
            to={`/${slug}`}
            style={{
              display: "inline-block",
              marginTop: 12,
              fontSize: 11,
              color: "#64748b",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to check-in
          </Link>
        </div>
      </div>
      <div style={{ position: "fixed", right: 24, top: "50%", transform: "translateY(-50%)", zIndex: 20 }}>
        <Link
          to="/admin"
          style={{
            display: "inline-block",
            border: "1px solid #16a34a40",
            background: "#f0fdf4",
            color: "#15803d",
            borderRadius: 999,
            padding: "10px 16px",
            fontSize: 12,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 10px 24px #16a34a14",
            minWidth: 132,
            textAlign: "center",
          }}
        >
          💡 Admin Login
        </Link>
      </div>
      <Footer brandTitle="Amy Jacobson" showLogo />
    </div>
  );
};

export default ClientLogin;
