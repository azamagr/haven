import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { formatCurrency } from "../utils/format";

export default function ListingCard({ listing, priority = false }) {
  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group block rounded-xl border border-line bg-panel overflow-hidden hover:border-teal/50 transition-colors"
    >
      <img
        src={listing.photo.url}
        alt={listing.photo.alt}
        width={400}
        height={260}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="w-full aspect-[16/10] object-cover"
      />
      <div className="p-4">
        <p className="text-xs text-muted font-mono uppercase">{listing.category}</p>
        <h3 className="font-display font-semibold text-xl mt-1 group-hover:text-teal transition-colors truncate">
          {listing.title}
        </h3>
        <p className="text-sm text-muted mt-0.5 truncate">{listing.location}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-sm font-medium">
            {formatCurrency(listing.pricePerNight)}
            <span className="text-muted font-normal"> / night</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Users className="w-3.5 h-3.5" />
            {listing.maxGuests}
          </span>
        </div>
      </div>
    </Link>
  );
}
