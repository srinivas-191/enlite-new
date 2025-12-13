// src/pages/Solutions.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AOS from "aos";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// ====================================================================
// Floating/Sticky Prediction Button (Updated for login compatibility)
// ====================================================================
const FloatingPredictionButton = ({ isFixed, onTry }) => {
  return (
    <div
      onClick={onTry}
      className="cursor-pointer no-underline hover:no-underline"
      style={
        isFixed
          ? {
              position: "fixed",
              top: "5rem",
              right: "2rem",
              zIndex: 50,
            }
          : {}
      }
    >
      <div className="flex items-center">
        <motion.div
          animate={{ x: [0, -8, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-2xl select-none"
        >
          👉
        </motion.div>

        <motion.button
          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 text-lg font-bold rounded-full shadow-xl flex items-center hover:shadow-2xl transition-all select-none"
          whileHover={{ scale: 1.1 }}
        >
          Try the Prediction Model <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

const SolutionsPage = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const buttonContainerRef = useRef(null);
  const navigate = useNavigate();

  // ======================================================
  // UPDATED TRY BUTTON HANDLER (Login check added)
  // ======================================================
  const handleTry = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Not logged in → send user to login then redirect back.
      localStorage.setItem("postLoginRedirect", "/predict");
      navigate("/login");
      return;
    }

    // Logged in → show disclaimer
    setShowDisclaimer(true);
  };

  // Navigate after user accepts disclaimer
  const handleContinue = () => {
    setShowDisclaimer(false);
    navigate("/predict");
  };

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // Floating button scroll handling
  useEffect(() => {
    const handleScroll = () => {
      if (buttonContainerRef.current) {
        const bottom = buttonContainerRef.current.getBoundingClientRect().bottom;
        setIsFixed(bottom < 50);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FCF5EE] text-gray-800 font-sans py-10">

      {/* ================================
          SECTION 1 — HERO
      ================================ */}
      <section
        className="relative h-[50vh] w-full flex flex-col justify-center items-center text-center"
        style={{
          backgroundImage: "url('/assets/ourhero.png')",
          backgroundSize: "contain contain",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1
            className="text-white text-5xl md:text-6xl font-extrabold leading-tight"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            Our AI
          </motion.h1>

          <div className="w-28 h-1 bg-red-500 mx-auto mt-5 rounded-full"></div>
        </div>
      </section>

      {/* ================================
          SIDE-BY-SIDE — ABOUT / HOW IT WORKS
      ================================ */}
      <section className="py-20 px-6 md:px-16 max-w-8xl mx-auto pb-0">
        <div className="grid grid-cols-1 gap-12 items-start">

          {/* LEFT LARGE CARD */}
          <motion.div
            className="bg-white p-10 text-justify shadow-xl border border-[#0b365f] leading-relaxed"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            ref={buttonContainerRef}
          >
            <div className="text-center sm:text-start sm:flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-[#0b365f]">About Our Model</h3>

              {!isFixed && (
                <FloatingPredictionButton
                  isFixed={false}
                  onTry={handleTry}
                />
              )}
            </div>

            <p className="text-lg">Our machine learning model is designed to accurately predict a building’s monthly total energy consumption and Energy Use Intensity (EUI).</p>
            <p className="text-lg">The model analyzes key factors influencing energy usage, utilizing comprehensive inputs provided by the user. These inputs include building and operational parameters (such as total area, occupancy level, lighting/equipment density, and daily hot water usage) as well as envelope-related parameters (like insulation U-values, window-to-wall ratio, and building type—e.g., bungalow, detached). HVAC system efficiency (COP) is also a crucial input.</p>
            <p className="text-lg">By evaluating how these factors affect energy performance, the system identifies inefficiencies and generates tailored, personalized recommendations (e.g., improving envelope insulation or optimizing HVAC performance). Ultimately, this provides building owners with actionable insights to reduce energy consumption, lower operational costs, improve efficiency, and clearly understand their building’s monthly performance.</p>

          </motion.div>

          {/* RIGHT SIDE STACK (2 CONTAINERS) */}
          <div className="flex flex-col gap-8 w-full text-lg"> 
            
            {/* CONTAINER 1: HOW IT WORKS & DEMO */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white p-6 md:p-8 shadow-xl border border-[#0b365f] leading-relaxed w-full" 
            >
              <div className="mb-4 text-justify">
                <h3 className="text-center sm:text-start text-3xl font-bold text-[#0b365f] mb-5">
                  How Model Works
                </h3>
                <p>The model analyzes building, envelope, and HVAC inputs using a trained machine learning system to predict monthly energy consumption and Energy Use Intensity (EUI). The “How It Works (PDF)” button provides a detailed document explaining the model’s process, while the “View Demo” button lets users interactively see how predictions are generated.</p>
                
                <div className="mt-6 flex justify-start">
                  <a
                    href="/assets/howitworks.pdf"
                    download
                    className="bg-white text-gray-600 px-10 py-3 text-lg rounded-full shadow-md hover:bg-gray-100 transition-all inline-flex items-center gap-2 mx-3"
                  >
                    📘 How It Works (PDF)
                  </a>
                  {/* NOTE: You did not have a View Demo button, but I'll leave the link structure here if you want to add it later */}
                  {/* <Link
                    to="/demo"
                    className="bg-white text-gray-600 px-10 py-3 text-lg rounded-full shadow-md hover:bg-gray-100 transition-all inline-flex items-center gap-2 mx-3"
                  >
                    ▶️ View Demo
                  </Link> */}
                </div>
              </div>

            </motion.div>

            
            {/* CONTAINER 2: WHY CLIENTS NEED IT */}
            <motion.div
              className="bg-white p-6 shadow-xl border border-gray-200 text-lg"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              
              <h2 className="text-2xl font-semibold mb-3">Why Organizations Use This Model</h2>
              <ul className="text-gray-700 space-y-3 leading-relaxed">
                <li>• Lower energy and operational costs</li>
                <li>• Improve HVAC and building system performance</li>
                <li>• Prevent over-designed systems and energy leakage</li>
                <li>• Achieve sustainability compliance and certifications</li>
              </ul>
            </motion.div>

          </div> {/* End of Right Side Stack */}
        </div>
      </section>

      {/* ================================
          FUTURE SCOPE
      ================================ */}
      <section className="pt-5 px-6 md:px-16 max-w-8xl mx-auto">
        <motion.div
          className="bg-white p-10 shadow-2xl leading-relaxed text-gray-700 text-lg"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-[#0b365f] mb-3 flex items-center gap-3">
            Future Scope
          </h2>
          <p className="text-justify">In future releases, the system will evolve into a fully real-time, adaptive energy intelligence platform. We plan to integrate live inputs from smart meters, IoT sensors, and dynamic weather data to deliver continuously updated and more context-aware predictions. The architecture will further expand to support multi-building, industrial, and smart-grid environments with scalable data pipelines. Over time, the platform will also build detailed user-specific energy profiles, enabling deeper trend insights, personalized benchmarks, and long-term optimization paths.</p>
        </motion.div>
      </section>

      {/* FLOATING BUTTON WHEN FIXED */}
      {isFixed && (
        <FloatingPredictionButton
          isFixed={true}
          onTry={handleTry}
        />
      )}

      {/* ======================================================
          DISCLAIMER MODAL
      ====================================================== */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 md:p-8">

            <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Important Disclaimer</h2>
            <p className="text-gray-700 mb-6 text-lg">
              Please review the <b>How It Works PDF</b> before using the prediction model.
              Incorrect inputs will lead to inaccurate predictions.
            </p>

            <div className="flex flex-col space-y-3">
              <a
                href="/assets/howitworks.pdf"
                download
                className="w-full text-center bg-[#0b365f] text-white px-4 py-3 text-lg font-semibold rounded-md hover:bg-[#0b365f]/90 transition-colors"
              >
                📘 Review How It Works (PDF)
              </a>

              <div className="flex justify-between space-x-4 pt-2">
                <button
                  onClick={handleCloseDisclaimer}
                  className="w-1/2 bg-gray-300 text-gray-800 px-4 py-3 text-lg rounded-md hover:bg-gray-400 transition-colors font-semibold"
                >
                  Close
                </button>

                <button
                  onClick={handleContinue}
                  className="w-1/2 bg-green-600 text-white px-4 py-3 text-lg rounded-md hover:bg-green-700 transition-colors font-semibold"
                >
                  Continue to Predict
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SolutionsPage;
