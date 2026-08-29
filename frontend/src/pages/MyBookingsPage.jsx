import { CalendarX, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useMyBookings } from "../hooks/useMyBookings";
import { useToast } from "../context/ToastContext";
import LoadingGrid from "../components/LoadingGrid";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { formatCurrency, formatDate } from "../utils/format";

export default function MyBookingsPage() {
  const { bookings, status, errorMessage, reload, cancel } = useMyBookings();
  const { showToast } = useToast();

  async function handleCancel(id) {
    try {
      await cancel(id);
      showToast("success", "Booking cancelled.");
    } catch (err) {
      showToast("error", err.message || "Couldn't cancel that booking.");
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
      <h1 className="font-display font-bold text-3xl mb-6">My Bookings</h1>

      {status === "loading" && <LoadingGrid count={2} />}
      {status === "error" && <ErrorState message={errorMessage} onRetry={reload} />}
      {status === "success" && bookings.length === 0 && (
        <EmptyState
          icon={CalendarX}
          title="No bookings yet"
          description="Once you book a stay, it'll show up here."
          action={
            <Link
              to="/"
              className="inline-block mt-5 bg-teal text-teal-ink font-medium text-sm px-5 py-2.5 rounded-full hover:brightness-110 transition"
            >
              Browse stays
            </Link>
          }
        />
      )}

      {status === "success" && bookings.length > 0 && (
        <ul className="space-y-4">
          {bookings.map((booking) => (
            <li
              key={booking._id}
              className="flex items-center gap-4 rounded-xl border border-line bg-panel p-4"
            >
              <img
                src={booking.listing?.photo?.url}
                alt={booking.listing?.photo?.alt || ""}
                width={100}
                height={80}
                className="w-24 h-20 object-cover rounded-lg shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-semibold text-lg truncate">{booking.listing?.title}</h3>
                <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {booking.listing?.location}
                </p>
                <p className="text-sm text-muted mt-1">
                  {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)} · {booking.guests} guest
                  {booking.guests > 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono font-medium">{formatCurrency(booking.totalPrice)}</p>
                {booking.status === "cancelled" ? (
                  <span className="text-xs text-muted font-mono">Cancelled</span>
                ) : (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="text-xs text-red-600 hover:underline mt-1"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
