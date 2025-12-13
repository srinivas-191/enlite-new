// src/pages/AdminUserHistory.jsx
import React, { useEffect, useState } from "react";
import { apiGet, apiDelete } from "../lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Zap, LayoutGrid, Thermometer } from "lucide-react"; // Import new icons
import { motion } from "framer-motion"; // Import Framer Motion

// Helper: format number to 2 decimals
const fmt2 = (n) => {
  if (n === null || n === undefined) return "N/A";
  const num = Number(n);
  return isNaN(num) ? "N/A" : num.toFixed(2);
};

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

// --- REUSABLE COMPONENT FOR FULL PREDICTION DETAILS ---
function PredictionDetails({ item, onBack }) {
  const { building_type, energy, eui, category, inputs, date } = item;

  // Logic to determine color/message based on category
  let categoryColor = "text-gray-600";
  let categoryMessage = "";
  let categoryIcon = <LayoutGrid size={24} />;

  if (category === "Excellent") {
    categoryColor = "text-green-600";
    categoryMessage = "Excellent performance. No immediate improvements recommended.";
    categoryIcon = <Zap size={24} />;
  } else if (category === "Good") {
    categoryColor = "text-blue-600";
    categoryMessage = "Good performance. Minor improvements could be considered.";
    categoryIcon = <Zap size={24} />;
  } else if (category === "Average") {
    categoryColor = "text-yellow-600";
    categoryMessage = "Average performance. Review inputs for potential efficiency gains.";
    categoryIcon = <Zap size={24} />;
  } else if (category === "Poor") {
    categoryColor = "text-red-600";
    categoryMessage = "Poor performance. Significant efficiency improvements are recommended.";
    categoryIcon = <Zap size={24} />;
  }
  
  // Group inputs by type for a nicer display
  const groupedInputs = {
    'Building Info': { 'Building Type': building_type, 'Predicted On': new Date(date).toLocaleString() },
    'Envelope': {},
    'HVAC & Internal Loads': {},
  };

  // Assign inputs to groups - structure kept identical to original
  for (const [key, value] of Object.entries(inputs || {})) {
    if (key.includes("Insulation") || key.includes("Wall_Ratio")) {
      groupedInputs['Envelope'][key] = value;
    } else if (key.includes("Hvac") || key.includes("Density") || key.includes("Occupancy") || key.includes("Hot_Water")) {
      groupedInputs['HVAC & Internal Loads'][key] = value;
    } else if (key.includes("Area")) {
      groupedInputs['Building Info']['Total Building Area'] = value;
    }
  }


  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition duration-300 font-medium p-2 rounded-lg hover:bg-blue-50"
      >
        <ArrowLeft size={20} /> Back to User History
      </button>

      {/* RESULT SECTION */}
      <div className="p-8 border border-blue-100 rounded-xl shadow-2xl bg-white/90 backdrop-blur-sm">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-800 border-b pb-3">Energy Prediction Summary</h2>
        <div className="grid lg:grid-cols-3 gap-6 text-center">
          
          {/* Energy Card */}
          <div className="p-6 bg-blue-50 rounded-xl shadow-lg transform hover:scale-[1.02] transition duration-300">
            <Zap className="text-blue-500 mx-auto mb-2" size={30} />
            <p className="text-sm text-gray-600 uppercase font-semibold">Total Energy/Month (kWh)</p>
            <p className="text-4xl font-black text-blue-700 mt-1">{fmt2(energy)}</p>
          </div>

          {/* EUI Card */}
          <div className="p-6 bg-blue-50 rounded-xl shadow-lg transform hover:scale-[1.02] transition duration-300">
            <Thermometer className="text-blue-500 mx-auto mb-2" size={30} />
            <p className="text-sm text-gray-600 uppercase font-semibold">EUI/Month (kWh/m²)</p>
            <p className="text-4xl font-black text-blue-700 mt-1">{fmt2(eui)}</p>
          </div>

          {/* Category Card */}
          <div className={`p-6 ${categoryColor.replace('text', 'bg').replace('-600', '-100')} rounded-xl shadow-lg transform hover:scale-[1.02] transition duration-300 flex flex-col justify-center`}>
            <div className={`flex items-center justify-center ${categoryColor} mb-2`}>
              {categoryIcon}
            </div>
            <p className="text-sm text-gray-600 uppercase font-semibold">Performance Category</p>
            <p className={`text-3xl font-extrabold mt-1 ${categoryColor}`}>{category}</p>
          </div>
        </div>
        <p className={`mt-6 text-center text-lg italic ${categoryColor}`}>{categoryMessage}</p>
      </div>

      {/* INPUT SUMMARY CARD */}
      <div className="p-8 border border-gray-200 rounded-xl shadow-2xl bg-white">
        <h2 className="text-2xl font-bold mb-6 text-blue-800 border-b pb-3">Detailed Input Summary</h2>
        <div className="space-y-6">
          {Object.entries(groupedInputs).map(([sectionTitle, fields]) => (
            <div key={sectionTitle} className="p-4 bg-gray-50 rounded-lg shadow-inner">
              <h3 className="text-xl font-bold mb-3 text-gray-700 border-b border-gray-200 pb-2">{sectionTitle}</h3>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-base">
                {Object.entries(fields).map(([label, value]) => (
                  <p key={label} className="flex justify-between">
                    <span className="font-medium text-gray-600">{label.replace(/_/g, " ")}:</span> 
                    <span className="font-semibold text-gray-800">
                      {typeof value === 'number' ? fmt2(value) : value}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN ADMIN USER HISTORY COMPONENT ---
export default function AdminUserHistory() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await apiGet(`/admin/user-history/${username}/`);
      setData(res);
      setSelectedItem(null); // Reset selection on reload
    } catch (err) {
      console.error(err);
      alert("Failed to load user history");
      navigate("/admin-dashboard"); // Redirect if failed
    }
  }

  async function deleteOne(id) {
    if (!window.confirm("Are you sure you want to permanently delete this prediction history item?")) return;
    try {
      await apiDelete(`/history/delete/${id}/`);
      load();
    } catch (error) {
      console.error("Deletion failed:", error);
      alert("Failed to delete the history item.");
    }
  }

  if (!data) return <h1 className="mt-32 text-center text-2xl font-semibold text-blue-600">Loading User History...</h1>;

  // Render the full details view if an item is selected
  if (selectedItem) {
    return (
      <div className="max-w-6xl mx-auto mt-24 p-8 bg-gray-50 rounded-2xl shadow-3xl min-h-[80vh]">
        <PredictionDetails item={selectedItem} onBack={() => {
          setSelectedItem(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }} />
      </div>
    );
  }

  // Render the history list view
  return (
    <div className="max-w-6xl mx-auto p-8 mt-24 bg-white rounded-2xl shadow-3xl min-h-[80vh]">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800">
        History for <span className="text-blue-700">{data.username}</span>
      </h1>

      {data.history.length === 0 ? (
        <div className="text-center p-10 bg-blue-50 rounded-lg">
          <p className="text-xl text-gray-600">No prediction history available for this user.</p>
        </div>
      ) : (
        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {data.history.map((item, i) => { 
            // -------------------------------------------------------------
            // FIXED LOGIC: Calculate count to be highest for the latest prediction (index 0)
            const totalPredictions = data.history.length;
            const count = totalPredictions - i; 
            // Example: total=10
            // i=0 (newest) -> count = 10 - 0 = 10
            // i=9 (oldest) -> count = 10 - 9 = 1
            // -------------------------------------------------------------
            
            return (
              // The clickable summary card with Framer Motion
              <motion.div 
                key={item.id} 
                variants={cardVariants}
                onClick={() => {
                  setSelectedItem(item);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="border border-gray-200 p-5 rounded-xl shadow-lg hover:shadow-2xl transition duration-500 cursor-pointer bg-white hover:bg-blue-50/50 flex flex-col justify-between"
                whileHover={{ scale: 1.03, zIndex: 1 }}
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  {/* Prediction Count Badge and Header */}
                  <div className="flex justify-between items-start mb-3 border-b pb-2">
                    <h2 className="text-xl font-bold text-blue-700 leading-tight pr-2">{item.building_type}</h2>
                    {/* The Attractive Badge Effect */}
                    <div className="px-3 py-1 bg-purple-600 text-white text-sm font-extrabold rounded-full shadow-lg border-2 border-purple-800 flex-shrink-0">
                      #{count}
                    </div>
                  </div>
                  {/* End of Prediction Count Badge and Header */}
                  
                  <p className="text-sm text-gray-500 mb-4">Predicted: {new Date(item.date).toLocaleDateString()}</p>
                  
                  <div className="space-y-2 text-base">
                    <p className="flex justify-between">
                      <strong className="text-gray-600">Energy (kWh):</strong> <span className="font-semibold">{fmt2(item.energy)}</span>
                    </p>
                    <p className="flex justify-between">
                      <strong className="text-gray-600">EUI (kWh/m²):</strong> <span className="font-semibold">{fmt2(item.eui)}</span>
                    </p>
                    <p className="flex justify-between">
                      <strong className="text-gray-600">Category:</strong> 
                      <span className={`font-extrabold ${item.category === 'Poor' ? 'text-red-600' : item.category === 'Excellent' ? 'text-green-600' : 'text-blue-600'}`}>{item.category}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}