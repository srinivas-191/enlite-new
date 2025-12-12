// src/lib/api.js
import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://enlite-new-production-a639.up.railway.app/api";

// Default axios instance (JSON)
export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ---------------- Token Setup ---------------- //
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}

export function clearAuthToken() {
  delete api.defaults.headers.common["Authorization"];
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("postLoginRedirect");
  sessionStorage.clear();
}

// Load token on refresh
const savedToken = localStorage.getItem("token");
if (savedToken) {
  api.defaults.headers.common["Authorization"] = `Token ${savedToken}`;
}

// ---------------- JSON Requests ---------------- //
export async function apiGet(path) {
  const res = await api.get(path);
  return res.data;
}

export async function apiPost(path, body) {
  const res = await api.post(path, body);
  return res.data;
}

export async function apiPut(path, body) {
  const res = await api.put(path, body);
  return res.data;
}

export async function apiDelete(path) {
  const res = await api.delete(path);
  return res.data;
}

// ---------------- FORM-DATA REQUEST (File Upload) ---------------- //
export async function apiPostForm(path, formData) {
  try {
    const res = await api.post(path, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Let axios generate boundary
      },
    });
    return res.data;
  } catch (err) {
    console.error("FORM POST ERROR:", path, err.response || err);
    throw err;
  }
}
