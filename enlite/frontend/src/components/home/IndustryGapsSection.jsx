import React, { lazy } from "react";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    TrendingDown,
    CloudOff,
    DollarSign,
    Target,
    Trash2,
    Monitor,
} from "lucide-react";

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

const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const lightCardStyle = { 
    backgroundColor: "rgba(255, 255, 255, 0.9)", 
    backdropFilter: "blur(5px)"
};

export { listItemVariants, lightCardStyle };

const industryGaps = [
    {
        title: "Inefficient Consumption",
        desc: "Current systems lack granularity to identify specific areas of high energy waste across buildings and industrial assets.",
        Icon: TrendingDown,
        color: "text-red-500",
    },
    {
        title: "Non-Renewable Reliance",
        desc: "A significant portion of energy supply still comes from fossil fuels due to a lack of optimized integration of intermittent green sources.",
        Icon: CloudOff,
        color: "text-amber-500",
    },
    {
        title: "Volatile Energy Costs",
        desc: "Organizations struggle to forecast and manage rapidly increasing and fluctuating energy costs caused by market volatility and lack of foresight.",
        Icon: DollarSign,
        color: "text-green-500",
    },
    {
        title: "Poor Predictive Insights",
        desc: "Existing models fail to accurately predict future energy demands and resource availability, leading to reactive instead of proactive management.",
        Icon: Target,
        color: "text-blue-500",
    },
    {
        title: "Energy Waste & Load Issues",
        desc: "Suboptimal load management often results in energy being generated or consumed unnecessarily, leading to substantial economic and environmental waste.",
        Icon: Trash2,
        color: "text-purple-500",
    },
    {
        title: "Limited Real-Time Monitoring",
        desc: "Many assets operate without continuous, granular monitoring, meaning issues and inefficiencies are only discovered after significant waste has occurred.",
        Icon: Monitor,
        color: "text-cyan-500",
    },
];
export { industryGaps };

const IndustryGapsSection = lazy(() =>
  Promise.resolve().then(() => ({
    default: ({ industryGaps }) => (
      
      <div className="relative left-1/2 right-1/2 -ml-[50vw] w-screen">
        <section className="py-24 px-6 md:px-12 max-w-[96%] mx-auto ">

          <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex justify-center items-center">
            Current Industry Gaps  
            <AlertTriangle className="ml-3 w-8 h-8 text-yellow-500" />
          </h3>

          <motion.div
            className="
              grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 
              gap-8 
              items-start
            "
            variants={fadeUpStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {industryGaps.map((gap, i) => (
              <motion.div 
                key={i}
                className="
                  p-6 shadow-lg border hover:shadow-xl 
                  transition-shadow duration-300 
                  flex flex-col h-full
                "
                style={lightCardStyle}
                variants={listItemVariants}
              >
                <div className="flex items-start mb-3">
                  <gap.Icon className={`w-8 h-8 mr-3 flex-shrink-0 ${gap.color}`} />
                  <h4 className="text-xl font-bold text-gray-800">{gap.title}</h4>
                </div>

                <p className="text-gray-700 mt-2 text-base text-justify">{gap.desc}</p>

                <div className="mt-auto"></div>
              </motion.div>
            ))}
          </motion.div>

        </section>
      </div>
    ),
  }))
);

export default IndustryGapsSection;
