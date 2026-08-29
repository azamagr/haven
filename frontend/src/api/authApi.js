const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function handleResponse(res) {
  const body = await res.json();
  if (!res.ok || body.success === false) {
    const err = new Error(body.message || `Request failed with status ${res.status}`);
    throw err;
  }
  return body.data;
}

export async function signup({ name, email, password, role }) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  return handleResponse(res);
}

export async function login({ email, password }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function fetchMe(token) {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}
