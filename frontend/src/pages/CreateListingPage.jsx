import { useNavigate } from "react-router-dom";
import ListingForm from "../components/ListingForm";
import { useToast } from "../context/ToastContext";
import { createListing } from "../api/listingsApi";

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleSubmit(values) {
    await createListing(values);
    showToast("success", "Listing created!");
    navigate("/dashboard");
  }

  return (
    <main className="max-w-xl mx-auto px-5 sm:px-8 py-8">
      <h1 className="font-display font-bold text-3xl mb-6">Create a listing</h1>
      <ListingForm onSubmit={handleSubmit} submitLabel="Publish listing" />
    </main>
  );
}
