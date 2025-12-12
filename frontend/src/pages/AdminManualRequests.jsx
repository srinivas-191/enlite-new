// src/pages/AdminManualRequests.jsx

import React, { useEffect, useState } from "react";
// Import apiDelete for the new function
import { apiGet, apiPost, apiDelete } from "../lib/api"; 
import { motion } from "framer-motion"; 
// Import new icons (including XCircle for Reject and Trash2 for Delete)
import { CheckCircle, Clock, DollarSign, User, FileText, Banknote, XCircle, Trash2 } from "lucide-react"; 

// Framer Motion variants for card animations
const cardVariants = {
 hidden: { opacity: 0, y: 20 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
 hidden: { opacity: 1 },
 visible: {
  opacity: 1,
  transition: {
   staggerChildren: 0.1,
  },
 },
};

export default function AdminManualRequests() {
 const [requests, setRequests] = useState([]);

 // FIXED: always correct backend root
 const API_ROOT = "https://beneficial-quietude-production.up.railway.app/api";

 useEffect(() => {
  loadRequests();
 }, []);

 async function loadRequests() {
  try {
   const res = await apiGet("/admin/manual-requests/");
   setRequests(res.requests || []);
  } catch (err) {
   console.error(err);
   alert("Failed to load payment requests (are you admin?)");
  }
 }

 async function approve(id) {
  if (!window.confirm("Approve this payment? This will grant the user the requested plan.")) return;

  try {
   await apiPost(`/admin/manual-requests/${id}/approve/`, {});
   alert("Approved successfully! The user's account has been updated.");
   
   // NEW: Save status to localStorage for user notification
   localStorage.setItem("manualRequestStatus", JSON.stringify({ id, status: "approved" })); 
   
   loadRequests();
  } catch (err) {
   console.error(err);
   alert("Failed to approve request");
  }
 }

 // --- EXISTING REJECT FUNCTION ---
 async function reject(id) {
  if (!window.confirm("Reject this payment? The user's plan will NOT be activated.")) return;

  try {
   await apiPost(`/admin/manual-requests/${id}/reject/`, {});
   alert("Rejected successfully! The user's plan remains inactive.");
   
   // NEW: Save status to localStorage for user notification
   localStorage.setItem("manualRequestStatus", JSON.stringify({ id, status: "rejected" })); 
   
   loadRequests();
  } catch (err) {
   console.error(err);
   alert("Failed to reject request");
  }
 }

 // --- NEW DELETE FUNCTION ---
 async function deleteRequest(id) {
  if (!window.confirm("WARNING: Are you sure you want to PERMANENTLY delete this payment request? This action CANNOT be undone.")) return;

  try {
   // API call to permanently delete the request
   await apiDelete(`/admin/manual-requests/${id}/delete/`); 
   alert("Request permanently deleted successfully!");
   loadRequests();
  } catch (err) {
   console.error(err);
   alert("Failed to delete request");
  }
 }

 // Helper to determine status color/icon
 const getStatusInfo = (status) => {
  if (status === "approved") {
   return { icon: <CheckCircle className="text-green-500" size={20} />, color: "text-green-600", border: "border-green-300", bg: "bg-green-50" };
  } else if (status === "pending") {
   return { icon: <Clock className="text-yellow-500" size={20} />, color: "text-yellow-600", border: "border-yellow-300", bg: "bg-yellow-50" };
  } else if (status === "rejected") { // Added rejected status styling
   return { icon: <XCircle className="text-red-500" size={20} />, color: "text-red-600", border: "border-red-300", bg: "bg-red-50" };
  }
  return { icon: <Clock className="text-gray-500" size={20} />, color: "text-gray-600", border: "border-gray-300", bg: "bg-gray-50" };
 };

 return (
  // Updated: Removed max-w-6xl and used p-12 for full-width with equal margins
  <div className="max-w-full mx-auto mt-24 p-12 bg-[#FCF5EE] min-h-[85vh]">
   <h1 className="text-4xl font-extrabold mb-8 text-gray-800 border-b pb-3">
    Manual Payment Requests
   </h1>

   {requests.length === 0 && (
    <div className="text-center p-10 bg-blue-50 rounded-lg border border-blue-200 shadow-md">
     <p className="text-xl text-gray-600">No pending manual payment requests at this time.</p>
    </div>
   )}

   {/* Grid container: 2 cards on medium, 3 cards on large screens */}
   <motion.div 
    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
    variants={staggerContainer}
    initial="hidden"
    animate="visible"
   >
    {requests.map((req) => {
     const statusInfo = getStatusInfo(req.status);
     
     return (
      <motion.div 
       key={req.id} 
       variants={cardVariants}
       // Updated card border to use dynamic status color
       className={`border p-6 rounded-xl shadow-xl transition duration-500 bg-white hover:shadow-2xl flex flex-col justify-between ${statusInfo.border}`}
       whileHover={{ scale: 1.02, zIndex: 1 }}
       whileTap={{ scale: 0.99 }}
      >
       <div>
        {/* Header/Status */}
        <div className={`flex items-center justify-between p-2 mb-4 rounded-lg font-bold text-lg ${statusInfo.bg}`}>
         <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign size={24} className="text-blue-600" />
          Request ID: <span className="text-blue-600">#{req.id}</span>
         </h2>
         {/* Status Indicator */}
         <div className={`flex items-center gap-1 ${statusInfo.color} uppercase text-sm`}>
          {statusInfo.icon}
          {req.status}
         </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 text-base">
         <p className="flex items-center gap-2">
          <User size={18} className="text-gray-500" />
          <strong>User:</strong> <span className="font-semibold text-gray-700">{req.user}</span>
         </p>
         <p className="flex items-center gap-2">
          <Banknote size={18} className="text-gray-500" />
          <strong>Amount:</strong> <span className="font-bold text-green-700">₹{req.amount}</span> for {req.plan}
         </p>
         <p className="text-sm text-gray-600 ml-6">
          <strong>Banking Name:</strong> {req.bank_name || "—"}
         </p>
         <p className="text-sm text-gray-600 ml-6">
          <strong>Transaction ID:</strong> {req.txn_id || "—"}
         </p>
         <p className="flex items-start gap-2 pt-2">
          <FileText size={18} className="text-gray-500 flex-shrink-0 mt-0.5" />
          <strong>Notes:</strong> <span className="italic text-gray-600">{req.notes || "No additional notes."}</span>
         </p>
        </div>

        {/* Screenshot */}
        {req.screenshot_url && (
         <div className="mt-6 border-t pt-4">
          <p className="font-bold mb-2 text-gray-700">Payment Proof:</p>
          <a href={`${API_ROOT}${req.screenshot_url}`} target="_blank" rel="noopener noreferrer">
           <img
            src={`${API_ROOT}${req.screenshot_url}`}
            alt="Payment screenshot"
            className="w-full h-auto rounded-lg border-2 border-gray-200 shadow-md transition duration-300 hover:border-blue-500"
           />
          </a>
         </div>
        )}
       </div>

       {/* Action Buttons (Approve and Reject) */}
       {req.status === "pending" && (
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between gap-3">
         {/* Reject Button (Left) */}
         <motion.button
          onClick={() => reject(req.id)}
          className="flex items-center gap-2 bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition duration-300 flex-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
         >
          <XCircle size={20} /> Reject
         </motion.button>

         {/* Approve Button (Right) */}
         <motion.button
          onClick={() => approve(req.id)}
          className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-300 flex-1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
         >
          <CheckCircle size={20} /> Approve
         </motion.button>
        </div>
       )}
       
       {/* NEW: Permanent Delete Button (visible on all requests for admin cleanup) */}
       <div className={`mt-6 pt-4 border-t ${req.status === 'pending' ? 'border-gray-100' : 'border-t-0'}`}>
        <motion.button
         onClick={() => deleteRequest(req.id)}
         className="flex items-center justify-center w-full gap-2 bg-gray-100 text-gray-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-red-100 hover:text-red-700 transition duration-300"
         whileHover={{ scale: 1.03 }}
         whileTap={{ scale: 0.97 }}
        >
         <Trash2 size={20} /> Delete Request History
        </motion.button>
       </div>

      </motion.div>
     );
    })}
   </motion.div>
  </div>
 );
}