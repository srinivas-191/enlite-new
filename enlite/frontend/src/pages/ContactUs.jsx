import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import ContactHero from "../components/ContactHero";
import emailjs from "@emailjs/browser";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const ContactUs = () => {
  const formSectionRef = useRef(null);
  const formRef = useRef();

  /* -----------------------------------------
        AUTO-SCROLL AFTER HERO ANIMATION
     ----------------------------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formSectionRef.current) {
        formSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 7000); // auto-scroll after 7 seconds

    return () => clearTimeout(timer);
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_lr713pu",
        "template_l22z93r",
        formRef.current,
        "6f4cpm8j6bAskPP6-"
      )
      .then(
        () => {
          alert("Message sent successfully!");
          e.target.reset();
        },
        (error) => {
          alert("Failed to send message. Try again.");
          console.error(error);
        }
      );
  };

  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden font-sans">
      {/* FLOATING BACKGROUND */}
      <div
        className="absolute inset-0 z-0 opacity-35"
        style={{
          background:
            "radial-gradient(900px 500px at 20% 10%, rgba(255,255,255,0.12), transparent)," +
            "radial-gradient(600px 400px at 90% 80%, rgba(255,255,255,0.06), transparent)",
        }}
      />

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section style={{ position: "relative", zIndex: 1 }}>
          <ContactHero />
        </section>

        {/* CONTACT SECTION */}
        <section
  ref={formSectionRef}
  className="py-20 relative text-black overflow-hidden bg-[#FCF5EE]"
>
  {/* BG Layer */}

  <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
    {/* OFFICE CARD */}
    <motion.div
      className="p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 backdrop-blur-md border border-white/20 
      bg-gradient-to-b from-[#0A1A3A] via-[#123A73] to-[#0E2A5C]"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-3xl font-extrabold text-center mb-6 text-white">
        Our Office
      </h2>

      <div className="space-y-5 text-lg text-gray-200">
        {[
          {
            icon: <MapPin className="w-6 h-6 text-blue-300" />,
            text: "Satyabama Complex, 301, KPHB Main Rd, Opposite Sai Baba Temple, Hyderabad, Telangana 500085",
          },
          {
            icon: <Phone className="w-6 h-6 text-blue-300" />,
            text: "+91 98765 43210",
          },
          {
            icon: <Mail className="w-6 h-6 text-blue-300" />,
            text: "contact@enlite.com",
          },
          {
            icon: <Clock className="w-6 h-6 text-blue-300" />,
            text: "Mon–Fri: 9:00 AM – 6:00 PM",
          },
        ].map((item, i) => (
          <motion.p
            key={i}
            className="flex items-start gap-3 p-3 rounded-xl backdrop-blur-sm border border-white/10 text-black"
            style={{ backgroundColor: '#E8F0FE' }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            <span className="mt-1">{item.icon}</span>
            {item.text}
          </motion.p>
        ))}
      </div>

      <div className="mt-10 rounded-xl overflow-hidden shadow-lg border border-white/20">
        <iframe
          title="office-map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.275128743829!2d78.40061497493731!3d17.494375083411132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91f20663c46d%3A0x846796db82f76735!2sSocial%20Prachar!5e0!3m2!1sen!2sin!4v1764223694075!5m2!1sen!2sin"
          width="100%"
          height="300"
          style={{ border: 0 }}
          loading="lazy"
        ></iframe>
      </div>
    </motion.div>

    {/* CONTACT FORM */}
    <motion.div
      className="p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 backdrop-blur-md border border-white/20
      bg-gradient-to-b from-[#0A1A3A] via-[#123A73] to-[#0E2A5C]"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <h2 className="text-3xl font-extrabold text-center mb-6 text-white">
        Send Us a Message
      </h2>

      <form ref={formRef} onSubmit={sendEmail} className="space-y-6">
        
        {/* Name */}
        <div>
          <label className="block mb-1 font-medium text-gray-200">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black placeholder-gray-500"
            style={{ backgroundColor: '#E8F0FE' }}
            placeholder="Enter your name"
            name="name"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-medium text-gray-200">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black placeholder-gray-500"
            style={{ backgroundColor: '#E8F0FE' }}
            placeholder="Enter your email"
            name="email"
            type="email"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1 font-medium text-gray-200">
            Phone <span className="text-red-400">*</span>
          </label>
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black placeholder-gray-500"
            style={{ backgroundColor: '#E8F0FE' }}
            placeholder="Enter your phone number"
            name="phone"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label className="block mb-1 font-medium text-gray-200">
            Message <span className="text-red-400">*</span>
          </label>
          <textarea
            className="w-full px-4 py-3 rounded-lg border border-gray-300 h-52 resize-none text-black placeholder-gray-500"
            style={{ backgroundColor: '#E8F0FE' }}
            placeholder="Write your message"
            name="message"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-full font-semibold text-white 
          bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all"
        >
          Submit
        </button>
      </form>
    </motion.div>
  </div>
</section>

        {/* FAQ SECTION */}
        {/* FAQ SECTION */}
        <section
          className="relative w-full min-h-[500px] md:min-h-[650px] flex items-center pb-0"
          style={{
            backgroundImage: "url('/assets/faq4.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
            backgroundPosition: "center center",
          }}
        >
          <div className="absolute inset-0"></div>

          {/* CONTENT WRAPPER */}
          <div
            className="
              relative z-10 
              w-full max-w-7xl mx-auto px-6 
              flex flex-col md:flex-row 
              items-start md:items-center 
              gap-6
            "
          >
            {/* LEFT SPACE FOR IMAGE (desktop only) */}
            <div className="hidden md:block w-[380px]"></div>

            {/* SMALL SCREEN HEADING */}
            <h2 className="
                text-3xl font-extrabold text-center text-blue-900  
                block md:hidden 
                max-w-xl mx-auto 
              ">
              FAQs
            </h2>

            {/* FAQ LIST */}
            <div
              className="
                w-full max-w-xl 
                md:mt-[-40px]
                md:ml-[40px]
                
                space-y-4

                /* center on small screens */
                mx-auto md:mx-0
                text-center md:text-left
              "
            >
              {[
                {
                  q: "What services does this website provide?",
                  a: "We provide AI-based energy prediction, efficiency analysis, and smart insights.",
                },
                {
                  q: "How can I contact the support team?",
                  a: "You can submit the contact form or email/call using the details above.",
                },
                {
                  q: "What is the response time?",
                  a: "We respond within 24 hours on working days.",
                },
                {
                  q: "Is my information safe?",
                  a: "Yes. All your data is securely handled and never misused.",
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  className="group bg-blue-50 text-blue-900 rounded-xl shadow-xl overflow-hidden" 
                >
                  <summary className="cursor-pointer flex items-center gap-3 px-4 py-3 font-semibold text-lg">
                    <span className="text-yellow-600">💡</span>
                    {faq.q}
                    <span className="ml-auto text-blue-600">▼</span>
                  </summary>

                  <div className="px-4 pb-3 text-gray-700 text-base">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactUs;