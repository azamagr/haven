import { useState } from "react";
import { SearchX } from "lucide-react";
import { useListings } from "../hooks/useListings";
import ListingGrid from "../components/ListingGrid";
import SearchFilters from "../components/SearchFilters";
import LoadingGrid from "../components/LoadingGrid";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

const initialFilters = { q: "", category: "", guests: "", maxPrice: "" };

export default function BrowsePage() {
  const [filters, setFilters] = useState(initialFilters);
  const { listings, status, errorMessage, retry } = useListings(filters);

  return (
    <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl">Find your next stay</h1>
        <p className="text-muted mt-1">Cabins, villas, studios, and cottages, hosted by real people.</p>
      </div>

      <div className="mb-6">
        <SearchFilters filters={filters} onChange={setFilters} />
      </div>

      {status === "loading" && <LoadingGrid />}
      {status === "error" && <ErrorState message={errorMessage} onRetry={retry} />}
      {status === "success" && listings.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No listings match your search"
          description="Try widening your filters or searching a different location."
        />
      )}
      {status === "success" && listings.length > 0 && <ListingGrid listings={listings} />}
    </main>
  );
}
