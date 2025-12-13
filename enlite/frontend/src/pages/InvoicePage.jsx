// src/pages/InvoicePage.jsx
import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  QrCode,
  Clipboard,
  ArrowLeft,
  Send,
  CheckSquare,
  DollarSign,
  UserCheck,
  CheckCircle,
  Clock,
} from "lucide-react";

import { apiPostForm } from "../lib/api"; // ✅ FIXED — must use multipart uploader

const PLAN_MAP = {
  Basic: { price: 75, label: "Basic", qr: "/assets/qr1.jpg" },
  Super: { price: 175, label: "Super", qr: "/assets/qr2.jpg" },
  Premium: { price: 300, label: "Premium", qr: "/assets/qr3.jpg" },
};

const UPI_ID = "9390248043@ptyes";
const UPI_NAME = "Chidhurala Chandrakiran";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function InvoicePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const planName = searchParams.get("plan") || "Basic";
  const plan = PLAN_MAP[planName] || PLAN_MAP.Basic;

  const [bankName, setBankName] = useState("");
  const [txnId, setTxnId] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const qrSrc = plan.qr;

  const upiLink = useMemo(() => {
    return `upi://pay?pa=${encodeURIComponent(
      UPI_ID
    )}&pn=${encodeURIComponent(UPI_NAME)}&am=${plan.price}&cu=INR&tn=${encodeURIComponent(
      `${plan.label} plan payment`
    )}`;
  }, [plan]);

  // ⭐ Correct: Use apiPostForm (multipart/form-data)
  const handleSubmit = async () => {
    if (!bankName || !txnId) {
      setMessage("Please fill the Banking Name and Transaction ID fields.");
      return;
    }
    if (!screenshot) {
      setMessage("Screenshot is required for verification.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const form = new FormData();
      form.append("plan", plan.label);
      form.append("amount", plan.price);
      form.append("bank_name", bankName);
      form.append("txn_id", txnId);
      if (notes) form.append("notes", notes);
      form.append("screenshot", screenshot);

      // 🚀 SEND TO RAILWAY USING CORRECT METHOD
      await apiPostForm("/manual-payment-request/", form);

      setMessage("✅ Success! Your payment request has been submitted.");

      // Reset fields
      setBankName("");
      setTxnId("");
      setNotes("");
      setScreenshot(null);
    } catch (err) {
      console.error(err);
      setMessage(
        `❌ Submission failed: ${
          err?.response?.data?.error || err?.message || "Unknown error"
        }`
      );
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(upiLink);
    setMessage("🔗 UPI link copied!");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto mt-24 p-8 bg-gray-50 rounded-2xl shadow-3xl min-h-[80vh]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 border-b pb-3 flex items-center gap-3">
        <DollarSign size={32} className="text-blue-600" />
        Manual Payment: <span className="text-blue-700">{plan.label} Plan</span>
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <motion.div className="border p-6 bg-white rounded-xl shadow-xl">
          <h3 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
            <QrCode size={24} /> Pay via UPI
          </h3>

          <img
            src={qrSrc}
            className="w-full max-w-[280px] rounded-lg border-4 border-gray-100 shadow-lg mb-6"
            alt=""
          />

          <motion.button
            onClick={handleCopyToClipboard}
            className="px-5 py-3 border rounded-lg bg-blue-50 text-blue-700"
            whileHover={{ scale: 1.05 }}
          >
            <Clipboard size={18} /> Copy UPI Link
          </motion.button>
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div className="border p-6 bg-white rounded-xl shadow-xl">
          <h3 className="text-2xl font-bold mb-6 text-green-700 flex items-center gap-2 border-b pb-2">
            <UserCheck size={24} /> Verification Form
          </h3>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="block font-semibold">Banking Name *</label>
              <input
                className="w-full border px-4 py-2 rounded-lg"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold">Transaction ID *</label>
              <input
                className="w-full border px-4 py-2 rounded-lg"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold">Screenshot *</label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm"
                onChange={(e) => setScreenshot(e.target.files[0])}
              />
              {screenshot && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle size={14} /> {screenshot.name}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold">Notes</label>
              <textarea
                rows="4"
                className="w-full border px-4 py-2 rounded-lg"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8">
            <motion.button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full py-3 text-white font-bold rounded-lg flex justify-center gap-2 ${
                submitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {submitting ? <Clock className="animate-spin" /> : <Send />}
              {submitting ? "Submitting..." : "Submit for Verification"}
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
        </motion.div>
      </div>
    </motion.div>
  );
}
