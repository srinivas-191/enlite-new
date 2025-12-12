// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, apiGet, setAuthToken } from "../lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);

    try {
      const res = await apiPost("/login/", { username, password });

      if (!res.token) {
        alert(res.error || "Login failed");
        setBusy(false);
        return;
      }

      // Apply token globally
      setAuthToken(res.token);
      localStorage.setItem("username", res.username);
      localStorage.setItem("isAdmin", res.is_admin ? "true" : "false");
      localStorage.setItem("token", res.token); // ⭐ Ensuring token is set

      // Wait briefly for axios to attach token
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Correct backend subscription endpoint
      try {
        const sub = await apiGet("/subscription/");
        localStorage.setItem("subscription", JSON.stringify(sub.subscription));
      } catch (e) {
        console.error("Failed loading subscription", e);
      }

      // ⭐ Ensure dispatching the event happens *after* all storage updates
      window.dispatchEvent(new Event("authChange")); 

      // ADMIN redirect
      if (res.is_admin) {
        navigate("/admin-dashboard");
        return;
      }

      // USER redirect
      const redirect = localStorage.getItem("postLoginRedirect");
      if (redirect) {
        localStorage.removeItem("postLoginRedirect");
        navigate(redirect);
      } else {
        navigate("/profile");
      }

    } catch (err) {
      alert(err?.response?.data?.error || "Invalid credentials");
    }

    setBusy(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FCF5EE]">
      <div className="bg-white p-8 rounded shadow w-full max-w-md mt-20">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button disabled={busy} className="w-full bg-blue-600 text-white py-2 rounded">
            {busy ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-3">
          Don’t have an account?
          <span onClick={() => navigate("/register")} className="text-green-600 cursor-pointer ml-1">
            Register
          </span>
        </p>
      </div>
    </div>
  );
}