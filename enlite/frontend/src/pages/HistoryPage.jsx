// src/pages/HistoryPage.jsx
import React, { useEffect, useState } from "react";
import { apiGet, apiDelete } from "../lib/api";
import { 
    ArrowLeft, Zap, Ruler, Tally4, 
    Home, Package, Thermometer, Info 
} from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion"; 

// Helper: format number to 2 decimals
const fmt2 = (n) => {
// ... (fmt2 function remains the same)
  if (n === null || n === undefined) return "N/A";
  const num = Number(n);
  return isNaN(num) ? "N/A" : num.toFixed(2);
};

// Helper function to get color based on category (Unchanged)
const getCategoryStyles = (category) => {
// ... (getCategoryStyles function remains the same)
  switch (category) {
    case "Excellent":
      return {
        color: "text-green-600",
        bg: "bg-green-100",
        ring: "ring-green-400",
        iconColor: "text-green-500",
        message: "Excellent performance. No immediate improvements recommended.",
      };
    case "Good":
      return {
        color: "text-blue-600",
        bg: "bg-blue-100",
        ring: "ring-blue-400",
        iconColor: "text-blue-500",
        message: "Good performance. Minor improvements could be considered.",
      };
    case "Average":
      return {
        color: "text-yellow-700",
        bg: "bg-yellow-100",
        ring: "ring-yellow-400",
        iconColor: "text-yellow-600",
        message:
          "Average performance. Review inputs for potential efficiency gains.",
      };
    case "Poor":
      return {
        color: "text-red-600",
        bg: "bg-red-100",
        ring: "ring-red-400",
        iconColor: "text-red-500",
        message:
          "Poor performance. Significant efficiency improvements are recommended.",
      };
    default:
      return { color: "text-gray-600", bg: "bg-gray-100", ring: "ring-gray-400", iconColor: "text-gray-500", message: "" };
  }
};

// --- FRAMER MOTION VARIANTS ---
// (Unchanged)
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

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
    }
},
};

const pageTransitionVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
};

const metricCardVariants = {
    initial: { y: 30, opacity: 0 },
    animate: (i) => ({
        y: 0,
        opacity: 1,
        transition: {
            delay: i * 0.15 + 0.5, 
            duration: 0.4,
        },
    }),
};

