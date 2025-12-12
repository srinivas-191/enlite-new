// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, setAuthToken } from "../lib/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setBusy(true);

    try {
      const res = await apiPost("/register/", {
        username,
        email,
        password,
      });

      if (!res.token) {
        alert(res.error || "Registration failed");
        setBusy(false);
        return;
      }

      // Set token for axios + save to localStorage
      setAuthToken(res.token);

      // Store user info
      localStorage.setItem("username", res.username);
      localStorage.setItem("isAdmin", res.is_admin ? "true" : "false");

      // Notify navbar to update
      window.dispatchEvent(new Event("authChange"));

      // Handle previous redirect request (if Try button triggered register)
      const redirect = localStorage.getItem("postLoginRedirect");

      if (redirect) {
        localStorage.removeItem("postLoginRedirect");
        navigate(redirect);
      } else {
        navigate("/profile");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Registration failed");
    }

    setBusy(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FCF5EE]">
      <div className="bg-white p-8 rounded shadow w-full max-w-md mt-20">
        
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <form onSubmit={handleRegister} className="space-y-4">

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full border px-3 py-2 rounded"
            required
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
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

          <button
            disabled={busy}
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            {busy ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-3">
          Already have an account?
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 cursor-pointer ml-1"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}
