import { Search } from "lucide-react";

const CATEGORIES = ["Cabin", "Apartment", "Villa", "Studio", "Cottage"];

export default function SearchFilters({ filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.q}
          onChange={(e) => update("q", e.target.value)}
          placeholder="Search by title or location…"
          aria-label="Search listings"
          className="w-full bg-panel border border-line rounded-full pl-10 pr-4 py-2.5 text-sm placeholder:text-muted/60 focus:outline-none focus:border-teal/60 transition-colors"
        />
      </div>

      <select
        value={filters.category}
        onChange={(e) => update("category", e.target.value)}
        aria-label="Filter by category"
        className="bg-panel border border-line rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-teal/60"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filters.guests}
        onChange={(e) => update("guests", e.target.value)}
        aria-label="Filter by number of guests"
        className="bg-panel border border-line rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-teal/60"
      >
        <option value="">Any guests</option>
        {[1, 2, 4, 6, 8].map((g) => (
          <option key={g} value={g}>
            {g}+ guests
          </option>
        ))}
      </select>

      <select
        value={filters.maxPrice}
        onChange={(e) => update("maxPrice", e.target.value)}
        aria-label="Filter by maximum price"
        className="bg-panel border border-line rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-teal/60"
      >
        <option value="">Any price</option>
        <option value="50">Under $50</option>
        <option value="100">Under $100</option>
        <option value="200">Under $200</option>
      </select>
    </div>
  );
}
