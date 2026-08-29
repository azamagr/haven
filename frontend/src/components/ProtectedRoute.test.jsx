import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import * as AuthContext from "../context/AuthContext";

function renderProtected(routeState, requireRole) {
  vi.spyOn(AuthContext, "useAuth").mockReturnValue(routeState);

  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireRole={requireRole}>
              <div>Secret Dashboard Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  test("redirects to /login when the user is not authenticated", () => {
    renderProtected({ status: "guest", user: null });

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Secret Dashboard Content")).not.toBeInTheDocument();
  });

  test("renders the protected content once authenticated", () => {
    renderProtected({ status: "authed", user: { role: "guest" } });

    expect(screen.getByText("Secret Dashboard Content")).toBeInTheDocument();
  });

  test("blocks a guest-role user from a host-only route (RBAC)", () => {
    renderProtected({ status: "authed", user: { role: "guest" } }, "host");

    expect(screen.getByText(/hosts only/i)).toBeInTheDocument();
    expect(screen.queryByText("Secret Dashboard Content")).not.toBeInTheDocument();
  });

  test("allows a host-role user through a host-only route (RBAC)", () => {
    renderProtected({ status: "authed", user: { role: "host" } }, "host");

    expect(screen.getByText("Secret Dashboard Content")).toBeInTheDocument();
  });
});
