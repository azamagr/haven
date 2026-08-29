import ListingCard from "./ListingCard";

export default function ListingGrid({ listings }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {listings.map((listing, index) => (
        <ListingCard key={listing._id} listing={listing} priority={index === 0} />
      ))}
    </div>
  );
}
