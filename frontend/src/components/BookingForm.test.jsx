import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookingForm from "../components/BookingForm";

const listing = { pricePerNight: 50, maxGuests: 3 };

describe("BookingForm", () => {
  test("renders check-in, check-out, and guests fields", () => {
    render(<BookingForm listing={listing} onSubmit={vi.fn()} submitting={false} />);

    expect(screen.getByLabelText(/check-in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/check-out/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/guests/i)).toBeInTheDocument();
  });

  test("shows a validation error when check-out is before check-in", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BookingForm listing={listing} onSubmit={onSubmit} submitting={false} />);

    await user.type(screen.getByLabelText(/check-in/i), "2030-06-10");
    await user.type(screen.getByLabelText(/check-out/i), "2030-06-05");
    await user.click(screen.getByRole("button", { name: /request to book/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/after check-in/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("shows a validation error when guests exceed the listing's max", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BookingForm listing={listing} onSubmit={onSubmit} submitting={false} />);

    await user.type(screen.getByLabelText(/check-in/i), "2030-06-10");
    await user.type(screen.getByLabelText(/check-out/i), "2030-06-12");

    const guestsInput = screen.getByLabelText(/guests/i);
    await user.clear(guestsInput);
    await user.type(guestsInput, "10");
    await user.click(screen.getByRole("button", { name: /request to book/i }));

    expect(await screen.findByText(/maximum of 3 guests/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("submits with the correct payload when the form is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue();
    render(<BookingForm listing={listing} onSubmit={onSubmit} submitting={false} />);

    await user.type(screen.getByLabelText(/check-in/i), "2030-06-10");
    await user.type(screen.getByLabelText(/check-out/i), "2030-06-13");
    await user.click(screen.getByRole("button", { name: /request to book/i }));

    expect(onSubmit).toHaveBeenCalledWith({ checkIn: "2030-06-10", checkOut: "2030-06-13", guests: 1 });
  });

  test("shows the calculated total once both dates are filled in", async () => {
    const user = userEvent.setup();
    render(<BookingForm listing={listing} onSubmit={vi.fn()} submitting={false} />);

    await user.type(screen.getByLabelText(/check-in/i), "2030-06-10");
    await user.type(screen.getByLabelText(/check-out/i), "2030-06-13");

    // 3 nights * $50 = $150
    expect(await screen.findByText("$150")).toBeInTheDocument();
  });
});
