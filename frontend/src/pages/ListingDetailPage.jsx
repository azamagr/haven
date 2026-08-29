import { useNavigate, useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Users, MapPin } from "lucide-react";
import { useListing } from "../hooks/useListing";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import BookingForm from "../components/BookingForm";
import LoadingGrid from "../components/LoadingGrid";
import ErrorState from "../components/ErrorState";
import * as bookingsApi from "../api/bookingsApi";

export default function ListingDetailPage() {
  const { id } = useParams();
  const { listing, status, errorMessage, retry } = useListing(id);
  const { status: authStatus } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleBook(payload) {
    if (authStatus !== "authed") {
      navigate("/login", { state: { from: { pathname: `/listings/${id}` } } });
      return;
    }
    setSubmitting(true);
    try {
      await bookingsApi.createBooking({ listingId: id, ...payload });
      showToast("success", "Booked! Check My Bookings for the details.");
      navigate("/bookings");
    } catch (err) {
      showToast("error", err.message || "Couldn't complete that booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
        <LoadingGrid count={1} />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
        <ErrorState message={errorMessage} onRetry={retry} />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
      <Link to="/" className="text-sm text-muted hover:text-ink transition-colors">
        ← Back to all stays
      </Link>

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 mt-4">
        <div>
          <img
            src={listing.photo.url}
            alt={listing.photo.alt}
            width={800}
            height={500}
            className="w-full aspect-[16/10] object-cover rounded-xl border border-line"
          />

          <p className="text-xs text-muted font-mono uppercase mt-4">{listing.category}</p>
          <h1 className="font-display font-bold text-3xl mt-1">{listing.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {listing.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Up to {listing.maxGuests} guests
            </span>
          </div>

          <p className="text-ink mt-5 leading-relaxed whitespace-pre-line">{listing.description}</p>

          <p className="text-xs text-muted mt-6 border-t border-line pt-4">
            Hosted by <span className="font-medium text-ink">{listing.host?.name || "a Haven host"}</span>
          </p>
        </div>

        <div>
          <BookingForm listing={listing} onSubmit={handleBook} submitting={submitting} />
        </div>
      </div>
    </main>
  );
}
