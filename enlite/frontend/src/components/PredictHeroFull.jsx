// PredictHeroFull.jsx
import React from "react";
import { motion } from "framer-motion";

export default function PredictHeroFull({ className }) {
  return (
    <div
      className={`w-full flex justify-center items-center gap-10 px- ${className}`}
    >
    

      {/* RIGHT — VIDEO CENTERED VERTICALLY */}
      <div className="flex items-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-gray-200/60 bg-white/70">
            <h3 className="text-lg font-semibold text-gray-800">Demo</h3>
          </div>

          <div className="p-4 bg-gray-50">
            <div className="rounded-xl overflow-hidden shadow border">
              <video
                src="/assets/demo.mp4"
                controls
                autoPlay
                loop
                muted
                className="w-full object-contain"
              />
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
