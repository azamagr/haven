import { useNavigate, useParams } from "react-router-dom";
import ListingForm from "../components/ListingForm";
import LoadingGrid from "../components/LoadingGrid";
import ErrorState from "../components/ErrorState";
import { useListing } from "../hooks/useListing";
import { useToast } from "../context/ToastContext";
import { updateListing } from "../api/listingsApi";

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { listing, status, errorMessage, retry } = useListing(id);

  async function handleSubmit(values) {
    await updateListing(id, values);
    showToast("success", "Listing updated!");
    navigate("/dashboard");
  }

  if (status === "loading") {
    return (
      <main className="max-w-xl mx-auto px-5 sm:px-8 py-8">
        <LoadingGrid count={1} />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="max-w-xl mx-auto px-5 sm:px-8 py-8">
        <ErrorState message={errorMessage} onRetry={retry} />
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-5 sm:px-8 py-8">
      <h1 className="font-display font-bold text-3xl mb-6">Edit listing</h1>
      <ListingForm initialValues={listing} onSubmit={handleSubmit} submitLabel="Save changes" isEdit />
    </main>
  );
}
