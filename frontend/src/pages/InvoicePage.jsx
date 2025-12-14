import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DollarSign,
  Clock,
  CreditCard, // Icon for Razorpay
  ShoppingCart, // Icon for Checkout
} from "lucide-react";

// ⚠️ IMPORTANT: Switched from apiPostForm to apiPost (JSON-based)
import { apiPost } from "../lib/api"; 
import useAuth from "../hooks/useAuth"; // FIX: Ensure this file exists in src/hooks/

// ----------------------------------------------------
// NOTE: Plans must match the plan names and prices (in INR) defined in the backend (views.py)
const PLAN_MAP = {
  Basic: { price: 75, label: "Basic", apiPlan: "basic" },
  Super: { price: 175, label: "Super", apiPlan: "super" },
  Premium: { price: 300, label: "Premium", apiPlan: "premium" },
};

// ----------------------------------------------------

// Inject Razorpay script dynamically
const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function InvoicePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Assuming useAuth provides the user object { username, email, phone }
  const { user } = useAuth(); 

  const planName = searchParams.get("plan");
  const planDetails = useMemo(() => PLAN_MAP[planName] || null, [planName]);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Only run if the plan is invalid
  useEffect(() => {
    if (!planDetails) {
      setMessage("❌ Error: Invalid plan selected.");
    }
  }, [planDetails]);

  // Handle Razorpay Logic
  const handleRazorpayPayment = async () => {
    if (!planDetails) return;

    setMessage("");
    setSubmitting(true);
    
    // 1. Load Razorpay SDK
    const res = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      setMessage("❌ Razorpay SDK failed to load. Are you connected to the internet?");
      setSubmitting(false);
      return;
    }

    try {
      // 2. Create Order via Backend API
      const orderResponse = await apiPost("/razorpay/create-order/", {
        plan: planDetails.apiPlan,
      });

      if (orderResponse.error) {
        setMessage(`❌ Failed to create order: ${orderResponse.error}`);
        setSubmitting(false);
        return;
      }

      const { amount, order_id, key } = orderResponse;
      
      // 3. Configure and Open Razorpay Checkout Window
      const options = {
        key: key, 
        amount: amount, // Amount is in paise (e.g., 7500 for ₹75)
        currency: "INR",
        name: "Energy Prediction Service",
        description: `${planName} Plan Subscription`,
        order_id: order_id, 
        
        // 4. Payment Handler (Called on successful payment)
        handler: async function (response) {
          // Verify Payment via Backend API
          setSubmitting(true); 
          const verificationResponse = await apiPost("/razorpay/verify-payment/", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verificationResponse.error) {
            setMessage(`❌ Payment verification failed: ${verificationResponse.error}`);
          } else {
            setMessage("✅ Payment successful! Your subscription is active.");
            // Redirect to profile/dashboard after successful subscription
            setTimeout(() => navigate("/profile"), 3000); 
          }
          setSubmitting(false);
        },
        
        // Prefill user details
        prefill: {
          name: user?.username || "New User", 
          email: user?.email || "",
          contact: user?.phone || "", 
        },
        theme: {
          color: "#3b82f6", // Blue color for theme
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error("Razorpay Payment Flow Error:", err);
      setMessage(`❌ An unexpected error occurred: ${err.message}`);
      setSubmitting(false); // Ensure button is re-enabled on failure
    } finally {
      // We rely on the handler to set submitting=false, but this is a final fallback.
      // Removed generic setSubmitting(false) here to avoid conflicts with handler.
    }
  };

  if (!planDetails) {
    // Renders the error message set in useEffect
    return (
      <motion.div className="container mx-auto p-4 max-w-2xl mt-10">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Error</h1>
        <p className="text-lg">{message}</p>
        <button
          onClick={() => navigate("/pricing")}
          className="mt-6 flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back to Pricing
        </button>
      </motion.div>
    );
  }

  // Updated JSX for the Razorpay Payment View
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto p-4 max-w-2xl mt-10"
    >
      <button
        onClick={() => navigate("/pricing")}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft size={16} /> Change Plan
      </button>

      <div className="p-8 bg-white rounded-xl shadow-2xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingCart size={28} /> Secure Checkout
          </h1>
          <div className={`text-xl font-extrabold px-3 py-1 rounded-full text-white bg-blue-600`}>
            {planName}
          </div>
        </div>

        {/* Plan Summary */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-lg py-2 border-b border-gray-100">
            <span className="text-gray-600">Plan Selected</span>
            <span className="font-semibold text-gray-900">{planName}</span>
          </div>
          <div className="flex justify-between items-center text-lg py-2 border-b border-gray-100">
            <span className="text-gray-600">Price (INR)</span>
            <span className="font-semibold text-gray-900">₹{planDetails.price}</span>
          </div>
          <div className="flex justify-between items-center text-xl font-bold py-4">
            <span>Total Payable</span>
            <span className="text-green-600 flex items-center gap-1">
              <DollarSign size={20} />
              {planDetails.price}
            </span>
          </div>
        </div>
        
        {/* Payment Button */}
        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Payment Method</h2>
            
            <motion.button
              onClick={handleRazorpayPayment}
              disabled={submitting || !planDetails}
              className={`w-full py-4 text-white font-bold rounded-lg flex justify-center items-center gap-3 transition-colors ${
                submitting 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting ? <Clock className="animate-spin" /> : <CreditCard />}
              {submitting ? "Processing..." : `Pay ₹${planDetails.price} with Razorpay`}
            </motion.button>

          {message && (
            <p
              className={`mt-4 p-3 rounded-lg text-sm font-semibold ${
                message.startsWith("✅")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </p>
          )}
        </div>
        
        <div className="mt-6 p-4 text-sm text-gray-500 border-t pt-4">
            <p>Your payment is securely processed by Razorpay. You will be redirected to the Razorpay payment gateway upon clicking 'Pay'.</p>
        </div>

      </div>
    </motion.div>
  );
}