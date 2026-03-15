import { auth } from "../firebase";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiFetch = async (url, options = {}) => {
  const user  = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "API request failed");
  }
  return res.json();
};

export const apiUpload = async (url, formData, method = "POST") => {
  const user  = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e   = new Error(err.message || "Upload failed");
    e.data    = err;
    throw e;
  }
  return res.json();
};
