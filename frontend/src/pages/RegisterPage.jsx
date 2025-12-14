// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Assuming apiPost is a wrapper for fetch or axios
import { apiPost, setAuthToken } from "../lib/api"; 
import axios from 'axios'; // We'll use axios directly for the localhost test

// Base URL for your local backend
const LOCAL_API_BASE_URL = "http://localhost:8000/api"; // Adjust port if needed

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
      // --- START MODIFICATION for localhost testing ---
      // Replace apiPost("/register/", ...) with a direct axios call to localhost
      const res = await axios.post(`${LOCAL_API_BASE_URL}/register/`, {
        username,
        email,
        password,
      });

      // The response structure from axios is res.data
      const responseData = res.data;

      if (!responseData.token) {
        alert(responseData.error || "Registration failed");
        setBusy(false);
        return;
      }
      
      // Since registration is complete, we navigate to login *without* logging in
      // REMOVED: setAuthToken(res.token);
      // REMOVED: localStorage.setItem("username", res.username);
      // REMOVED: localStorage.setItem("isAdmin", res.is_admin ? "true" : "false");
      // REMOVED: window.dispatchEvent(new Event("authChange"));

      // Handle previous redirect request (if Try button triggered register)
      const redirect = localStorage.getItem("postLoginRedirect");

      if (redirect) {
        // Clear the redirect, but still send them to the regular login page
        // as they are not logged in and shouldn't immediately go to the protected page.
        localStorage.removeItem("postLoginRedirect"); 
      }
      
      // Navigate to login page
      navigate("/login");

    } catch (err) {
      console.error(err);
      // Access the error message from the axios response structure
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