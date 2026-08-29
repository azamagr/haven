export function validateEmail(email) {
  if (!email.trim()) return "Email is required.";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email address.";
  return "";
}

export function validatePassword(password) {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[0-9]/.test(password)) return "Password must include at least one number.";
  return "";
}

export function validateName(name) {
  if (!name.trim()) return "Name is required.";
  if (name.trim().length < 2) return "Name must be at least 2 characters.";
  return "";
}

export function validateListingTitle(title) {
  if (!title.trim()) return "Title is required.";
  if (title.trim().length < 4) return "Title must be at least 4 characters.";
  return "";
}

export function validateListingDescription(desc) {
  if (!desc.trim()) return "Description is required.";
  if (desc.trim().length < 20) return "Description must be at least 20 characters.";
  return "";
}

export function validateLocation(location) {
  return location.trim() ? "" : "Location is required.";
}

export function validateCategory(category) {
  return category ? "" : "Select a category.";
}

export function validatePrice(price) {
  const n = Number(price);
  if (!price) return "Price is required.";
  if (Number.isNaN(n) || n < 1) return "Price must be at least $1.";
  return "";
}

export function validateMaxGuests(guests) {
  const n = Number(guests);
  if (!guests) return "Max guests is required.";
  if (Number.isNaN(n) || n < 1) return "Must accommodate at least 1 guest.";
  if (n > 20) return "Max guests can't exceed 20.";
  return "";
}

export function validatePhoto(file, isRequired = true) {
  if (!file) return isRequired ? "A photo is required." : "";
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) return "Photo must be a JPEG, PNG, or WEBP image.";
  if (file.size > 4 * 1024 * 1024) return "Photo must be smaller than 4MB.";
  return "";
}

export function validateDateRange(checkIn, checkOut) {
  if (!checkIn) return "Check-in date is required.";
  if (!checkOut) return "Check-out date is required.";
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (inDate < today) return "Check-in can't be in the past.";
  if (outDate <= inDate) return "Check-out must be after check-in.";
  return "";
}
