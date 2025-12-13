import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

/* =========================================
   PART 1: PARTICLES (Unchanged)
   ========================================= */

const HeatParticle = () => (
  <motion.div
    initial={{ opacity: 0, y: 0, scale: 0.5 }}
    animate={{ opacity: [0, 0.8, 0], y: -80, x: Math.random() * 40 - 20, scale: 1.2 }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: Math.random() * 2 }}
    className="absolute w-3 h-3 bg-red-400 rounded-full blur-[2px]"
    style={{ left: '50%', top: 0 }}
  />
);

const BubbleParticle = () => {
  const size = 6 + Math.random() * 10;
  const randomX = Math.random() * 30 - 15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.6 }}
      animate={{ 
        opacity: [0, 0.7, 0], 
        y: -100 - Math.random() * 40,
        scale: [0.6, 1.1, 1.3],
        x: [0, randomX, -randomX/2]
      }}
      transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 1.5 }}
      className="absolute rounded-full bg-teal-300/30 border border-teal-100/40 shadow-sm backdrop-blur-[1px]"
      style={{ 
        left: `${30 + Math.random() * 40}%`,
        top: '60%', 
        width: `${size}px`, 
        height: `${size}px` 
      }}
    />
  );
};

/* =========================================
   PART 2: HOLOGRAPHIC GAUGE HUD (Unchanged)
   ========================================= */
const HolographicHUD = ({ percentage, energy, isEfficient, scale = 1 }) => {
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5, y: 10 }}
      animate={{ opacity: 1, scale: scale, y: 0 }}
      className="flex flex-row items-center justify-center gap-2 mb-2 z-50 pointer-events-none origin-bottom"
    >
      
      {/* 1. Main Gauge Box */}
      <div className="relative w-24 h-24 flex items-center justify-center 
           bg-white/10 backdrop-blur-md rounded-full shadow-[0_4px_16px_0_rgba(31,38,135,0.37)] 
           border border-white/20">
       
       {/* Center Number */}
       <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.div 
         key={percentage} 
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className={`text-3xl font-black ${isEfficient ? 'text-green-400' : 'text-red-400'} drop-shadow-sm`}
        >
         {percentage}
         <span className="text-sm align-top ml-0.5 text-white/80">%</span>
        </motion.div>
       </div>
       
       {/* Status Pill */}
       <motion.div 
        className={`absolute -bottom-2 px-2 py-0.5 rounded-full text-[8px] font-bold text-white shadow-lg ${isEfficient ? 'bg-green-500' : 'bg-red-500'}`}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.5 }}
       >
        {isEfficient ? 'OPTIMIZED' : 'LEAK'}
       </motion.div>
      </div>
     
      {/* 2. Energy Card */}
      <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-md shadow-lg border border-white/50 min-w-[60px] text-center">
       <div className="flex items-center justify-center gap-1 text-gray-500 text-[8px] font-bold uppercase">
        <Zap className="w-3 h-3" /> Energy
       </div>
       <div className="text-xs font-bold text-gray-800 leading-tight">
        {energy} <span className="text-[8px] font-normal text-gray-500">kW</span>
       </div>
      </div>
     
    </motion.div>
  );
};


/* =========================================
   PART 3: BUILDINGS (Unchanged)
   ========================================= */
