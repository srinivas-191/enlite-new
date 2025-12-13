// src/components/about/WhyChooseUs.jsx
import React from "react";

const WhyChooseUs = () => {
  const points = [
    "Industry-focused energy prediction tools",
    "Models built on real data",
    "Simple and user-friendly interface",
    "Reliable and scalable architecture",
    "Designed for individuals & enterprises",
    "Instant insights with intuitive dashboards",
  ];

  return (
    <section
      className="
        relative 
        min-h-[650px]
        lg:h-[525px]
        bg-gray-900
      "
    >
      {/* LARGE SCREEN BACKGROUND */}
      <div
        className="
          hidden lg:block absolute inset-0
          bg-contain bg-center bg-no-repeat
        "
        style={{ backgroundImage: "url('/assets/whychooseus2.png')", 
          backgroundColor:"#1d2023ff",
          backgroundBlendMode:"lighten"
         }}
      ></div>

      <div className="hidden lg:block absolute inset-0 bg-black/30"></div>

      {/* CONTENT WRAPPER */}
      <div
        className="
          relative max-w-7xl mx-auto px-6 md:px-16 text-white
          flex flex-col h-full
          pt-10 md:pt-14
          lg:pt-0
          pb-10
          lg:justify-end
          lg:pb-24
        "
      >
        {/* TITLE (hidden on large screens) */}
        <div className="text-center mb-10 md:mb-12 lg:hidden">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-wide drop-shadow-lg">
            WHY CHOOSE US?
          </h2>
        </div>

        {/* CARDS */}
        <div
          className="
            grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
            gap-6 md:gap-8
            pt-2
          "
        >
          {points.map((point, i) => (
            <div
              key={i}
              className="
                p-4 md:p-5
                bg-white/15
                border border-white/20
                shadow-xl
                rounded-2xl
                flex gap-3 items-start
                backdrop-blur-md
                hover:bg-white/20
                transition-all duration-300
              "
            >
              {/* ICON */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-green-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>

              {/* TEXT */}
              <p className="text-white/90 text-base md:text-lg leading-relaxed font-medium">
                {point}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;
