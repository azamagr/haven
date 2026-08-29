import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import BrowsePage from "./pages/BrowsePage";
import ListingDetailPage from "./pages/ListingDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import HostDashboardPage from "./pages/HostDashboardPage";
import CreateListingPage from "./pages/CreateListingPage";
import EditListingPage from "./pages/EditListingPage";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-ink font-body">
      <Header />
      <Routes>
        <Route path="/" element={<BrowsePage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireRole="host">
              <HostDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/new"
          element={
            <ProtectedRoute requireRole="host">
              <CreateListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/edit/:id"
          element={
            <ProtectedRoute requireRole="host">
              <EditListingPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <footer className="max-w-6xl mx-auto px-5 sm:px-8 py-10 text-xs text-muted font-mono border-t border-line mt-10">
        Haven · Capstone project · Week 6 internship task
      </footer>
    </div>
  );
}
