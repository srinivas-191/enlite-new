// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { motion } from "framer-motion"; // Import motion for animation
import { CheckCircle, XCircle } from "lucide-react"; // Import icons

// Define the continuous pulsating zoom animation
const pulseZoom = {
 scale: [1, 1.05, 1], // Keyframes for scale
 opacity: [1, 0.9, 1], // Keyframes for opacity (subtle)
 transition: {
  duration: 1.5,
  repeat: Infinity,
  ease: "easeInOut",
 },
};

export default function ProfilePage() {
const [profile, setProfile] = useState(null);
 const [subscription, setSubscription] = useState(null);
 const [history, setHistory] = useState([]);
 
 // New state for manual request status
 const [requestStatus, setRequestStatus] = useState(null);
 const [showAnimatedMessage, setShowAnimatedMessage] = useState(false);

 useEffect(() => {
  load();
  loadRequestStatus(); // Load and check for new status message
 }, []);
async function load() {
 try {
 const p = await apiGet("/profile/");
 const h = await apiGet("/history/");
 const sub = await apiGet("/subscription/"); // ✅ FIXED ROUTE

 setProfile(p);
 setHistory(h.history.slice(0, 5));
 setSubscription(sub.subscription);

 // Save subscription for global use
 localStorage.setItem("subscription", JSON.stringify(sub.subscription));
 } catch (err) {
 console.error(err);
 alert("Failed to load profile");
 }
}

// NEW: Function to check for and load manual request status from localStorage
 function loadRequestStatus() {
    // ⭐ FIX: Get the current logged-in user's username
    const currentUsername = localStorage.getItem("username");
    if (!currentUsername) return; 

  // ⭐ FIX: Check for the user-specific status key
  const statusKey = `manualRequestStatus_${currentUsername}`;
  const status = localStorage.getItem(statusKey);

  if (status) {
   const parsedStatus = JSON.parse(status);
   setRequestStatus(parsedStatus);
   
   // Only show the animated version if it's the *first* time seeing it
   if (!localStorage.getItem(`dismissed_${parsedStatus.id}`)) {
     setShowAnimatedMessage(true);
   }
  }
 }

 // NEW: Function to handle the "OK" button click
 function dismissAnimatedMessage() {
  if (requestStatus) {
   // 1. Hide the animated box (will show the static message)
   setShowAnimatedMessage(false);
   
   // 2. Permanently save that this specific notification ID was dismissed
   localStorage.setItem(`dismissed_${requestStatus.id}`, "true");
   
   // ⭐ FIX: Clear the user-specific status from localStorage after dismissal
      const currentUsername = localStorage.getItem("username");
      if (currentUsername) {
          localStorage.removeItem(`manualRequestStatus_${currentUsername}`);
      }
   // This will now show the final static message based on requestStatus
  }
 }

if (!profile) return <h1 className="mt-24 text-center">Loading...</h1>;

// UPDATED: Dynamic status styling and message generation (using current subscription data)
const getStatusStyle = (status) => {
    // Prioritize the currently loaded subscription data because it reflects the real-time prediction count.
    const activeSub = subscription || requestStatus?.subscription; 
    
  if (status === "approved") {
        const remaining = activeSub?.remaining_predictions || 0;
        const planName = activeSub?.plan || "a plan";
        
        let message;
        let base;
        let icon;
        
        if (remaining > 0) {
            base = "bg-green-100 border-green-400 text-green-800";
            icon = <CheckCircle className="text-green-500" size={24} />;
            // Message includes dynamic remaining count
            message = `Your **${planName.toUpperCase()}** plan is **ACTIVE**! You have **${remaining}** predictions remaining.`;
        } else {
            // Subscription approved but predictions are 0 (Expired)
            base = "bg-red-100 border-red-400 text-red-800";
            icon = <XCircle className="text-red-500" size={24} />; 
            // Message for expired plan
            message = `Your **${planName.toUpperCase()}** plan has **EXPIRED**. Please purchase a new plan to continue.`;
        }

   return { 
    base,
    icon,
    message,
   };
  }
    
  if (status === "rejected") {
   return { 
    base: "bg-red-100 border-red-400 text-red-800",
    icon: <XCircle className="text-red-500" size={24} />,
    message: "Your manual payment request has been **REJECTED**. Please contact support.",
   };
  }
  return null; // Should not happen
 };
 
 const statusInfo = requestStatus ? getStatusStyle(requestStatus.status) : null;


return (
 <div className="max-w-6xl mx-auto mt-24 p-6"> {/* Increased width and top margin */}
 <h1 className="text-4xl font-extrabold mb-8 text-blue-700">User Profile Dashboard</h1>

 {/* NEW: Manual Request Status Notification */}
   {requestStatus && statusInfo && (
    <div className="mb-8">
     {showAnimatedMessage ? (
      // Animated Decorated Box
      <motion.div
       animate={pulseZoom}
       className={`p-6 border-4 rounded-xl shadow-xl transition duration-300 ${statusInfo.base} flex flex-col sm:flex-row items-center justify-between gap-4`}
      >
       <div className="flex items-center gap-3">
        {statusInfo.icon}
        <p className="text-xl font-bold">
         {statusInfo.message.replace(/\*\*/g, '')}
        </p>
       </div>
       <motion.button
        onClick={dismissAnimatedMessage}
        className="bg-white text-gray-700 font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-gray-100 transition duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
       >
        OK
       </motion.button>
      </motion.div>
     ) : (
      // Static Final Message
      <div className={`p-4 border-l-8 rounded-r-lg shadow-md ${statusInfo.base} flex items-center gap-3`}>
       {statusInfo.icon}
       <p className="font-medium" dangerouslySetInnerHTML={{ __html: statusInfo.message }}></p>
      </div>
     )}
    </div>
   )}

 <div className="grid md:grid-cols-3 gap-8">
  {/* 1. PROFILE INFO CARD */}
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-1">
  <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Account Details</h2>
  <div className="mt-14">
   <p className="text-lg">
   <strong className="text-gray-600">Username:</strong> <span className="text-blue-600 font-semibold">{profile.username}</span>
   </p>
   <p>
   <strong className="text-gray-600">Role:</strong> 
   <span className={`font-medium ${profile.is_admin ? "text-red-500" : "text-green-500"}`}>
    {profile.is_admin ? "Admin" : "User"}
   </span>
   </p>
   <p>
   <strong className="text-gray-600">Joined:</strong> {new Date(profile.joined_on).toLocaleString()}
   </p>
   <p>
   <strong className="text-gray-600">Total Predictions:</strong> 
   <span className="text-2xl font-bold text-blue-800 ml-1">{profile.total_predictions}</span>
   </p>
  </div>
  </div>

  {/* 2. SUBSCRIPTION CARD (Takes 2 columns on medium screens and up) */}
  {subscription && (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 md:col-span-2">
   <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Subscription Management</h2>
   <div className="grid sm:grid-cols-2 gap-4">
   {/* Plan */}
   <div className="p-3 bg-blue-50 rounded-lg">
    <p className="text-sm uppercase text-gray-500 font-medium">Plan</p>
    <p className="text-3xl font-extrabold text-blue-700">{subscription.plan.toUpperCase()}</p>
   </div>
   {/* Status */}
   <div className="p-3 bg-green-50 rounded-lg">
    <p className="text-sm uppercase text-gray-500 font-medium">Status</p>
    <p className={`text-3xl font-extrabold ${subscription.active ? "text-green-700" : "text-red-700"}`}>
    {subscription.active ? "Active" : "Inactive"}
    </p>
   </div>
   {/* Remaining Predictions */}
   <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-sm uppercase text-gray-500 font-medium">Remaining Predictions</p>
    <p className="text-2xl font-bold text-gray-700">{subscription.remaining_predictions}</p>
   </div>
   {/* Allowed Predictions */}
   <div className="p-3 bg-gray-50 rounded-lg">
    <p className="text-sm uppercase text-gray-500 font-medium">Allowed Predictions</p>
    <p className="text-2xl font-bold text-gray-700">{subscription.allowed_predictions}</p>
   </div>
   </div>
  </div>
  )}
 </div>


 {/* 3. LAST PREDICTION CARD (Full width below the grid) */}
 <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
  <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Last Prediction Overview</h2>
  {profile.last_prediction ? (
  <div className="grid md:grid-cols-4 gap-4 text-center">
   {/* Building Type */}
   <div className="p-4 bg-yellow-50 rounded-lg">
   <p className="text-sm uppercase text-gray-500">Building Type</p>
   <p className="text-xl font-bold text-yellow-700">{profile.last_prediction.building_type}</p>
   </div>
   {/* Energy */}
   <div className="p-4 bg-yellow-50 rounded-lg">
   <p className="text-sm uppercase text-gray-500">Energy (kWh/month)</p>
   <p className="text-xl font-bold text-yellow-700">{profile.last_prediction.energy}</p>
   </div>
   {/* EUI */}
   <div className="p-4 bg-yellow-50 rounded-lg">
   <p className="text-sm uppercase text-gray-500">EUI</p>
   <p className="text-xl font-bold text-yellow-700">{profile.last_prediction.eui}</p>
   </div>
   {/* Date */}
   <div className="p-4 bg-yellow-50 rounded-lg">
   <p className="text-sm uppercase text-gray-500">Predicted On</p>
   <p className="text-lg font-bold text-yellow-700">{new Date(profile.last_prediction.date).toLocaleDateString()}</p>
   </div>
  </div>
  ) : (
  <p className="text-gray-500">No predictions yet.</p>
  )}
 </div>
 </div>
);
}