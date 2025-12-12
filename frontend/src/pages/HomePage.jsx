import React, { useEffect, useRef, useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";

import { Link } from "react-router-dom";
import DynamicHero from "../components/home/DynamicHero";

import { energyTypes } from "../components/home/EnergyTypesSection";
//import EnergyTypesSection from "../components/home/EnergyTypesSection";
import { industryGaps } from "../components/home/IndustryGapsSection";
import IndustryGapsSection from "../components/home/IndustryGapsSection";
import {lightCardStyle} from "../components/home/IndustryGapsSection";
import {listItemVariants} from "../components/home/IndustryGapsSection";
import SolutionsSection from "../components/home/SolutionsSection";
import WhyHowSection from "../components/home/WhyHowSection";
import CTASection from "../components/home/CTASection";
// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
  </div>
);

/* ---------------------------------------------------------------
    1. WIND TURBINE (Logic for Blade Visible, Pole Hidden)
------------------------------------------------------------------ */
/* ---------------------------------------------------------------
    5. DYNAMIC SCENE CONTAINER (Replaces static hero structure)
------------------------------------------------------------------ */

// Rest of the code remains the same for variants, data, and other sections...
// ORIGINAL VARIANT (for non-staggered elements)
// 2. Variant for the child list items (slide in from left)


// **DATA FOR NEW GAP CARDS**



const SectionSkeleton = ({ lines = 3 }) => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-12"></div>
    <div className="space-y-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

// Lazy load the heavy hero component


// Lazy load major sections







const HomePage = () => {
  const [activeEnergy, setActiveEnergy] = useState(energyTypes[0]);

  return (
    <div className="min-h-screen bg-[#FCF5EE]">
      {/* Hero Section with Lazy Loading */}
      <Suspense fallback={<LoadingSpinner />}>
        <DynamicHero />
      </Suspense>
      
      {/* Content Sections */}
      <div className="relative text-gray-900  pb-0">
        <div className="relative z-10 max-w-7xl mx-auto pb-0">
          
          {/* Energy Types Section */}
          {/* <Suspense fallback={
            <section className="py-24 px-6 max-w-6xl mx-auto pb-0">
              <SectionSkeleton />
            </section>
          }>
            <EnergyTypesSection 
              activeEnergy={activeEnergy} 
              setActiveEnergy={setActiveEnergy}
              energyTypes={energyTypes}
            />
          </Suspense> */}
  
          {/* Industry Gaps Section */}
          <Suspense fallback={
            <section className="py-24 px-6">
              <SectionSkeleton lines={6} />
            </section>
          }>
            <IndustryGapsSection industryGaps={industryGaps} />
          </Suspense>

          {/* Solutions Section */}
          <Suspense fallback={
            <section className="relative px-6 bg-gray-900 min-h-[400px] flex items-center justify-center">
              <div className="text-white text-xl">Loading Solutions...</div>
            </section>
          }>
            <SolutionsSection />
          </Suspense>

          {/* Why & How Section */}
          <Suspense fallback={
            <section className="py-24 px-6">
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-gray-200 rounded h-64 animate-pulse"></div>
                <div className="p-8 bg-gray-200 rounded h-64 animate-pulse"></div>
              </div>
            </section>
          }>
            <WhyHowSection />
          </Suspense>

          {/* CTA Section */}
          <Suspense fallback={
            <section className="relative text-center py-10 px-10 overflow-hidden bg-gray-800 min-h-[300px] flex items-center justify-center">
              <div className="text-white text-xl">Loading...</div>
            </section>
          }>
            <CTASection />
          </Suspense>

        </div>
      </div>
    </div>
  );
};

export default HomePage;