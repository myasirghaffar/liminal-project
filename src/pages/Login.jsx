import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import api from "../utils/axios";
import { setUser } from "../store/slices/authSlice";
import { LOGO_LIGHT} from "../assets/icons"
import Header from "../components/Header";
import Footer from "../components/Footer";

const BRAND = {
  black: "#25282A",
  blue: "#0092E7",
  lightBlue: "#E8F5FD",
  grey: "#64748b",
  lightGrey: "#f8fafc",
  border: "#e2e8f0",
};

const sel = {
  width: "100%",
  border: `1px solid ${BRAND.border}`,
  borderRadius: 10,
  background: "#fff",
  color: BRAND.black,
  outline: "none",
  fontFamily: "'Nunito Sans',sans-serif",
  fontSize: 13,
  padding: "10px 12px",
};

const btn = {
  width: "100%",
  border: "none",
  borderRadius: 10,
  background: BRAND.black,
  color: "#fff",
  padding: "10px 12px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const getAdminLoginErrorMessage = (error) => {
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

const Login = () => {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const attempt = async () => {
    if (submitting) {
      return;
    }

    const normalized = pass.trim();

    if (!normalized) {
      setError("Please enter your password.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const { data } = await api.post("/api/admin/login", { password: normalized });
      const authData = data?.data;
      dispatch(
        setUser({
          role: authData?.role || "AMY_SUPER_ADMIN",
          name: authData?.name || "Ammy",
          liminalAccess: "insights",
          token: authData?.token
        })
      );
      setError("");
      toast.success("Access granted.");
      navigate("/admin/dashboard?tab=insights");
    } catch (err) {
      const message = getAdminLoginErrorMessage(err);
      setError(message);
      toast.error(message, { toastId: "admin-login-error" });
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
      <Header />
      <div style={{ maxWidth: 380, margin: "40px auto", padding: "0 16px", flex: 1, width: "100%", position: "relative" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "36px 28px",
            border: `1.5px solid ${BRAND.border}`,
            boxShadow: "0 4px 24px #00000010",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <img src={LOGO_LIGHT} alt="Amy Jacobson" style={{ height: 28, width: "auto" }} />
          </div>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: BRAND.lightBlue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              margin: "0 auto 14px",
            }}
          >
            🔒
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: BRAND.black, marginBottom: 5 }}>Super Admin Access</h2>
          <p style={{ fontSize: 12, color: BRAND.grey, marginBottom: 20 }}>Enter your password to access reporting</p>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <input
              type={showPassword ? "text" : "password"}
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                if (error) {
                  setError("");
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && attempt()}
              placeholder="Password"
              aria-invalid={Boolean(error)}
              style={{
                ...sel,
                marginBottom: 0,
                textAlign: "center",
                paddingRight: 44,
                border: `1px solid ${error ? "#dc2626" : BRAND.border}`,
                background: error ? "#fef2f2" : "#fff",
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
                color: BRAND.grey,
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
            <p style={{ fontSize: 11, color: BRAND.grey, marginBottom: 8, textAlign: "left" }}>
              Enter the super admin password to access reporting.
            </p>
          )}
          <button type="button" onClick={attempt} disabled={submitting} style={btn}>
            {submitting ? "Checking..." : "Access"}
          </button>
          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              background: BRAND.lightGrey,
              borderRadius: 8,
              fontSize: 11,
              color: BRAND.grey,
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Access:</div>
            <div>💡 Super admin access to Insights and all clients</div>
          </div>
          <Link
            to="/"
            style={{
              display: "inline-block",
              marginTop: 12,
              fontSize: 11,
              color: BRAND.grey,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
