import { Link, useNavigate } from "react-router-dom";
import { Home, LogOut, LayoutDashboard, CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, status, isHost, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="border-b border-line bg-panel">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <Home className="w-5 h-5 text-teal" strokeWidth={2.25} aria-hidden="true" />
          <span className="font-display font-bold text-2xl leading-none">Haven</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {status === "authed" ? (
            <>
              <Link
                to="/bookings"
                className="flex items-center gap-1.5 text-sm text-muted hover:text-ink px-2 sm:px-3 py-2 rounded-lg transition-colors"
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">My Bookings</span>
              </Link>
              {isHost && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-sm text-muted hover:text-ink px-2 sm:px-3 py-2 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              )}
              <span className="hidden sm:inline text-xs text-muted font-mono px-2">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm border border-line rounded-full px-3 py-2 text-muted hover:text-ink hover:border-teal/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted hover:text-ink px-3 py-2">
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-teal text-teal-ink px-4 py-2 rounded-full hover:brightness-110 transition"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
