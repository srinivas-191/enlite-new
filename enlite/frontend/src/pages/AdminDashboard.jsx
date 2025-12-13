// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { useNavigate } from "react-router-dom";
// --- FRAMER MOTION IMPORTS ---
import { motion } from "framer-motion";
// --- ICON IMPORTS ---
import { Users, Tally4, Calendar, Eye, DollarSign, Activity, Settings } from "lucide-react";

// --- FRAMER MOTION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const userCardVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  show: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

// --- HELPER COMPONENT: Metric Card ---
function MetricCard({ title, value, icon: Icon, colorClass }) {
  return (
    <motion.div
      className={`p-6 rounded-xl shadow-lg bg-white border-l-4 ${colorClass}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase text-gray-500">{title}</p>
        <Icon className={`w-6 h-6 ${colorClass.replace('border-l-4 border-', 'text-')}`} />
      </div>
      <p className="text-4xl font-extrabold text-gray-800 mt-2">{value}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const navigate = useNavigate();

  // --- MOCKUP DATA for dashboard metrics ---
  const totalUsers = users.length;
  const totalPredictions = users.reduce((acc, u) => acc + (u.prediction_count || 0), 0);

  async function load() {
    setLoading(true);
    try {
      const res = await apiGet("/admin/users/");
      setUsers(res.users || []);

      // Load pending requests count
      const reqRes = await apiGet("/admin/manual-requests/");
      const pendingCount = (reqRes.requests || []).filter(r => r.status === "pending").length;
      setPendingRequestsCount(pendingCount);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto mt-24 p-6 md:p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-blue-900 flex items-center">
        <Settings className="w-8 h-8 mr-3 text-blue-500" />
        Administrator Dashboard
      </h1>

      {/* --- 1. TOP METRICS SECTION --- */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <MetricCard
          title="Total Registered Users"
          value={totalUsers}
          icon={Users}
          colorClass="border-blue-500"
        />
        <MetricCard
          title="Total Predictions Made"
          value={totalPredictions}
          icon={Tally4}
          colorClass="border-green-500"
        />
        <MetricCard
          title="Active Requests"
          value={pendingRequestsCount}
          icon={Activity}
          colorClass="border-yellow-500"
        />
      </div>

      {/* --- 2. ACTION BUTTONS --- */}
      <div className="mb-10 flex gap-4 border-b pb-6">
        <motion.button
          className="relative bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition duration-300 shadow-lg flex items-center gap-2"
          onClick={() => navigate("/admin/manual-requests")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <DollarSign className="w-5 h-5" />
          View Payment Requests
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              {pendingRequestsCount}
            </span>
          )}
        </motion.button>

        <motion.button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-xl transition duration-300 shadow-lg flex items-center gap-2"
          onClick={() => load()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          Refresh Data
        </motion.button>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-gray-700">User Management ({totalUsers})</h2>

      {/* --- 3. USER LIST CARDS (Animated) --- */}
      {loading ? (
        <p className="text-center p-10 text-gray-500">Loading user data...</p>
      ) : (
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {users.map((u) => (
            <motion.div
              key={u.username}
              className="relative p-6 rounded-xl shadow-xl bg-white border-t-8 border-blue-400 
                        transform hover:shadow-2xl hover:-translate-y-1 transition duration-300 group"
              variants={userCardVariants}
              whileHover={{ scale: 1.02 }}
            >
              <Users className="absolute top-4 right-4 w-6 h-6 text-blue-400 opacity-20 group-hover:opacity-100 transition-opacity" />

              {/* User Identity */}
              <h3 className="text-2xl font-extrabold text-gray-800 mb-4 border-b pb-2">
                {u.username}
              </h3>

              {/* Stats */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border-l-4 border-green-300">
                  <p className="font-medium text-gray-600 flex items-center">
                    <Tally4 className="w-4 h-4 mr-2 text-green-500" />
                    Predictions:
                  </p>
                  <span className="font-bold text-lg text-green-700">{u.prediction_count || 0}</span>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-300">
                  <p className="font-medium text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                    Joined:
                  </p>
                  <span className="font-semibold text-gray-700">
                    {new Date(u.joined_on).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <motion.button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg 
                            transition duration-200 flex items-center justify-center gap-2"
                  onClick={() => navigate(`/admin/user/${u.username}`)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye className="w-5 h-5" />
                  View User History
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
