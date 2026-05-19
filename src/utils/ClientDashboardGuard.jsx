import { useSelector } from "react-redux";
import { Navigate, useLocation, useParams } from "react-router-dom";

const ClientDashboardGuard = ({ children }) => {
  const { slug } = useParams();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const isClientSession =
    isAuthenticated && user?.role === "CLIENT_ADMIN" && user?.slug === slug;

  if (!isClientSession) {
    return <Navigate to={`/${slug}/login`} replace state={{ from: location }} />;
  }

  return children;
};

export default ClientDashboardGuard;
