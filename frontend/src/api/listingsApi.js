const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("haven_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const body = await res.json();
  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }
  return body.data;
}

export async function fetchListings(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, value);
  });
  const res = await fetch(`${API_URL}/api/listings?${params.toString()}`);
  return handleResponse(res);
}

export async function fetchListingById(id) {
  const res = await fetch(`${API_URL}/api/listings/${id}`);
  return handleResponse(res);
}

export async function fetchMyListings() {
  const res = await fetch(`${API_URL}/api/listings/mine`, { headers: authHeaders() });
  return handleResponse(res);
}

function buildFormData(fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (key === "photo") {
      if (value) formData.append("photo", value);
    } else {
      formData.append(key, value);
    }
  });
  return formData;
}

export async function createListing(fields) {
  const res = await fetch(`${API_URL}/api/listings`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: buildFormData(fields),
  });
  return handleResponse(res);
}

export async function updateListing(id, fields) {
  const res = await fetch(`${API_URL}/api/listings/${id}`, {
    method: "PUT",
    headers: { ...authHeaders() },
    body: buildFormData(fields),
  });
  return handleResponse(res);
}

export async function deleteListing(id) {
  const res = await fetch(`${API_URL}/api/listings/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}