// --- REUSABLE COMPONENT FOR FULL PREDICTION DETAILS (Unchanged) ---
function PredictionDetails({ item, onBack }) {
  const { building_type, energy, eui, category, inputs, date } = item;
  const { color: categoryColor, message: categoryMessage, ring: categoryRing, iconColor: categoryIconColor } =
    getCategoryStyles(category);

  // Group inputs by type for a nicer display (Refined Grouping)
  const groupedInputs = {
    'Building Info': { icon: Info, fields: { 'Building Type': building_type, 'Predicted On': new Date(date).toLocaleString() } },
    'Envelope Properties': { icon: Package, fields: {} },
    'HVAC & Internal Loads': { icon: Thermometer, fields: {} },
  };

  // Assign inputs to groups 
  for (const [key, value] of Object.entries(inputs || {})) {
    if (key.includes("Insulation") || key.includes("Wall_Ratio") || key.includes("Roof")) {
        groupedInputs['Envelope Properties'].fields[key] = value;
    } else if (key.includes("Hvac") || key.includes("Density") || key.includes("Occupancy") || key.includes("Hot_Water") || key.includes("Lighting")) {
        groupedInputs['HVAC & Internal Loads'].fields[key] = value;
    } else if (key.includes("Area")) {
        groupedInputs['Building Info'].fields['Total Building Area (m²)'] = value;
    }
  }


  return (
    <motion.div
      className="space-y-10 p-4 md:p-8 bg-gray-50 min-h-screen"
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <button onClick={onBack} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition font-medium pt-2">
        <ArrowLeft size={20} /> Back to History List
      </button>

      {/* RESULT SECTION - Modern Visualized Metrics */}
      <div className="p-8 border rounded-3xl shadow-2xl bg-white border-t-8 border-blue-600">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-800 tracking-tight">
          Performance Analysis
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          
          {/* Energy Card (Staggered Entry 1) */}
          <motion.div
            className="p-6 bg-blue-50 rounded-xl shadow-lg transform hover:scale-[1.03] transition duration-300 ring-2 ring-blue-300"
            variants={metricCardVariants}
            initial="initial"
            animate="animate"
            custom={0} // Stagger index
          >
            <Zap className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Total Energy Consumption
            </p>
            <p className="text-5xl font-extrabold text-blue-700 mt-1">
              {fmt2(energy)}
            </p>
            <p className="text-sm text-blue-500 font-medium">kWh/Month</p>
          </motion.div>

          {/* EUI Card (Staggered Entry 2) */}
          <motion.div
            className="p-6 bg-blue-50 rounded-xl shadow-lg transform hover:scale-[1.03] transition duration-300 ring-2 ring-blue-300"
            variants={metricCardVariants}
            initial="initial"
            animate="animate"
            custom={1} // Stagger index
          >
            <Ruler className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Energy Use Intensity
            </p>
            <p className="text-5xl font-extrabold text-blue-700 mt-1">
              {fmt2(eui)}
            </p>
            <p className="text-sm text-blue-500 font-medium">kWh/m²/Month</p>
          </motion.div>

          {/* Category Card (Staggered Entry 3) */}
          <motion.div
            className={`p-6 ${getCategoryStyles(category).bg} rounded-xl shadow-lg transform hover:scale-[1.03] transition duration-300 ring-2 ${categoryRing}`}
            variants={metricCardVariants}
            initial="initial"
            animate="animate"
            custom={2} // Stagger index
          >
            <Tally4 className={`h-8 w-8 ${categoryIconColor} mx-auto mb-3`} />
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Performance Category
            </p>
            <p className={`text-4xl font-extrabold ${categoryColor} mt-1`}>
              {category}
            </p>
            <p className={`text-sm ${categoryColor} font-medium`}>{building_type}</p>
          </motion.div>
        </div>
        <p className={`mt-8 text-center text-lg ${categoryColor} font-semibold px-4 py-3 border-l-4 border-r-4 ${categoryRing.replace('ring', 'border')} bg-white shadow-inner rounded-xl`}>
          {categoryMessage}
        </p>
      </div>

      {/* INPUT SUMMARY - Structured & Clean (Simple list stagger) */}
      <div className="p-8 border rounded-3xl shadow-xl bg-white">
        <h2 className="text-2xl font-bold mb-6 text-blue-800 border-b pb-3 flex items-center">
            <Home className="w-6 h-6 mr-2 text-blue-500" />
            Detailed Input Summary
        </h2>
        
        <motion.div
             variants={containerVariants}
             initial="hidden"
             animate="show"
             className="space-y-8"
        >
          {Object.entries(groupedInputs).map(([sectionTitle, { icon: Icon, fields }], index) => (
            <motion.div 
              key={sectionTitle} 
              variants={itemVariants} 
              className="bg-gray-50 p-6 rounded-xl border border-gray-200"
            >
              <h3 className="text-xl font-extrabold mb-4 text-gray-700 border-l-4 border-blue-500 pl-3 flex items-center">
                <Icon className="w-5 h-5 mr-2 text-blue-500" />
                {sectionTitle}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-4 text-sm">
                {Object.entries(fields).map(([label, value]) => (
                  <p key={label} className="flex flex-col">
                    <strong className="text-gray-500 font-medium uppercase text-xs tracking-wider">
                      {label.replace(/_/g, " ")}:
                    </strong>
                    <span className="text-gray-900 font-semibold text-base mt-0.5">
                      {typeof value === "number" ? fmt2(value) : value}
                    </span>
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// --- MAIN HISTORY PAGE COMPONENT (Refactored) ---
export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    load();
  }, []);
  

  async function load() {
    try {
      const res = await apiGet("/history/");
      setHistory(res.history || []);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
      alert("Failed to load history");
    }
  }

  async function deleteOne(id) {
    if (!window.confirm("Hide this entry from your history?")) return;
    await apiDelete(`/history/delete/${id}/`);
    setHistory(history.filter((item) => item.id !== id));
  }

  async function deleteAll() {
    if (!window.confirm("Hide ALL history entries? This cannot be undone."))
      return;
    await apiDelete("/history/delete-all/");
    load();
  }

  // Refactored structure: Always render the container, but use AnimatePresence
  // to toggle the content (List vs. Details).
  return (
    <div className="max-w-7xl mx-auto mt-24 p-6 md:p-8">
      
      <AnimatePresence mode="wait">
        {selectedItem ? (
            // -----------------------------------------------------
            // DETAILS VIEW (Only the prediction box is rendered)
            // -----------------------------------------------------
            <div key="details" className="max-w-7xl mx-auto p-0 bg-white min-h-[80vh] shadow-xl rounded-xl">
                <PredictionDetails
                    item={selectedItem}
                    onBack={() => {
                      setSelectedItem(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                />
            </div>
        ) : (
            // -----------------------------------------------------
            // LIST VIEW (Renders header, delete button, and list)
            // -----------------------------------------------------
            <motion.div 
                key="list-container"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
            >
                {/* 1. HEADER AND DELETE ALL BUTTON (Only shown in list view) */}
                <h1 className="text-4xl font-extrabold mb-6 text-blue-900 tracking-wider border-b pb-2">
                    <Tally4 className="inline-block w-8 h-8 mr-3 text-blue-500" />
                    Your Prediction History
                </h1>

                <div className="mb-8 flex justify-between items-center">
                    <button
                        onClick={deleteAll}
                        disabled={history.length === 0}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Delete All History
                    </button>
                    {history.length > 0 && (
                        <p className="text-gray-600 text-sm">
                            {history.length} entr{history.length === 1 ? "y" : "ies"} found
                        </p>
                    )}
                </div>

                {/* 2. HISTORY LIST CONTENT */}
                {history.length === 0 ? (
                    <p className="text-lg text-gray-500 p-10 border rounded-xl bg-gray-50 text-center">
                        No history entries found. Run a prediction to see it here!
                    </p>
                ) : (
                    <motion.div
                        className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {history.map((item) => {
                            const { color: categoryColor, bg: categoryBg } = getCategoryStyles(item.category);
                            return (
                                <motion.div
                                    key={item.id}
                                    variants={itemVariants}
                                    onClick={() => {
                                      setSelectedItem(item);
                                      window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className={`
                                        relative border-t-4 border-blue-500 p-5 rounded-xl 
                                        shadow-xl hover:shadow-2xl transition duration-300 
                                        cursor-pointer bg-white transform hover:-translate-y-1 
                                        hover:ring-2 hover:ring-blue-300
                                    `}
                                >
                                    <h2 className="text-xl font-extrabold text-blue-800 mb-2 border-b pb-2">
                                        <span className="text-2xl mr-2">🏠</span>
                                        {item.building_type}
                                    </h2>
                                    
                                    <p className="text-xs text-gray-500 mb-4">
                                        Predicted:{" "}
                                        <span className="font-medium">
                                            {new Date(item.date).toLocaleDateString()}
                                        </span>
                                    </p>

                                    <div className="mt-3 space-y-3 text-sm">
                                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                            <p className="text-gray-600 font-medium">
                                                <Zap className="inline-block h-4 w-4 mr-1 text-blue-400" />
                                                Energy (kWh):
                                            </p>
                                            <p className="font-bold text-lg text-gray-800">
                                                {fmt2(item.energy)}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                            <p className="text-gray-600 font-medium">
                                                <Ruler className="inline-block h-4 w-4 mr-1 text-blue-400" />
                                                EUI (kWh/m²):
                                            </p>
                                            <p className="font-bold text-lg text-gray-800">
                                                {fmt2(item.eui)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <p className="text-sm font-semibold text-gray-600">
                                            Category:
                                        </p>
                                        <span
                                            className={`font-extrabold text-lg px-3 py-1 rounded-full ${categoryColor} bg-opacity-20 ${categoryBg}`}
                                        >
                                            {item.category}
                                        </span>
                                    </div>

                                    <div className="absolute top-2 right-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteOne(item.id);
                                            }}
                                            className="text-red-400 hover:text-red-600 text-xs p-1 rounded-full hover:bg-red-50 transition"
                                            title="Delete Entry"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 100 2v6a1 1 0 100-2V8z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}