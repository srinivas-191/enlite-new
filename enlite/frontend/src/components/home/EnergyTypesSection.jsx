import {
    Building2,
    Factory,
    Home,
    Wind,
    Activity,
    Sun,
    CheckCircle,
    Zap,
    Leaf, Droplets,
    AlertTriangle,
    TrendingDown,
    CloudOff,
    DollarSign,
    Target,
    Trash2,
    Monitor,
} from "lucide-react";

import React, { lazy, Suspense } from "react";
import { motion } from "framer-motion";

import { useRef } from "react";
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// 1. Variant for the parent (to control the stagger delay)
const fadeUpStagger = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            duration: 0.6,
            staggerChildren: 0.15,
            delayChildren: 0.2
        } 
    },
};

export {fadeUp, fadeUpStagger};
const energyTypes = [
    { 
        id: 1, 
        title: "Wind Energy", 
        Icon: Wind,
        img: "/assets/understand1.jpg", 
        desc: "Wind energy utilizes the kinetic force of moving air to generate electricity through wind turbines. Advanced forecasting models help predict wind behavior, reduce power fluctuations, and support grid stability, ensuring a reliable supply even with changing weather conditions. Modern turbines are equipped with sensors and pitch control systems to maximize energy capture at various wind speeds.",
        color: "text-blue-500"
    },
    { 
        id: 2, 
        title: "Solar Energy", 
        Icon: Sun,
        img: "/assets/understand2.jpg", 
        desc: "Solar Energy converts sunlight into electricity using photovoltaic (PV) panels. Accurate performance modeling evaluates how factors like temperature, shading, and weather conditions affect power production, helping maximize overall solar efficiency. The electricity generated can be used immediately, stored in batteries for later use, or exported back to the electrical grid. Continuous monitoring and analysis of data from inverters ensure optimal energy harvesting and rapid detection of system faults.",
        color: "text-yellow-500"
    },
    { 
        id: 3, 
        title: "Eco & Green Energy", 
        Icon: Leaf,
        img: "/assets/understand3.jpg", 
        desc: "Eco & Green Energy includes sustainable sources such as biomass, geothermal heat, and environmentally responsible hydroelectric systems. Predictive modeling helps manage irregular supply patterns, optimize resource usage, and improve carbon-emissions tracking for cleaner, greener energy operations. Biomass is created from organic materials like wood, agricultural waste, and certain crops, offering a carbon-neutral fuel option.",
        color: "text-green-600"
    },
    { 
        id: 4, 
        title: "Hydro Energy", 
        Icon: Droplets,
        img: "/assets/understand4.jpg", 
        desc: "Hydro Energy generates electricity using the natural flow of water through dams or river systems. High-precision forecasting of rainfall, water levels, and seasonal patterns allows better control of power generation, reservoir planning, and grid dispatch. Pumped-storage hydropower (PSH) is currently the largest form of energy storage globally, using excess grid energy to pump water uphill for later release.",
        color: "text-blue-700"
    },
];
export { energyTypes };

const EnergyTypesSection = lazy(() => Promise.resolve().then(() => ({
  default: ({ activeEnergy, setActiveEnergy, energyTypes }) => (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] w-screen">
      <section className="py-24 px-6 md:px-12 max-w-[96%] mx-auto pb-0">
  <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
    Understanding Energy Types
  </h2>

  {/* MOBILE: Single column dynamic order */}
  <div className="md:hidden space-y-4 text-justify">
    <motion.div
      className="space-y-4 p-10 bg-white rounded-xl shadow-inner"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
    {energyTypes.map((type) => {
      const isActive = activeEnergy.id === type.id;
      return (
        <React.Fragment key={type.id}>
          <motion.button
            key={type.id}
            onClick={() => setActiveEnergy(type)}
            className={`group w-full text-left p-5 shadow-md border flex items-center transition-all duration-300
              ${
                isActive
                  ? "bg-sia-blue text-white border-sia-blue scale-[1.03] shadow-xl"
                  : "hover:bg-sia-blue text-white border-sia-blue bg-[#fbfbfc]"
              }
            `}
            variants={fadeUp}
            whileHover={{ scale: isActive ? 1.03 : 1.02 }}
          >
            <type.Icon
              className={`w-6 h-6 mr-4 flex-shrink-0 transition-all duration-300 
                ${isActive ? type.color : type.color}
              `}
            />

            <span
              className={`text-lg font-semibold transition-colors duration-200
                ${isActive ? "text-white" : "group-hover:text-white text-gray-800"}
              `}
            >
              {type.title}
            </span>
          </motion.button>

          {isActive && (
            <motion.div
              className="shadow-xl border bg-white overflow-hidden"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <img
                src={type.img}
                alt={type.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h4 className="text-2xl font-bold mb-3 flex items-center">
                  <type.Icon className={`w-6 h-6 mr-2 ${type.color}`} />
                  <span className={type.color}>{type.title}</span>
                </h4>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {type.desc}
                </p>
              </div>
            </motion.div>
          )}
        </React.Fragment>
      );
    })}
    </motion.div>
  </div>

  {/* DESKTOP LAYOUT */}
  <div className="hidden md:grid grid-cols-2 gap-12 text-justify">
    {/*       LEFT SECTION: Focus Areas (Now with a distinct background container) 
      Added 'p-6 bg-gray-50 rounded-xl shadow-inner' to create the container effect.
    */}
    <motion.div
      className="space-y-4 p-6 bg-white rounded-xl shadow-inner"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* <h3 className="text-2xl font-semibold mb-6 text-gray-700">
        Explore Our Focus Areas:
      </h3> */}

      {energyTypes.map((type) => {
        const isActive = activeEnergy.id === type.id;
        return (
          <motion.button
            key={type.id}
            onClick={() => setActiveEnergy(type)}
            className={`group w-full text-left p-5 shadow-md border flex items-center transition-all duration-300
                        ${
                          isActive
                            ? "bg-sia-blue text-white border-sia-blue scale-[1.03] shadow-xl"
                            : "hover:bg-sia-blue text-white border-sia-blue bg-[#fbfbfc]"
                        }
                      `}
            variants={fadeUp}
            whileHover={{ scale: isActive ? 1.03 : 1.02 }}
          >
            <type.Icon
              className={`w-6 h-6 mr-4 flex-shrink-0 transition-all duration-300 
                ${isActive ? "text-white" : type.color}
              `}
            />
            <span
              className={`text-lg font-semibold transition-colors duration-200
                ${isActive ? "text-white" : "group-hover:text-white text-gray-800"}
              `}
            >
              {type.title}
            </span>
          </motion.button>
        );
      })}
    </motion.div>

    {/*       RIGHT SECTION: Content Display 
      Removed 'bg-white' from the parent container to allow the surrounding background 
      (which was removed from the main wrapper) to show through, but the content box 
      itself retains its shadow and white background.
    */}
    <motion.div
      key={activeEnergy.id}
      className="shadow-xl border bg-white overflow-hidden rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <img
        src={activeEnergy.img}
        alt={activeEnergy.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-8">
        <h4 className="text-3xl font-bold mb-4 flex items-center">
          <activeEnergy.Icon
            className={`w-7 h-7 mr-3 ${activeEnergy.color}`}
          />
          <span className={activeEnergy.color}>{activeEnergy.title}</span>
        </h4>
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          {activeEnergy.desc}
        </p>
      </div>
    </motion.div>
  </div>
</section>
    </div>
  )
})));
export default EnergyTypesSection;