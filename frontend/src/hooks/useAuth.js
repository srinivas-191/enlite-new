// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

/**
 * Custom hook to manage user authentication state.
 * It reads the token and user details from localStorage, which were set during login/register.
 */
export default function useAuth() {
    // Note: We don't need a live listener for token changes in this simple setup,
    // as navigation usually triggers a full component re-render.
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    // Note: Email and Phone are often not stored in localStorage but fetched on /profile/.
    // We provide defaults which the InvoicePage already handles with optional chaining.
    
    const user = token ? { 
        username: username,
        email: "placeholder@example.com", // You may need to fetch the actual email from the /profile/ endpoint
        phone: "0000000000", // You may need to fetch the actual phone from the /profile/ endpoint
    } : null;

    return { 
        user: user, 
        isAuthenticated: !!token,
    };
}