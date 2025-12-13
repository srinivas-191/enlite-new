import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const COLORS = {
  BLUE_BG: "#041b4c",
  ACCENT: "#00CFFF",
};

const glassBox = {
  background: "rgba(0, 140, 255, 0.12)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(0, 180, 255, 0.35)",
  boxShadow: `
    0 0 20px rgba(0, 180, 255, 0.6),
    0 0 40px rgba(0,140,255,0.35),
    inset 0 0 10px rgba(0, 180, 255, 0.8)
  `,
  borderRadius: "18px",
};

const ContactHero = () => {
  const [phase, setPhase] = useState("hero");
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const type = async (text, setter) => {
    setter("");
    for (let i = 0; i <= text.length; i++) {
      setter(text.slice(0, i));
      await delay(40);
    }
  };

  useEffect(() => {
    const loop = async () => {
      while (true) {
        setPhase("hero");
        await delay(2500);

        setPhase("form");
        await delay(300);

        await type("Tony Stark", setName);
        await type("starkindustries.com", setMail);
        await type("9876543210", setPhone);
        await type("I want to know more about your services.", setMsg);

        await delay(700);

        setPhase("success");
        await delay(2000);

        setName("");
        setMail("");
        setPhone("");
        setMsg("");
      }
    };

    loop();
  }, []);

  return (
    <section
      className="px-6 py-24 text-center relative overflow-hidden flex justify-center items-center"
      style={{
        background: COLORS.BLUE_BG,
        position: "relative",
        zIndex: 2,
        backgroundImage:"url('/assets/contactusbg.png')",
        backgroundSize:"cover",
        backgroundRepeat:"no-repeat",
        backgroundBlendMode:"lighten",
        backgroundPosition:"center"
      }}
    >
      <div
        className="relative w-full flex justify-center items-center"
        style={{ height: "470px" }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={phase === "hero" ? "visible" : "hidden"}
          className="absolute flex flex-col items-center px-4"
        >
          <h1 className="text-5xl font-bold text-white">Let's Connect</h1>
          <p className="max-w-2xl mt-4 text-lg mx-auto" style={{ color: "#dbeafe" }}>
            Have a question? We are here to help you.
          </p>
          <div
            className="w-28 h-1 rounded-full mt-6"
            style={{ backgroundColor: COLORS.ACCENT }}
          />
        </motion.div>

        <motion.div
          className="absolute w-full max-w-md left-1/2 -translate-x-1/2 p-8 rounded-2xl"
          style={glassBox}
          animate={{ opacity: phase === "form" ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="text-2xl font-bold text-center mb-4"
            style={{ color: COLORS.ACCENT }}
          >
            Sending Message...
          </h2>

          <div className="space-y-4">
            <input value={name} readOnly className="w-full border border-cyan-400/50 bg-[#041b4c]/50 text-white px-4 py-2 rounded-lg" />
            <input value={mail} readOnly className="w-full border border-cyan-400/50 bg-[#041b4c]/50 text-white px-4 py-2 rounded-lg" />
            <input value={phone} readOnly className="w-full border border-cyan-400/50 bg-[#041b4c]/50 text-white px-4 py-2 rounded-lg" />
            <textarea value={msg} readOnly className="w-full border border-cyan-400/50 bg-[#041b4c]/50 text-white px-4 py-2 rounded-lg h-24" />

            <button
              className="w-full py-2 rounded-lg text-white font-semibold"
              style={{ backgroundColor: COLORS.ACCENT }}
            >
              Auto Submitting…
            </button>
          </div>
        </motion.div>

        <motion.div
          className="absolute flex flex-col items-center"
          animate={{ opacity: phase === "success" ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl font-bold" style={{ color: "#00FF78" }}>
            ✓
          </div>
          <p className="text-white mt-4 text-xl font-semibold">Message Sent!</p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactHero;