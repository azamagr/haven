import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BrowsePage from "../pages/BrowsePage";
import * as useListingsModule from "../hooks/useListings";

function renderPage() {
  return render(
    <MemoryRouter>
      <BrowsePage />
    </MemoryRouter>
  );
}

describe("BrowsePage", () => {
  test("shows a loading grid while fetching", () => {
    vi.spyOn(useListingsModule, "useListings").mockReturnValue({
      listings: [],
      status: "loading",
      errorMessage: "",
      retry: vi.fn(),
    });

    renderPage();
    expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
  });

  test("shows an empty state with zero matching listings", () => {
    vi.spyOn(useListingsModule, "useListings").mockReturnValue({
      listings: [],
      status: "success",
      errorMessage: "",
      retry: vi.fn(),
    });

    renderPage();
    expect(screen.getByText(/no listings match your search/i)).toBeInTheDocument();
  });

  test("renders a card for each fetched listing", () => {
    vi.spyOn(useListingsModule, "useListings").mockReturnValue({
      listings: [
        {
          _id: "1",
          title: "Test Cabin",
          location: "Somewhere",
          category: "Cabin",
          pricePerNight: 40,
          maxGuests: 2,
          photo: { url: "x.jpg", alt: "A cabin" },
        },
      ],
      status: "success",
      errorMessage: "",
      retry: vi.fn(),
    });

    renderPage();
    expect(screen.getByText("Test Cabin")).toBeInTheDocument();
  });
});
