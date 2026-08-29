import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import * as AuthContext from "../context/AuthContext";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("renders email and password fields with a submit button", () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ login: vi.fn() });
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  test("shows a validation error for an invalid email and never calls login", async () => {
    const login = vi.fn();
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ login });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/valid email/i);
    expect(login).not.toHaveBeenCalled();
  });

  test("calls login with the entered credentials on valid submit", async () => {
    const login = vi.fn().mockResolvedValue();
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ login });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), "guest@haven.test");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(login).toHaveBeenCalledWith({ email: "guest@haven.test", password: "password123" });
  });

  test("shows a server error message when login fails", async () => {
    const login = vi.fn().mockRejectedValue(new Error("Invalid email or password"));
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ login });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), "guest@haven.test");
    await user.type(screen.getByLabelText(/^password$/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });
});
