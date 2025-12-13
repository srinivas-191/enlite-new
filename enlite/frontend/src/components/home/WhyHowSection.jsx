import { lazy } from "react";
import { Zap, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "./EnergyTypesSection";
import { lightCardStyle } from "./IndustryGapsSection";

const WhyHowSection = lazy(() =>
  Promise.resolve().then(() => ({
    default: () => (

      <div className="relative left-1/2 right-1/2 -ml-[50vw] w-screen">

        <section className="py-24 px-6 md:px-12 max-w-[96%] mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* WHY ORGANIZATIONS NEED US */}
            <motion.div
              className="p-8 shadow-xl border"
              style={lightCardStyle}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
            >
              <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-blue-500" /> 
                Why Organizations Need Us
              </h3>

              <ul className="text-gray-700 space-y-3 list-disc pl-5">
                <li>Traditional methods lack precision in forecasting.</li>
                <li>Manual audits cannot predict efficiency changes.</li>
                <li>Lack of actionable insights for cost reduction.</li>
                <li>High energy wastage due to outdated systems.</li>
                <li>Need for smart automated systems and control.</li>
              </ul>
            </motion.div>

            {/* HOW WE DELIVER VALUE */}
            <motion.div
              className="p-8 shadow-xl border"
              style={lightCardStyle}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-emerald-500" /> 
                How We Deliver Value
              </h3>

              <ul className="text-gray-700 space-y-3 list-disc pl-5">
                <li>AI-driven predictions for peak load and supply.</li>
                <li>Reliable and efficient assessments of current infrastructure.</li>
                <li>Supports planning & retrofitting for decarbonization.</li>
                <li>Reduces costs and increases sustainability efforts.</li>
                <li>Provides detailed energy scores and performance metrics.</li>
              </ul>
            </motion.div>

          </div>
        </section>

      </div>

    ),
  }))
);

export default WhyHowSection;