const AnimatedBuilding = ({ isEfficient, isScanning, stats, hudScale = 1, className = "", zIndex="z-10" }) => {
  const roofColorVariant = isEfficient ? '#3b82f6' : '#ef4444';
  const windowGlowOpacity = isEfficient ? 0.1 : 0.7;

  return (
    <motion.div 
      className={`flex flex-col items-center justify-end ${className} ${zIndex}`}
      animate={{ scale: isScanning ? 0.98 : 1 }}
      transition={{ duration: 0.5 }}
    >
      
      {/* --- 1. HUD --- */}
      <HolographicHUD 
        percentage={stats.pct} 
        energy={stats.energy} 
        isEfficient={isEfficient} 
        scale={hudScale}
      />

      {/* --- 2. BUILDING VISUALS --- */}
      <div className="relative w-full">
        <div className="absolute inset-0 pointer-events-none">
           <AnimatePresence>
            {!isEfficient && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="absolute inset-0 z-0"
              >
                {Array.from({ length: 5 }).map((_, i) => <HeatParticle key={i} />)}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isEfficient && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="absolute inset-0 z-20"
              >
                {Array.from({ length: 5 }).map((_, i) => <BubbleParticle key={i} />)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SVG */}
        <div className="relative z-10 w-full drop-shadow-2xl">
          <svg viewBox="0 0 200 220" className="w-full h-auto block" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="windowGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
            </defs>
            <rect x="20" y="60" width="160" height="140" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" rx="4" />
            <rect x="20" y="130" width="160" height="70" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="2" rx="4" />
            <rect x="85" y="160" width="30" height="40" fill="#374151" rx="2" />
            <line x1="100" y1="160" x2="100" y2="200" stroke="#4b5563" strokeWidth="2" />
            <g className="windows-top">
              <rect x="35" y="80" width="50" height="35" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="2" rx="2"/>
              <motion.rect x="35" y="80" width="50" height="35" fill="#fef08a" rx="2" filter="url(#windowGlow)"
                animate={{ opacity: windowGlowOpacity }} />
              <rect x="115" y="80" width="50" height="35" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="2" rx="2"/>
              <motion.rect x="115" y="80" width="50" height="35" fill="#fef08a" rx="2" filter="url(#windowGlow)"
                animate={{ opacity: windowGlowOpacity }} />
            </g>
            <g className="windows-bottom">
              <rect x="35" y="165" width="30" height="25" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="2" rx="2"/>
              <motion.rect x="35" y="165" width="30" height="25" fill="#fef08a" rx="2" filter="url(#windowGlow)"
                animate={{ opacity: windowGlowOpacity }} />
              <rect x="135" y="165" width="30" height="25" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="2" rx="2"/>
              <motion.rect x="135" y="165" width="30" height="25" fill="#fef08a" rx="2" filter="url(#windowGlow)"
                animate={{ opacity: windowGlowOpacity }} />
            </g>
            <rect x="15" y="125" width="170" height="8" fill="#9ca3af" rx="1" />
            <motion.path 
              d="M 10 60 L 190 60 L 190 20 L 10 40 Z" 
              fill={roofColorVariant}
              stroke={isEfficient ? '#2563eb' : '#dc2626'}
              strokeWidth="2"
              animate={{ fill: roofColorVariant, stroke: isEfficient ? '#2563eb' : '#dc2626' }}
              transition={{ duration: 1 }}
              className="drop-shadow-md"
            />
            <rect x="130" y="10" width="30" height="15" fill="#6b7280" rx="1"/>
            <rect x="135" y="15" width="20" height="3" fill="#374151" rx="0.5"/>
            <rect x="135" y="20" width="20" height="3" fill="#374151" rx="0.5"/>
          </svg>
        </div>
      </div>

    </motion.div>
  );
};


/* =========================================
   PART 4: MAIN COMPONENT
   ========================================= */

const DynamicHero = () => {
  // --- STATE ---
  const [isEfficient, setIsEfficient] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const heroRef = useRef(null);
  const [t, setT] = useState(0.25);

  // --- DATA ---
  const getStats = (buildingId) => {
    if (isEfficient) {
      switch(buildingId) {
        case 1: return { pct: 88, energy: 95 };
        case 2: return { pct: 94, energy: 210 };
        case 3: return { pct: 91, energy: 110 };
        default: return { pct: 90, energy: 100 };
      }
    } else {
      switch(buildingId) {
        case 1: return { pct: 35, energy: 350 };
        case 2: return { pct: 42, energy: 850 };
        case 3: return { pct: 51, energy: 410 };
        default: return { pct: 40, energy: 500 };
      }
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    const cycle = setInterval(() => {
      setIsScanning(true);
      setTimeout(() => {
        setIsEfficient(prev => !prev);
      }, 1000);
      setTimeout(() => {
        setIsScanning(false);
      }, 2000);
    }, 6000);
    return () => clearInterval(cycle);
  }, []);

  useEffect(() => {
    let current = t;
    const cycle = 14000;
    let raf;
    const frame = () => {
      current += 16 / cycle;
      if (current >= 1) current = 0;
      setT(current);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [t]);

  const isDay = t < 0.5;
  const defaultTextColor = isDay ? "text-gray-900" : "text-white";
  const secondaryTextColor = isDay ? "text-gray-700" : "text-gray-300";

  const getSky = () => {
    if (t < 0.25) return "linear-gradient(to bottom,#9fd9ff,#d7efff)";
    if (t < 0.5) return "linear-gradient(to bottom,#6bb5ff,#ffd397)";
    if (t < 0.75) return "linear-gradient(to bottom,#1b1d3a,#0a0f1a)";
    return "linear-gradient(to bottom,#081229,#2d456d)";
  };

  return (
    <section 
      ref={heroRef}
      className="relative w-full flex flex-col justify-center overflow-hidden font-sans min-h-[85vh] pt-40 lg:pt-32 pb-0"
      style={{
        background: getSky(),
        transition: "background 1s linear",
      }}
    >
      
      {/* --- GREEN LAND BASE --- */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "180px", 
          background: "radial-gradient(circle at center top, #6fcf73, #4b8f4d)",
          borderTopLeftRadius: "50%",
          borderTopRightRadius: "50%",
          transform: "scaleX(1.4)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      
      {/* Grid */}
      <div className="container mx-auto px-6 relative z-10 flex-grow grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-end lg:items-center pb-20">
        
        {/* --- LEFT: TEXT CONTENT --- */}
        {/* lg:mb-52: HUGE bottom margin to force text way up into the sky on desktop */}
        {/* lg:max-w-lg: Constrains width so it doesn't cross center line */}
        <div className="text-center lg:text-left relative z-30 self-center mb-24 lg:mb-52 mt-10 lg:mt-0 lg:max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto lg:mx-0"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className={`${defaultTextColor} transition-colors duration-1000`}>
                Smarter
              </span>
              <br />
              <span className={`${defaultTextColor} transition-colors duration-1000`}>
                Sustainable
              </span>
              <br />
              <span className={`${defaultTextColor} transition-colors duration-1000`}>Energy Future</span>
            </motion.h1>

            <motion.p
              className={`text-xl md:text-2xl ${secondaryTextColor} transition-colors duration-1000 mb-8 leading-relaxed`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              We combine AI and data analytics to predict and optimize energy resources across homes and industries.
            </motion.p>
          </motion.div>
        </div>

        {/* --- RIGHT: ANIMATED BUILDINGS CONTAINER --- */}
        <div className="relative w-full flex items-end justify-center lg:justify-end mt-auto pb-0">
          
          <div className="flex items-end justify-center relative z-10 gap-4 lg:gap-8">
            
            {/* Left Small Building: Hidden on mobile */}
            <AnimatedBuilding 
              isEfficient={isEfficient} 
              isScanning={isScanning}
              stats={getStats(1)}
              hudScale={0.8}
              zIndex="z-20"
              className="hidden md:flex w-[140px] h-[140px] md:w-[180px] md:h-[180px] opacity-90 mb-4"
            />

            {/* Main Center Building */}
            <AnimatedBuilding 
              isEfficient={isEfficient} 
              isScanning={isScanning}
              stats={getStats(2)}
              hudScale={1}
              zIndex="z-30"
              className="flex w-[260px] h-[260px] md:w-[320px] md:h-[320px] drop-shadow-2xl"
              showLabel={true}
            />

            {/* Right Small Building: Hidden on mobile */}
            <AnimatedBuilding 
              isEfficient={isEfficient} 
              isScanning={isScanning}
              stats={getStats(3)}
              hudScale={0.8}
              zIndex="z-20"
              className="hidden md:flex w-[140px] h-[140px] md:w-[180px] md:h-[180px] opacity-90 mb-4"
            />
          </div>

        </div>

      </div>
    </section>
  );
};

export default DynamicHero;