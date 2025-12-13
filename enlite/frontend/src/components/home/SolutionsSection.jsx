import { lazy } from "react";
import {
  Building2,
  Factory,
  Home,
  Wind,
  Activity,
  Sun,
} from "lucide-react";
import { motion } from "framer-motion";

const SolutionsSection = lazy(() =>
  Promise.resolve().then(() => ({
    default: () => (
      <div className="relative left-1/2 right-1/2 -ml-[50vw] w-screen ">

        <section
          className="relative px-6 md:px-12 py-24 max-w-[89.6%] mx-auto bg-gray-900"
          style={{
            backgroundImage: `url(/assets/solutions.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="absolute inset-0 bg-black/60 z-10" />

          <div className="relative z-20 w-full">

            <h3 className="text-4xl font-bold text-center text-white mb-10">
              Where Our Solutions Apply?
            </h3>

            <div className="w-full bg-white shadow-2xl overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-white">
                {[
                  { Icon: Building2, text: "Building Optimization" },
                  { Icon: Factory, text: "Industrial Planning" },
                  { Icon: Home, text: "Smart Cities" },
                  { Icon: Wind, text: "Green Monitoring" },
                  { Icon: Activity, text: "Predictive Maintenance" },
                  { Icon: Sun, text: "Solar Analytics" },
                ].map(({ Icon, text }, i) => (
                  <motion.div
                    key={i}
                    className="
                      px-6 py-10 border-r last:border-r-0 
                      border-gray-200 flex flex-col items-center 
                      justify-start text-center group 
                      hover:bg-sia-blue transition-all duration-300
                    "
                  >
                    <Icon className="w-12 h-12 text-red-600 group-hover:text-red-600 transition-colors" />
                    <p className="mt-4 text-gray-800 group-hover:text-white font-semibold">
                      {text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </div>
    ),
  }))
);

export default SolutionsSection;
