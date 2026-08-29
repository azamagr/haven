const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("haven_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchDashboard() {
  const res = await fetch(`${API_URL}/api/dashboard`, { headers: authHeaders() });
  const body = await res.json();
  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }
  return body.data;
}
