import React from "react";

const OurApproachSection = ({ content }) => {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] w-screen">

      <section className="py-16 w-full px-6 md:px-12 max-w-[96%] mx-auto">

        <h2 className="text-4xl font-extrabold text-center text-[#0b365f] mb-12">
          Our Approach & Expertise
        </h2>

        {/* Equal height only on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">

          {/* LEFT COLUMN — compact spacing */}
          <div
            className="p-6 md:p-8 bg-white border border-[#0b365f]/10 shadow-xl rounded-2xl w-full h-auto"
            data-aos="fade-left"
          >
            <h3 className="text-2xl font-bold text-[#0b365f] mb-3">
              Who We Are
            </h3>

            <p className="text-gray-700 leading-relaxed text-justify mb-4">
              {content.intro}
            </p>

            <h3 className="text-2xl font-bold text-[#0b365f] mb-3">
              What We Deliver
            </h3>

            <p className="text-gray-700 leading-relaxed text-justify mb-3">
              {content.deliverables}
            </p>

            <ul className="text-gray-700 list-disc pl-5 space-y-2">
              {content.summaryPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>

          {/* RIGHT COLUMN IMAGES */}
          <div
            className="relative w-full h-auto flex items-center justify-center"
            data-aos="fade-right"
          >
            <img
              src="/assets/whoweare.jpg"
              className="w-[75%] h-[55%] object-cover rounded-2xl shadow-2xl absolute top-4 right-0 z-10"
              alt="Team collaboration"
              loading="lazy"
            />

            <img
              src="/assets/answer.jpg"
              className="w-[80%] h-[60%] md:w-[70%] md:h-[65%] object-cover rounded-2xl shadow-xl absolute bottom-0 left-0 border-4 border-white z-20"
              alt="Data analysis"
              loading="lazy"
            />
          </div>

        </div>
      </section>

    </div>
  );
};

export default OurApproachSection;
