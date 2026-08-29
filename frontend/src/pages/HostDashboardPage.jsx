import { Link } from "react-router-dom";
import { DollarSign, CalendarCheck, Home as HomeIcon, Plus, Pencil, Trash2 } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useMyListings } from "../hooks/useMyListings";
import { useToast } from "../context/ToastContext";
import StatCard from "../components/StatCard";
import RevenueChart from "../components/RevenueChart";
import BookingsChart from "../components/BookingsChart";
import LoadingGrid from "../components/LoadingGrid";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { formatCurrency } from "../utils/format";

export default function HostDashboardPage() {
  const { data, status, errorMessage, retry } = useDashboard();
  const { listings, status: listingsStatus, remove } = useMyListings();
  const { showToast } = useToast();

  async function handleDelete(id) {
    if (!window.confirm("Delete this listing? This can't be undone.")) return;
    try {
      await remove(id);
      showToast("success", "Listing deleted.");
    } catch (err) {
      showToast("error", err.message || "Couldn't delete that listing.");
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-3xl">Host Dashboard</h1>
        <Link
          to="/dashboard/new"
          className="flex items-center gap-1.5 bg-teal text-teal-ink font-medium text-sm px-4 py-2.5 rounded-full hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" />
          New listing
        </Link>
      </div>

      {status === "loading" && <LoadingGrid count={3} />}
      {status === "error" && <ErrorState message={errorMessage} onRetry={retry} />}

      {status === "success" && data.totalListings === 0 && (
        <EmptyState
          icon={HomeIcon}
          title="You haven't listed a place yet"
          description="Create your first listing to start tracking bookings and revenue here."
          action={
            <Link
              to="/dashboard/new"
              className="inline-block mt-5 bg-teal text-teal-ink font-medium text-sm px-5 py-2.5 rounded-full hover:brightness-110 transition"
            >
              Create a listing
            </Link>
          }
        />
      )}

      {status === "success" && data.totalListings > 0 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(data.totalRevenue)} />
            <StatCard icon={CalendarCheck} label="Total Bookings" value={data.totalBookings} />
            <StatCard icon={HomeIcon} label="Active Listings" value={data.totalListings} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <RevenueChart data={data.revenueByMonth} />
            <BookingsChart data={data.bookingsByListing} />
          </div>
        </div>
      )}

      <h2 className="font-display font-semibold text-xl mt-10 mb-4">Your listings</h2>
      {listingsStatus === "loading" && <LoadingGrid count={2} />}
      {listingsStatus === "success" && listings.length > 0 && (
        <ul className="space-y-3">
          {listings.map((listing) => (
            <li key={listing._id} className="flex items-center gap-4 rounded-xl border border-line bg-panel p-4">
              <img
                src={listing.photo.url}
                alt={listing.photo.alt}
                width={90}
                height={70}
                className="w-20 h-16 object-cover rounded-lg shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate">{listing.title}</h3>
                <p className="text-xs text-muted">{listing.location} · {formatCurrency(listing.pricePerNight)}/night</p>
              </div>
              <Link
                to={`/dashboard/edit/${listing._id}`}
                aria-label={`Edit ${listing.title}`}
                className="text-muted hover:text-teal transition-colors shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDelete(listing._id)}
                aria-label={`Delete ${listing.title}`}
                className="text-muted hover:text-red-600 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
