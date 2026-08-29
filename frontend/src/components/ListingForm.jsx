import { useState } from "react";
import { Loader2 } from "lucide-react";
import TextField from "./TextField";
import TextareaField from "./TextareaField";
import SelectField from "./SelectField";
import PhotoField from "./PhotoField";
import {
  validateListingTitle,
  validateListingDescription,
  validateLocation,
  validateCategory,
  validatePrice,
  validateMaxGuests,
  validatePhoto,
} from "../utils/validators";

const CATEGORIES = ["Cabin", "Apartment", "Villa", "Studio", "Cottage"];

export default function ListingForm({ initialValues, onSubmit, submitLabel, isEdit = false }) {
  const [values, setValues] = useState({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    location: initialValues?.location || "",
    category: initialValues?.category || "",
    pricePerNight: initialValues?.pricePerNight || "",
    maxGuests: initialValues?.maxGuests || "",
    photoAlt: initialValues?.photo?.alt || "",
    photo: null,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  function validate() {
    const next = {
      title: validateListingTitle(values.title),
      description: validateListingDescription(values.description),
      location: validateLocation(values.location),
      category: validateCategory(values.category),
      pricePerNight: validatePrice(values.pricePerNight),
      maxGuests: validateMaxGuests(values.maxGuests),
      photo: validatePhoto(values.photo, !isEdit), // photo optional on edit if one already exists
    };
    setErrors(next);
    return Object.values(next).every((e) => !e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-line bg-panel p-6 space-y-4">
      <TextField
        id="listing-title"
        label="Title"
        type="text"
        value={values.title}
        onChange={(e) => update("title", e.target.value)}
        error={errors.title}
        placeholder="Sunlit Cabin by the Pines"
      />

      <TextareaField
        id="listing-description"
        label="Description"
        rows={4}
        value={values.description}
        onChange={(e) => update("description", e.target.value)}
        error={errors.description}
        placeholder="Describe the space, the neighborhood, and what makes it worth staying at…"
      />

      <TextField
        id="listing-location"
        label="Location"
        type="text"
        value={values.location}
        onChange={(e) => update("location", e.target.value)}
        error={errors.location}
        placeholder="Nathia Gali, Pakistan"
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <SelectField
          id="listing-category"
          label="Category"
          options={CATEGORIES}
          value={values.category}
          onChange={(e) => update("category", e.target.value)}
          error={errors.category}
        />
        <TextField
          id="listing-price"
          label="Price per night ($)"
          type="number"
          min={1}
          value={values.pricePerNight}
          onChange={(e) => update("pricePerNight", e.target.value)}
          error={errors.pricePerNight}
        />
      </div>

      <TextField
        id="listing-guests"
        label="Max guests"
        type="number"
        min={1}
        max={20}
        value={values.maxGuests}
        onChange={(e) => update("maxGuests", e.target.value)}
        error={errors.maxGuests}
      />

      <PhotoField
        label="Photo"
        value={values.photo}
        existingUrl={initialValues?.photo?.url}
        onChange={(file) => update("photo", file)}
        error={errors.photo}
        hint={isEdit ? "Leave unchanged to keep the current photo." : undefined}
      />

      <TextField
        id="listing-photo-alt"
        label="Photo description (for accessibility)"
        type="text"
        value={values.photoAlt}
        onChange={(e) => update("photoAlt", e.target.value)}
        placeholder="A wooden cabin surrounded by pine trees"
      />

      {serverError && (
        <p role="alert" className="text-sm text-red-600 text-center">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-teal text-teal-ink font-medium text-sm px-4 py-2.5 rounded-full hover:brightness-110 transition disabled:opacity-50"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
