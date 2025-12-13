import React, { useEffect } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Twitter,
  Facebook,
  Youtube,
  Linkedin,
} from "lucide-react";
import { Link } from "react-router-dom";
import AOS from "aos";

const Footer = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <footer className="bg-[#0b365f] text-white py-14 border-t shadow-inner">
  <div
    className="
      max-w-7xl mx-auto px-6 
      grid grid-cols-1 sm:grid-cols-2 
      lg:flex lg:justify-between lg:items-start
      gap-12
    "
    data-aos="flip-up"
  >
    {/* BRAND INFO */}
    <div className="max-w-xs">
      <div className="flex items-center mb-4">
        <img src="/assets/ELogo.png" alt="Energy Logo" className="w-8 h-8 mx-2" />
        <span className="text-white text-2xl font-bold">Enlite</span>
      </div>

      <p className="text-gray-200 text-base leading-relaxed text-justify">
        “Empowering smart buildings with intelligent energy prediction for a
        sustainable future. Predict today, save tomorrow — building a greener
        world through data.”
      </p>
    </div>

    {/* QUICK LINKS */}
    <div className="max-w-xs">
      <h4 className="text-white text-2xl font-bold mb-4">QUICK LINKS</h4>
      <ul className="space-y-3">
        {["Home", "About", "Contact", "Solutions"].map((link) => (
          <li key={link}>
            <Link
              to={`/${link.toLowerCase()}`}
              className="hover:text-blue-200 flex items-center gap-2 transition no-underline text-gray-200 text-base"
            >
              <span className="text-blue-200">›</span> {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>

    {/* ADDRESS */}
    <div className="max-w-xs">
      <h4 className="text-white text-2xl font-bold mb-4">ADDRESS</h4>

      <p className="flex items-center gap-2 mb-2 text-gray-200 text-base">
        <MapPin size={20} className="text-blue-200" />
        <span>KPHB Metro, Social Prachar, Hyderabad</span>
      </p>

      <p className="flex items-center gap-2 mb-2 text-gray-200 text-base">
        <Phone size={20} className="text-blue-200" />
        <span>+012 345 67890</span>
      </p>

      <p className="flex items-center gap-2 mb-6 text-gray-200 text-base">
        <Mail size={20} className="text-blue-200" />
        <span>info@example.com</span>
      </p>

      <div className="flex gap-3">
        {[Twitter, Facebook, Youtube, Linkedin].map((Icon, idx) => (
          <span
            key={idx}
            className="border border-blue-300 p-3 rounded-full hover:bg-blue-400 hover:text-white transition shadow-sm"
          >
            <Icon size={20} />
          </span>
        ))}
      </div>
    </div>
  </div>

  <div className="mt-12 border-t border-blue-300 pt-6 text-center text-gray-200 text-base">
    © {new Date().getFullYear()} Enlite — Designed for a Sustainable Future
  </div>
</footer>

  );
};

export default Footer;