import React from "react";

const teamMembers = [
  { name: "Sandeep", role: "Data Scientist", img: "/assets/user1.png" },
  { name: "Naveen", role: "Data Scientist", img: "/assets/user2.jpg" },
  { name: "Nishchala", role: "Data Scientist", img: "/assets/user3.jpeg" },
  { name: "Chandra Kiran", role: "Full-Stack Developer", img: "/assets/user4.jpeg" },
  { name: "Srinivas", role: "Full-Stack Developer", img: "/assets/user5.jpg" },
  { name: "Pooja", role: "Full-Stack Developer", img: "/assets/user6.jpeg" },
];

const OurTeamSection = () => {
  return (
    
    <div className="relative left-1/2 right-1/2 -ml-[50vw] w-screen">

      <section className="py-16 w-full px-6 md:px-12 max-w-[96%] mx-auto">

        <h2 className="text-3xl font-bold text-[#0b365f] text-center mb-10">
          Our Team
        </h2>

        <div className="bg-white shadow-2xl overflow-hidden rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">

            {teamMembers.map((member, i) => (
              <div
                key={i}
                className="px-6 py-10 border-gray-200 border-r border-b flex flex-col 
                           items-center text-center group hover:bg-[#0b365f] 
                           transition-all duration-300"
              >
                <div
                  className="w-24 h-24 overflow-hidden mb-4"
                  style={{ borderRadius: "100% 100% 100% 0" }}
                >
                  <img
                    src={member.img}
                    className="w-full h-full object-cover"
                    alt={member.name}
                    loading="lazy"
                  />
                </div>

                <h4 className="text-lg font-semibold text-[#0b365f] group-hover:text-white">
                  {member.name}
                </h4>

                <p className="text-gray-600 text-sm group-hover:text-white">
                  {member.role}
                </p>
              </div>
            ))}

          </div>
        </div>

      </section>

    </div>
  );
};

export default OurTeamSection;
