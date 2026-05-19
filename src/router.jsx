import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Login from "./pages/Login";
import UnauthorizedPage from "./pages/Unauthor";
import AuthRedirect from "./utils/AuthRedirect";
import NotFound from "./pages/NotFound";
import WebsiteLayout from "./layouts/WebsiteLayout";
import HomePage from "./pages/website/home";
import AdminDashboard from "./pages/adminRole/dashboard";
import ClientDashboardGuard from "./utils/ClientDashboardGuard";
import ClientLogin from "./pages/ClientLogin";
import Header from "./components/Header";
import Footer from "./components/Footer";
import api from "./utils/axios";

const PublicLanding = () => <Navigate to="/admin" replace />;
const TenantCheckinPage = () => {
  const { slug } = useParams();
  const [clientConfig, setClientConfig] = useState(null);
  const [isSlugNotFound, setIsSlugNotFound] = useState(false);

  const fallbackName = useMemo(
    () =>
      (slug || "Client")
        .split("-")
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" "),
    [slug]
  );

  useEffect(() => {
    const fetchContext = async () => {
      setIsSlugNotFound(false);
      try {
        const { data } = await api.get(`/api/client-auth/context/${slug}`);
        const context = data?.data;
        if (!context) {
          setIsSlugNotFound(true);
          return;
        }
        setClientConfig({
          slug: context.slug || slug,
          clientName: context.name,
          changeDescription: context.changeDescription,
          programmeStart: context.programmeStart
            ? new Date(context.programmeStart).toISOString().slice(0, 10)
            : "2025-03-03",
          numWeeks: context.numWeeks || 8,
          locations: context.locations || [],
          departments: context.departments || [],
          programs: context.programs || [],
          activeProgram: context.activeProgram || null
        });
      } catch (_error) {
        setClientConfig(null);
        setIsSlugNotFound(true);
      }
    };
    fetchContext();
  }, [slug, fallbackName]);

  if (isSlugNotFound) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        clientName={clientConfig?.clientName || fallbackName}
        brandTitle="Amy Jacobson"
        showLogo
        homePath={`/${slug}`}
      />
      <main className="flex-1">
        <HomePage config={clientConfig || undefined} />
      </main>
      <Footer brandTitle="Amy Jacobson" showLogo />
    </div>
  );
};
const TenantDashboardPage = () => (
  <ClientDashboardGuard>
    <AdminDashboard />
  </ClientDashboardGuard>
);
const AmyAdminPage = () => <Login />;
const SuperAdminDashboardRoute = () => {
  const user = useSelector((state) => state.auth.user);
  if (!user || user.role !== "AMY_SUPER_ADMIN") {
    return <Navigate to="/admin" replace />;
  }
  return <AdminDashboard />;
};

const AppRouter = () => {
  return (
    <Routes>

      <Route path="/" element={<WebsiteLayout />}>
        <Route index element={<PublicLanding />} />
      </Route>

      {/* Multi-tenant MVP routing (path-based by slug) */}
      <Route path="/:slug" element={<TenantCheckinPage />} />
      <Route path="/:slug/login" element={<ClientLogin />} />
      <Route path="/:slug/dashboard" element={<TenantDashboardPage />} />
      <Route path="/admin" element={<AmyAdminPage />} />

      {/* Authentication routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<AuthRedirect />} />
      <Route path="/admin/dashboard" element={<SuperAdminDashboardRoute />} />

      {/* Unauthorized page */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Legacy admin shell removed by requirement */}

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
