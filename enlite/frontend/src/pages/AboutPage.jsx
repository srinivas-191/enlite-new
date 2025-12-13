// src/pages/AboutPage.jsx
import React, { useEffect, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import AOS from "aos";

// Lazy load components
const OurApproachSection = lazy(() =>
  import("../components/about/OurApproachSection")
);
const OurGoalsSection = lazy(() =>
  import("../components/about/OurGoalsSection")
);
const OurTeamSection = lazy(() =>
  import("../components/about/OurTeamSection")
);
const WhyChooseUs = lazy(() =>
  import("../components/about/WhyChooseUs")
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const AboutPage = () => {
  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  // Combined content for Approach Section
  const mergedWhoWhatContent = {
    intro:
      "We are a team of engineers, data scientists, and developers dedicated to transforming how organizations understand and use energy. Our goal is to combine advanced data science with practical industry knowledge to build powerful, accessible, and scalable energy solutions.",
    deliverables:
      "We build intelligent analytics solutions powered by Machine Learning and Data Science to evaluate performance, detect inefficiencies, and forecast energy consumption.",
    summaryPoints: [
      "Combine advanced data science with practical industry knowledge.",
      "Develop intelligent systems that analyze energy patterns and detect inefficiencies.",
      "Support industries, buildings, and smart homes in optimizing resources.",
    ],
  };

  // Goals metrics data
  const metricsData = [
    { number: "10+", label: "AI Energy Models" },
    { number: "20–30%", label: "Avg. Savings" },
    { number: "4+", label: "Industry Domains" },
    { number: "10K+", label: "Data Points" },
  ];

  return (
    <div className="font-sans text-gray-800 bg-[#fcf5ee]">

      {/* ================= HERO SECTION ================= */}
      <section
        className="relative h-[70vh] w-full flex flex-col justify-center items-center text-center pb-0"
        style={{
          backgroundImage: "url('/assets/aboutnew.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 px-6">
          <motion.h1
            className="text-white text-5xl md:text-6xl font-bold"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            About Us
          </motion.h1>

          <div className="w-28 h-1 bg-red-500 mx-auto mt-4 rounded-full"></div>

          <motion.p
            className="text-white/90 text-lg md:text-xl max-w-3xl mt-6 mx-auto leading-relaxed"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            Our platform integrates Artificial Intelligence, Data Science,
            and Renewable Energy technologies to predict and optimize
            energy usage across infrastructures.
          </motion.p>
        </div>
      </section>

      {/* ================= LAZY LOADED CONTENT ================= */}
      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>

        <OurApproachSection content={mergedWhoWhatContent} />

        <OurGoalsSection metricsData={metricsData} />

        <OurTeamSection />

        <WhyChooseUs />

      </Suspense>

    </div>
  );
};

export default AboutPage;
