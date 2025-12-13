import { lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp } from "./EnergyTypesSection";

const CTASection = lazy(() =>
  Promise.resolve().then(() => ({
    default: () => (

      <div className="relative left-1/2 right-1/2 -ml-[50vw] w-screen">

        <section
          className="relative text-center py-10 px-10 max-w-[89.6%] mx-auto overflow-hidden"
          style={{
            backgroundImage: `url(/assets/model.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#0a1945",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/70 z-10" />

          {/* Inner content */}
          <motion.div
            className="relative z-20 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.h3
              className="text-4xl font-bold mb-8 text-white"
              variants={fadeUp}
            >
              Ready to Explore Smarter Energy Solutions? 🚀
            </motion.h3>

            <Link to="/solutions">
              <button className="group relative bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white px-10 py-3 rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <span className="relative">Explore Solutions</span>
              </button>
            </Link>
          </motion.div>

        </section>

      </div>

    ),
  }))
);

export default CTASection;
