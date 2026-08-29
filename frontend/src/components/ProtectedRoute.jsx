import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireRole }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-muted text-sm font-mono">Checking your session…</p>
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-5">
        <p className="font-display text-2xl">Hosts only</p>
        <p className="text-sm text-muted mt-2">
          This page is only available to accounts with a host role. You're signed in as a {user?.role}.
        </p>
      </div>
    );
  }

  return children;
}
