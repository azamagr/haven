import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ListingCard from "../components/ListingCard";

const listing = {
  _id: "abc123",
  title: "Sunlit Cabin",
  location: "Nathia Gali",
  category: "Cabin",
  pricePerNight: 85,
  maxGuests: 4,
  photo: { url: "https://example.com/cabin.jpg", alt: "A wooden cabin in the pines" },
};

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("ListingCard", () => {
  test("renders the title, location, price, and category", () => {
    renderWithRouter(<ListingCard listing={listing} />);

    expect(screen.getByText("Sunlit Cabin")).toBeInTheDocument();
    expect(screen.getByText("Nathia Gali")).toBeInTheDocument();
    expect(screen.getByText("Cabin")).toBeInTheDocument();
    expect(screen.getByText(/\$85/)).toBeInTheDocument();
  });

  test("renders the image with descriptive alt text, not empty or generic", () => {
    renderWithRouter(<ListingCard listing={listing} />);

    const img = screen.getByAltText("A wooden cabin in the pines");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", listing.photo.url);
  });

  test("links to the correct listing detail page", () => {
    renderWithRouter(<ListingCard listing={listing} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/listings/abc123");
  });
});
