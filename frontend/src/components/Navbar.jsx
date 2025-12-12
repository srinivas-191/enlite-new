// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import AOS from "aos";
import { clearAuthToken } from "../lib/api";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [logged, setLogged] = useState(!!localStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("isAdmin") === "true"
  );
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const navigate = useNavigate();
  const [hasNewNotification, setHasNewNotification] = useState(
    !!localStorage.getItem("manualRequestStatus") && 
    !localStorage.getItem(`dismissed_${JSON.parse(localStorage.getItem("manualRequestStatus") || "{}").id}`)
  );
  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    const onAuthChange = () => {
      // ... existing setLogged/setIsAdmin/setUsername ...
      // NEW: Update notification status on auth/storage change
      const status = localStorage.getItem("manualRequestStatus");
      const dismissed = status ? localStorage.getItem(`dismissed_${JSON.parse(status).id}`) : true;
      setHasNewNotification(!!status && !dismissed);
    };

    window.addEventListener("authChange", onAuthChange);
    window.addEventListener("storage", onAuthChange);

    return () => {
      window.removeEventListener("authChange", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, []);

  function logout() {
    try {
      clearAuthToken();
      sessionStorage.clear();
    } catch (e) {}

    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  }

  return (
    <nav
      className="bg-white text-black shadow-sm border-b border-gray-300 fixed w-full top-0 z-50"
      data-aos="fade-down"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* LOGO */}
        <NavLink
          to="/"
          className="flex items-center space-x-2 text-2xl no-underline font-extrabold tracking-wider"
        >
          <img
            src="/assets/ELogo.png"
            alt="logo"
            className="w-9 h-9 rounded-full border border-gray-300 shadow-sm"
          />
          Enlite
        </NavLink>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex space-x-5 text-lg font-medium mx-auto">

          <NavLink
            to="/home"
            className={({ isActive }) =>
              `p-2 px-3 relative transition no-underline 
              ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"} 
              after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
              after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `p-2 px-3 relative transition no-underline 
              ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"} 
              after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
              after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all`
            }
          >
            About
          </NavLink>

          <NavLink
            to="/solutions"
            className={({ isActive }) =>
              `p-2 px-3 relative transition no-underline 
              ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"} 
              after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
              after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all`
            }
          >
            Our AI
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `p-2 px-3 relative transition no-underline 
              ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"} 
              after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
              after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all`
            }
          >
            Contact
          </NavLink>

          {/* ⭐ PRICING PAGE — NEWLY ADDED */}
          {logged && !isAdmin && (
            <NavLink
            to="/pricing"
            className={({ isActive }) =>
              `p-2 px-3 relative transition no-underline 
              ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"} 
              after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
              after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all`
            }
          >
            Pricing
          </NavLink>
          )}
          

          {/* USER DROPDOWN */}
          {logged && !isAdmin && (
            <div className="relative group">
              <button className="p-2 px-3 rounded inline-flex items-center gap-2">
                {username || "Account"} ▾
                {/* NEW: Notification Badge */}
                {hasNewNotification && (
                  <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <div className="absolute left-0 right-0 bg-white border rounded shadow-lg hidden group-hover:block z-40 min-w-[150px]">
                <button
                  onClick={() => navigate("/profile")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                  {/* Badge inside dropdown too */}
                  {hasNewNotification && (
                      <span className="inline-block h-2 w-2 bg-red-500 rounded-full ml-2"></span>
                  )}
                </button>

                <button
                  onClick={() => navigate("/history")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  History
                </button>
              </div>
            </div>
          )}

          {/* ADMIN BUTTON */}
          {logged && isAdmin && (
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) =>
                `p-2 px-3 relative transition no-underline 
                ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"} 
                after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
                after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all`
              }
            >
              Admin
            </NavLink>
          )}


        </ul>

        {/* AUTH BUTTONS DESKTOP */}
        <div className="hidden md:flex gap-4">
          {!logged ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sia-blue"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-sia-blue text-white px-4 py-2 rounded"
              >
                Sign Up
              </button>
            </>
          ) : (
            <button
              onClick={logout}
              className="bg-red-600 text-white ms-md-3 px-4 py-2 rounded"
            >
              Logout
            </button>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-black focus:outline-none"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <ul className="flex flex-col space-y-4 py-4 px-6 text-lg font-medium">

            <li>
              <NavLink
                to="/home"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `inline-block p-2 px-3 relative transition no-underline 
                  ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"} 
                  after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
                  after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all`
                }
              >
                Home
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/about"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `inline-block p-2 px-3 relative transition no-underline 
                  ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"} 
                  after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
                  after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all`
                }
              >
                About
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/solutions"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `inline-block p-2 px-3 relative transition no-underline 
                  ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"} 
                  after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
                  after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all`
                }
              >
                Our AI
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/contact"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `inline-block p-2 px-3 relative transition no-underline 
                  ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"} 
                  after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
                  after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all`
                }
              >
                Contact
              </NavLink>
            </li>

            {/* ⭐ PRICING FOR MOBILE (already included but cleaned) */}
            {logged && !isAdmin && (
            <li>
              <NavLink
                to="/pricing"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `inline-block p-2 px-3 relative transition no-underline 
                  ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"} 
                  after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
                  after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all`
                }
              >
                Pricing
              </NavLink>
            </li>
            )}

            {logged && isAdmin && (
            <li>
              <NavLink
                to="/admin-dashboard"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `inline-block p-2 px-3 relative transition no-underline 
                  ${isActive ? "bg-sia-blue text-white rounded-md" : "text-black"} 
                  after:absolute after:left-0 after:-bottom-1 after:h-[2px] 
                  after:w-0 after:bg-sia-blue hover:after:w-full after:transition-all`
                }
              >
                Admin
              </NavLink>
            </li>
            )}

            

            {/* AUTH / USER OPTIONS */}
            {!logged ? (
              <>
                <li>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/login");
                    }}
                    className="w-full p-3 text-left"
                  >
                    Login
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/register");
                    }}
                    className="w-full p-3 text-left"
                  >
                    Sign Up
                  </button>
                </li>
              </>
            ) : (
              <>
                {!isAdmin && (
                  <>
                    <li>
                      <button
                        onClick={() => {
                          setOpen(false);
                          navigate("/profile");
                        }}
                        className="w-full p-3 text-left flex items-center justify-between" // Added flex for badge
                      >
                        Profile
                        {/* Badge for mobile */}
                        {hasNewNotification && (
                            <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                    </li>

                    <li>
                      <button
                        onClick={() => {
                          setOpen(false);
                          navigate("/history");
                        }}
                        className="w-full p-3 text-left"
                      >
                        History
                      </button>
                    </li>
                  </>
                )}

                {/* {isAdmin && (
                  <li>
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate("/admin-dashboard");
                      }}
                      className="w-full p-3 text-left"
                    >
                      Admin Dashboard
                    </button>
                  </li>
                )} */}
          

                <li>
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="px-3 py-2 text-left bg-red-600 text-white rounded"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
