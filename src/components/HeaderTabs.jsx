import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const HeaderTabs = () => {
  const { pathname, search } = useLocation();
  const currentUser = useSelector((state) => state.auth.user);
  const canSeeInsights =
    currentUser?.role === "AMY_SUPER_ADMIN" || currentUser?.liminalAccess === "insights";
  const isAdminPath = pathname.startsWith("/admin");
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  const isTenantPath = Boolean(firstSegment && !["admin", "login", "dashboard", "unauthorized"].includes(firstSegment));
  const tenantSlug = isTenantPath ? firstSegment : null;
  const isDashboardFlow =
    pathname === "/login" ||
    pathname === "/dashboard" ||
    pathname.endsWith("/dashboard") ||
    pathname.endsWith("/login") ||
    isAdminPath;
  const currentTab = new URLSearchParams(search).get("tab") || "dashboard";
  const checkinPath = tenantSlug ? `/${tenantSlug}` : "/";
  const dashboardPath = isAdminPath
    ? "/admin/dashboard?tab=dashboard"
    : tenantSlug
      ? `/${tenantSlug}/dashboard`
      : "/admin";

  const showCheckinTab = !isAdminPath;

  const tabs = [
    ...(showCheckinTab
      ? [{ id: "checkin", label: "✏️ Check-In", color: "#0092E7", to: checkinPath, active: !isDashboardFlow }]
      : []),
    { id: "dashboard", label: "📊 Dashboard", color: "#FF8D6D", to: dashboardPath, active: isDashboardFlow && currentTab !== "insights" },
    ...(canSeeInsights && isAdminPath
      ? [{ id: "insights", label: "💡 Insights", color: "#16a34a", to: "/admin/dashboard?tab=insights", active: currentTab === "insights" }]
      : []),
  ];

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex" }}>
      {tabs.map(({ id, label, color, to, active }) => (
        <Link
          key={id}
          to={to}
          style={{
            flex: 1,
            padding: "13px 6px",
            textAlign: "center",
            textDecoration: "none",
            borderBottom: active ? `3px solid ${color}` : "3px solid transparent",
            background: "transparent",
            color: active ? color : "#64748b",
            fontSize: 13,
            fontWeight: active ? 800 : 600,
            cursor: "pointer",
            fontFamily: "'Nunito Sans',sans-serif",
          }}
        >
          {label}
        </Link>
      ))}
    </div>
  );
};

export default HeaderTabs;
