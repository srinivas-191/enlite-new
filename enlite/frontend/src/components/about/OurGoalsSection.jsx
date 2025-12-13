// src/components/about/OurGoalsSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { Zap, Eye } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const OurGoalsSection = ({ metricsData }) => {
  return (
    <section
      className="py-20 relative"
      style={{
        backgroundImage: "url('/assets/goals.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16">

        {/* Mission + Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="group p-8 bg-white/90 shadow-xl rounded-xl space-y-4 backdrop-blur-md transition-all duration-300 hover:bg-[#0b365f]"
          >
            <h3 className="text-3xl font-bold flex items-center text-[#0b365f] group-hover:text-white">
              <Zap className="w-8 h-8 mr-3 text-red-500" />
              Mission
            </h3>
            <p className="text-gray-700 text-lg group-hover:text-white transition">
              To simplify energy optimization through intelligent tools that deliver fast, accurate, and actionable insights.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="group p-8 bg-white/90 shadow-xl rounded-xl space-y-4 backdrop-blur-md transition-all duration-300 hover:bg-[#0b365f]"
          >
            <h3 className="text-3xl font-bold flex items-center text-[#0b365f] group-hover:text-white">
              <Eye className="w-8 h-8 mr-3 text-green-500" />
              Vision
            </h3>
            <p className="text-gray-700 text-lg group-hover:text-white transition">
              To become a leading provider of smart energy solutions that empower cities and enterprises.
            </p>
          </motion.div>

        </div>

        {/* Goals */}
        <h3 className="text-3xl font-bold text-center text-white mb-8">
          Our Goals
        </h3>

        <div className="relative z-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {metricsData.map((item, i) => (
            <div
              key={i}
              className="group p-4 md:p-6 rounded-xl text-center shadow-lg bg-white hover:!bg-[#0b365f] transition-all duration-300 cursor-pointer"
            >
              <p className="text-3xl font-extrabold mb-1 text-red-600 transition-colors">
                {item.number}
              </p>
              <p className="font-semibold text-gray-700 text-sm md:text-base group-hover:text-white transition-colors">
                {item.label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default OurGoalsSection;
