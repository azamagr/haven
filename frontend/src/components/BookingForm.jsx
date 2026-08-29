import { useState } from "react";
import { Loader2 } from "lucide-react";
import { validateDateRange } from "../utils/validators";
import { formatCurrency, nightsBetween } from "../utils/format";

export default function BookingForm({ listing, onSubmit, submitting }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [errors, setErrors] = useState({});

  const nights = nightsBetween(checkIn, checkOut);
  const total = nights * listing.pricePerNight;

  function validate() {
    const dateError = validateDateRange(checkIn, checkOut);
    const guestError =
      Number(guests) > listing.maxGuests ? `This listing sleeps a maximum of ${listing.maxGuests} guests.` : "";
    const next = { dates: dateError, guests: guestError };
    setErrors(next);
    return !dateError && !guestError;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ checkIn, checkOut, guests: Number(guests) });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-line bg-panel p-5 space-y-3">
      <p className="font-mono text-lg font-medium">
        {formatCurrency(listing.pricePerNight)} <span className="text-muted text-sm font-normal">/ night</span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="check-in" className="block text-xs font-medium text-muted mb-1.5">
            Check-in
          </label>
          <input
            id="check-in"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full bg-bg border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal/60"
          />
        </div>
        <div>
          <label htmlFor="check-out" className="block text-xs font-medium text-muted mb-1.5">
            Check-out
          </label>
          <input
            id="check-out"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full bg-bg border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal/60"
          />
        </div>
      </div>
      {errors.dates && (
        <p role="alert" className="text-xs text-red-600">
          {errors.dates}
        </p>
      )}

      <div>
        <label htmlFor="guests" className="block text-xs font-medium text-muted mb-1.5">
          Guests
        </label>
        <input
          id="guests"
          type="number"
          min={1}
          max={listing.maxGuests}
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full bg-bg border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal/60"
        />
        {errors.guests && (
          <p role="alert" className="text-xs text-red-600 mt-1">
            {errors.guests}
          </p>
        )}
      </div>

      {nights > 0 && (
        <div className="flex items-center justify-between text-sm pt-2 border-t border-line">
          <span className="text-muted">
            {formatCurrency(listing.pricePerNight)} × {nights} night{nights > 1 ? "s" : ""}
          </span>
          <span className="font-mono font-medium">{formatCurrency(total)}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-teal text-teal-ink font-medium text-sm px-4 py-2.5 rounded-full hover:brightness-110 transition disabled:opacity-50"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitting ? "Booking…" : "Request to book"}
      </button>
    </form>
  );
}
