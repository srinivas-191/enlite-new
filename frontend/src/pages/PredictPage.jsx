// src/pages/PredictPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import PredictHeroFull from "../components/PredictHeroFull";
import { apiGet, apiPost, setAuthToken } from "../lib/api";

/* -------------------------
   NOTE: This page uses the centralized api wrappers (apiGet/apiPost).
   Authorization header is set globally by src/lib/api.js when user logs in.
   ------------------------- */

const SECTION_ORDER = [
  "Building_Type",
  "Envelope",
  "HVAC",
  "Internal_Loads",
  "Geometry",
];

const envelopeFields = [
  "Roof_Insulation",
  "Door_Insulation",
  "Floor_Insulation",
  "Window_Insulation",
  "Wall_Insulation",
  "Window_To_Wall_Ratio",
];
const hvacFields = ["Hvac_Efficiency"];
const internalFields = [
  "Lighting_Density",
  "Occupancy_Level",
  "Equipment_Density",
  "Domestic_Hot_Water_Usage",
];
const geometryFields = ["Total_Building_Area"];

// Helper: format number to 2 decimals
const fmt2 = (n) => {
  if (n === null || n === undefined) return "";
  const num = Number(n);
  if (isNaN(num)) return "";
  return num.toFixed(2);
};

const getUnit = (key) => {
  switch (key) {
    case "Floor_Insulation":
    case "Door_Insulation":
    case "Roof_Insulation":
    case "Window_Insulation":
    case "Wall_Insulation":
      return "W/m²K";
    case "Window_To_Wall_Ratio":
      return "%";
    case "Hvac_Efficiency":
      return "COP";
    case "Domestic_Hot_Water_Usage":
      return "L/m²/day";
    case "Lighting_Density":
    case "Equipment_Density":
      return "W/m²";
    case "Occupancy_Level":
      return "Person";
    case "Total_Building_Area":
      return "m²";
    default:
      return "";
  }
};

export default function PredictPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [defaults, setDefaults] = useState(null);
  const [ranges, setRanges] = useState({});
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionEnded, setSessionEnded] = useState(false);
  const formRef = useRef(null);
  const [rangeError, setRangeError] = useState({});
  const [open, setOpen] = useState(false); // building type dropdown
  const STORAGE_KEY = "energyPredictState";

  // FREE-TRIAL / SUBSCRIPTION state
  const [remainingTrials, setRemainingTrials] = useState(null); // null = unknown, number = remaining, Infinity = unlimited
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Scroll to top on step change
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  // Load defaults + building types + persisted state + subscription/profile (trials)
  useEffect(() => {
    const persistedState = (() => {
      try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      } catch {
        return null;
      }
    })();

    if (persistedState) {
      if (persistedState.step > 0) {
        setStep(persistedState.step);
        setForm(persistedState.form || {});
        setResult(persistedState.result || null);
      }
    }

    // fetch defaults
    (async () => {
      try {
        const res = await apiGet("/defaults/");
        const def = res.defaults || {};
        setDefaults(def);
        setRanges(res.feature_ranges || {});
        if (!persistedState || persistedState.step === 0) {
          const initial = { ...def, Building_Type: def.Building_Type || "" };
          setForm(normalizeFormForEdit(initial));
        }
      } catch {
        const fallback = {
          Building_Type: "",
          Floor_Insulation: 0.15,
          Door_Insulation: 0.81,
          Roof_Insulation: 0.07,
          Window_Insulation: 0.73,
          Wall_Insulation: 0.1,
          Hvac_Efficiency: 0.3,
          Domestic_Hot_Water_Usage: 0.5,
          Lighting_Density: 1,
          Occupancy_Level: 1,
          Equipment_Density: 1,
          Window_To_Wall_Ratio: 0,
          Total_Building_Area: 85.91,
        };
        setDefaults(fallback);
        if (!persistedState || persistedState.step === 0) {
          setForm(normalizeFormForEdit(fallback));
        }
      }
    })();

    // fetch building types
    (async () => {
      try {
        const res = await apiGet("/building-types/");
        setBuildingTypes(res.building_types || []);
      } catch {
        setBuildingTypes([]);
      }
    })();

    // fetch subscription/profile if token exists
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setRemainingTrials(null);
        setIsAdmin(false);
        return;
      }

      // ensure auth header is set
      try {
        setAuthToken(token);
      } catch {}

      // Prefer the dedicated subscription endpoint if available
      try {
        const sres = await apiGet("/subscription/");
        if (sres && sres.subscription) {
          const sub = sres.subscription;
          const adminFlag = !!sub.is_admin; // may be undefined; fallback to profile below
          // set admin only if confirmed (some implementations don't return is_admin here)
          if (adminFlag) {
            setIsAdmin(true);
            setRemainingTrials(Infinity);
          } else {
            if (typeof sub.remaining_predictions === "number") {
              setIsAdmin(false);
              setRemainingTrials(sub.remaining_predictions);
              if (sub.remaining_predictions <= 0) setShowUpgradeModal(true);
            } else {
              // fallback to profile
              const p = await apiGet("/profile/");
              const total = Number(p.total_predictions || 0);
              const adminFromProfile = !!p.is_admin;
              setIsAdmin(adminFromProfile);
              if (adminFromProfile) setRemainingTrials(Infinity);
              else {
                const rem = Math.max(0, 10 - total);
                setRemainingTrials(rem);
                if (rem <= 0) setShowUpgradeModal(true);
              }
            }
          }
          return;
        }
      } catch {
        // ignore and fallback to profile
      }

      // fallback: profile to compute remaining (backwards-compatible)
      try {
        const p = await apiGet("/profile/");
        const total = Number(p.total_predictions || 0);
        const adminFlag = !!p.is_admin;
        setIsAdmin(adminFlag);
        if (adminFlag) {
          setRemainingTrials(Infinity);
        } else {
          const rem = Math.max(0, 10 - total);
          setRemainingTrials(rem);
          if (rem <= 0) setShowUpgradeModal(true);
        }
      } catch {
        setRemainingTrials(null);
        setIsAdmin(false);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist form state while session ongoing
  useEffect(() => {
    if (step > 0 && !loading) {
      const stateToPersist = { step, form, result };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
      } catch {}
    }
    if (step === 0) {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, [step, form, result, loading]);

  function normalizeFormForEdit(obj) {
    const res = {};
    Object.keys(obj || {}).forEach((k) => {
      const v = obj[k];
      if (v === null || v === undefined) res[k] = "";
      else if (typeof v === "number") res[k] = String(v);
      else res[k] = v;
    });
    return res;
  }

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumericChange = (key, rawValue) => {
    const val = rawValue;
    if (val === "") {
      setForm((prev) => ({ ...prev, [key]: "" }));
      return;
    }
    if (!/^[-]?\d*\.?\d*$/.test(val)) {
      return;
    }
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleBlurAndFormat = (key) => {
    const raw = form[key];
    if (
      raw === "" ||
      raw === null ||
      raw === undefined ||
      raw === "-" ||
      raw === "." ||
      raw === "-."
    ) {
      if (ranges && ranges[key]) {
        setForm((prev) => ({ ...prev, [key]: fmt2(ranges[key][0]) }));
      } else {
        setForm((prev) => ({ ...prev, [key]: "0.00" }));
      }
      return;
    }

    const num = Number(raw);
    if (isNaN(num)) {
      if (ranges && ranges[key])
        setForm((prev) => ({ ...prev, [key]: fmt2(ranges[key][0]) }));
      else setForm((prev) => ({ ...prev, [key]: "0.00" }));
      return;
    }

    if (ranges && ranges[key]) {
      const [min, max] = ranges[key];
      let clamped = num;
      if (num < min) {
        clamped = min;
        setRangeError((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => setRangeError((prev) => ({ ...prev, [key]: false })), 900);
      } else if (num > max) {
        clamped = max;
        setRangeError((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => setRangeError((prev) => ({ ...prev, [key]: false })), 900);
      }
      setForm((prev) => ({ ...prev, [key]: fmt2(clamped) }));
    } else {
      setForm((prev) => ({ ...prev, [key]: fmt2(num) }));
    }
  };

  const buildPredictPayload = () => {
    const payload = { ...form };
    Object.keys(payload).forEach((k) => {
      if (k === "Building_Type") return;
      const raw = payload[k];
      if (
        raw === "" ||
        raw === null ||
        raw === undefined ||
        raw === "-" ||
        raw === "." ||
        raw === "-."
      ) {
        payload[k] = ranges && ranges[k] ? ranges[k][0] : 0;
        return;
      }
      const num = Number(raw);
      if (isNaN(num)) {
        payload[k] = ranges && ranges[k] ? ranges[k][0] : 0;
        return;
      }
      if (ranges && ranges[k]) {
        const [min, max] = ranges[k];
        if (num < min) payload[k] = min;
        else if (num > max) payload[k] = max;
        else payload[k] = num;
      } else {
        payload[k] = num;
      }
    });
    return payload;
  };

  const handleDownload = () => {
    const element = document.getElementById("pdf-content");
    if (!element) return;
    const options = {
      margin: [8, 10, 8, 10],
      filename: "Energy_Prediction_Report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 3, logging: true, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(options).from(element).save();
  };

  // Start flow: check trial status and auth
  const startFlow = async () => {
    setError("");
    setResult(null);
    setSessionEnded(false);

    // Check login
    const token = localStorage.getItem("token");
    if (!token) {
      // Save redirect and go to login
      localStorage.setItem("postLoginRedirect", "/predict");
      navigate("/login");
      return;
    }

    // ensure auth header (api wrapper might already do this on login)
    try {
      setAuthToken(token);
    } catch {}

    // If remainingTrials unknown, fetch subscription/profile
    if (remainingTrials === null) {
      try {
        // Prefer subscription endpoint
        const sres = await apiGet("/subscription/");
        if (sres && sres.subscription) {
          const sub = sres.subscription;
          if (typeof sub.remaining_predictions === "number") {
            setIsAdmin(!!sub.is_admin);
            if (sub.is_admin) {
              setRemainingTrials(Infinity);
            } else {
              setRemainingTrials(sub.remaining_predictions);
              if (sub.remaining_predictions <= 0) {
                setShowUpgradeModal(true);
                return;
              }
            }
          } else {
            // fallback to profile
            const p = await apiGet("/profile/");
            const total = Number(p.total_predictions || 0);
            const adminFlag = !!p.is_admin;
            setIsAdmin(adminFlag);
            if (adminFlag) setRemainingTrials(Infinity);
            else {
              const rem = Math.max(0, 10 - total);
              setRemainingTrials(rem);
              if (rem <= 0) {
                setShowUpgradeModal(true);
                return;
              }
            }
          }
        } else {
          // fallback to profile
          const p = await apiGet("/profile/");
          const total = Number(p.total_predictions || 0);
          const adminFlag = !!p.is_admin;
          setIsAdmin(adminFlag);
          if (adminFlag) setRemainingTrials(Infinity);
          else {
            const rem = Math.max(0, 10 - total);
            setRemainingTrials(rem);
            if (rem <= 0) {
              setShowUpgradeModal(true);
              return;
            }
          }
        }
      } catch (err) {
        // if profile/subscription fetch fails (401 or network), redirect to login
        if (err?.response?.status === 401) {
          localStorage.setItem("postLoginRedirect", "/predict");
          navigate("/login");
          return;
        }
      }
    } else {
      // If trials already loaded and zero (and not admin) -> show modal
      if (!isAdmin && remainingTrials <= 0) {
        setShowUpgradeModal(true);
        return;
      }
    }

    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    setStep(1);

    // refresh building types in case server changed
    apiGet("/building-types/")
      .then((res) => setBuildingTypes(res.building_types || []))
      .catch(() => setBuildingTypes([]));
  };

  const goNext = () => {
    setError("");
    if (step === 1 && (!form.Building_Type || form.Building_Type === "")) {
      setError("Please select a Building Type before continuing.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 6));
  };

  const goBack = () => {
    setError("");
    if (step <= 1) return setStep(0);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const resetToDefaults = () => {
    if (defaults) setForm(normalizeFormForEdit({ ...defaults, Building_Type: "" }));
    else
      setForm(
        normalizeFormForEdit({
          Building_Type: "",
          Floor_Insulation: 0.15,
          Door_Insulation: 0.81,
          Roof_Insulation: 0.07,
          Window_Insulation: 0.73,
          Wall_Insulation: 0.1,
          Hvac_Efficiency: 0.3,
          Domestic_Hot_Water_Usage: 0.5,
          Lighting_Density: 1,
          Occupancy_Level: 1,
          Equipment_Density: 1,
          Window_To_Wall_Ratio: 0,
          Total_Building_Area: 85.91,
        })
      );
  };

  // Refresh trials by asking the subscription endpoint first, fallback to profile
  const refreshTrialsFromProfile = async () => {
    try {
      const sres = await apiGet("/subscription/");
      if (sres && sres.subscription) {
        const sub = sres.subscription;
        if (typeof sub.remaining_predictions === "number") {
          setIsAdmin(!!sub.is_admin);
          if (sub.is_admin) setRemainingTrials(Infinity);
          else {
            setRemainingTrials(sub.remaining_predictions);
            if (sub.remaining_predictions <= 0) setShowUpgradeModal(true);
          }
          return;
        }
      }
    } catch {
      // ignore and fallback
    }

    try {
      const p = await apiGet("/profile/");
      const total = Number(p.total_predictions || 0);
      const adminFlag = !!p.is_admin;
      setIsAdmin(adminFlag);
      if (adminFlag) {
        setRemainingTrials(Infinity);
      } else {
        const rem = Math.max(0, 10 - total);
        setRemainingTrials(rem);
        if (rem <= 0) setShowUpgradeModal(true);
      }
    } catch {
      // ignore
    }
  };

  const confirmAndPredict = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    // Check auth and trial status first
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("postLoginRedirect", "/predict");
      navigate("/login");
      setLoading(false);
      return;
    }

    // ensure auth header
    try {
      setAuthToken(token);
    } catch {}

    // If remainingTrials unknown or low, refresh
    if (remainingTrials === null || (!isAdmin && remainingTrials <= 1)) {
      await refreshTrialsFromProfile();
    }

    if (!isAdmin && remainingTrials !== Infinity && remainingTrials <= 0) {
      setShowUpgradeModal(true);
      setLoading(false);
      return;
    }

    try {
      // Format & clamp fields (onBlur already did most, but ensure)
      Object.keys(form).forEach((k) => {
        if (k === "Building_Type") return;
        const raw = form[k];
        if (
          raw === "" ||
          raw === null ||
          raw === undefined ||
          raw === "-" ||
          raw === "." ||
          raw === "-."
        ) {
          if (ranges && ranges[k]) setForm((prev) => ({ ...prev, [k]: fmt2(ranges[k][0]) }));
          else setForm((prev) => ({ ...prev, [k]: "0.00" }));
        } else {
          const num = Number(raw);
          if (isNaN(num)) {
            if (ranges && ranges[k]) setForm((prev) => ({ ...prev, [k]: fmt2(ranges[k][0]) }));
            else setForm((prev) => ({ ...prev, [k]: "0.00" }));
          } else {
            if (ranges && ranges[k]) {
              const [min, max] = ranges[k];
              const clamped = num < min ? min : num > max ? max : num;
              setForm((prev) => ({ ...prev, [k]: fmt2(clamped) }));
            } else {
              setForm((prev) => ({ ...prev, [k]: fmt2(num) }));
            }
          }
        }
      });

      // Build payload from current form state
      const payload = buildPredictPayload();

      // Use centralized apiPost (Authorization header handled in api.js)
      const resp = await apiPost("/predict/", payload);

      // update result and step
      setResult(resp);
      setStep(7);

      // If backend returned remaining field, use it (preferred)
      if (resp && typeof resp.remaining_predictions === "number") {
        setRemainingTrials(resp.remaining_predictions);
        const subscription = JSON.parse(localStorage.getItem("subscription"));
        if (subscription) {
        subscription.remaining_predictions = resp.remaining_predictions;
        localStorage.setItem("subscription", JSON.stringify(subscription));
      }
        if (resp.remaining_predictions <= 0) setShowUpgradeModal(true);
      } else {
        // otherwise, decrement locally and refresh from subscription/profile
        if (!isAdmin && remainingTrials !== null && remainingTrials !== Infinity) {
          setRemainingTrials((prev) => {
            const next = Math.max(0, (typeof prev === "number" ? prev : 10) - 1);
            if (next <= 0) setShowUpgradeModal(true);
            return next;
          });

           setTimeout(async () => {
          const sres = await apiGet("/subscription/");
          if (sres?.subscription) {
            localStorage.setItem("subscription", JSON.stringify(sres.subscription));
          }
        }, 1000);

          // refresh server-truth after small delay
          setTimeout(() => {
            refreshTrialsFromProfile();
          }, 1000);
        } else {
          // ensure we refresh to show correct server state
          setTimeout(() => {
            refreshTrialsFromProfile();
          }, 1200);
        }
      }
    } catch (err) {
      // handle unauthenticated
      if (err?.response?.status === 401) {
        alert("Session expired or not authenticated. Please log in.");
        localStorage.setItem("postLoginRedirect", "/predict");
        navigate("/login");
        setLoading(false);
        return;
      }

      console.error(err);
      setError(err?.response?.data?.error || "Prediction failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const onExit = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    try {
      window.location.href = "/solutions";
    } catch {
      window.location.href = "/";
    }
  };

  const onPredictAgainSame = () => {
    setStep(6);
  };

  const onPredictAgainDifferent = () => {
    resetToDefaults();
    setResult(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    setStep(1);
  };

  const fieldRow = (label, key, stepNum, type = "text", stepValue = "0.01") => {
    const value = form[key] !== undefined && form[key] !== null ? form[key] : "";
    const unit = getUnit(key);

    return (
      <div key={key} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <label className="font-medium w-1/3">
          {label}
          {unit && <span className="text-gray-500"> ({unit})</span>}
        </label>

        <div className="w-2/3">
          <input
            type={type}
            step={stepValue}
            value={value}
            className="border px-3 py-2 rounded w-full"
            onChange={(e) => handleNumericChange(key, e.target.value)}
            onBlur={() => handleBlurAndFormat(key)}
          />

          {ranges && ranges[key] && (
            <p
              className={`text-xs mt-1 transition-all duration-300 ${
                rangeError[key] ? "text-red-500 scale-110" : "text-gray-500 scale-100"
              }`}
            >
              Range: {ranges[key][0]} — {ranges[key][1]} {unit && unit}
            </p>
          )}
        </div>
      </div>
    );
  };

  const PrintableReport = () => {
    const hasRanges = Object.keys(ranges).length > 0;

    const pdfValueWithUnit = (k) => {
      const unit = getUnit(k);
      const raw = form[k];
      if (k === "Building_Type") return String(raw || "");
      if (raw === "" || raw === null || raw === undefined || raw === "-" || raw === "." || raw === "-.") {
        if (ranges && ranges[k]) return `${fmt2(ranges[k][0])}${unit ? " " + unit : ""}`;
        return `0.00${unit ? " " + unit : ""}`;
      }
      return `${String(raw)}${unit ? " " + unit : ""}`;
    };

    const pdfRangeWithUnit = (k) => {
      if (!ranges || !ranges[k]) return "—";
      const unit = getUnit(k);
      return `${ranges[k][0]} — ${ranges[k][1]}${unit ? " " + unit : ""}`;
    };

    return (
      <div id="pdf-content" className="p-2 bg-white border border-gray-300 rounded-lg shadow-xl w-full max-w-4xl mx-auto" style={{ fontSize: "11pt" }}>
        <h1 className="text-xl font-bold text-center text-blue-700 mb-4 pb-2" style={{ fontSize: "16pt" }}>
          Energy Prediction Report
        </h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2" style={{ fontSize: "14pt" }}>
            User Inputs (Prediction Parameters)
          </h2>

          <table className="w-full border-collapse text-xs" style={{ fontSize: "10pt" }}>
            <thead>
              <tr className="bg-gray-100">
                <th style={{ border: "1px solid #e5e7eb", padding: "5px 8px", textAlign: "center", verticalAlign: "middle" }}>Field</th>
                <th style={{ border: "1px solid #e5e7eb", padding: "5px 8px", textAlign: "center", verticalAlign: "middle" }}>Value</th>
                {hasRanges && (
                  <th style={{ border: "1px solid #e5e7eb", padding: "7px 8px", textAlign: "center", verticalAlign: "middle" }}>
                    Range
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {Object.keys(form).map((key, index) => {
                const displayLabel = key === "Domestic_Hot_Water_Usage" ? "Daily Hot Water Usage" : key.replace(/_/g, " ");
                return (
                  <tr
                    key={key}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                    }}
                  >
                    <td style={{ border: "1px solid #e5e7eb", padding: "7px 8px", textTransform: "capitalize", fontWeight: "500", verticalAlign: "middle", width: hasRanges ? "35%" : "50%" }}>
                      {displayLabel}
                      {getUnit(key) && <span> ({getUnit(key)})</span>}
                    </td>

                    <td style={{ border: "1px solid #e5e7eb", padding: "5px 8px", verticalAlign: "middle", textAlign: "center", width: hasRanges ? "30%" : "50%" }}>
                      <span>{pdfValueWithUnit(key)}</span>
                    </td>

                    {hasRanges && (
                      <td style={{ border: "1px solid #e5e7eb", padding: "5px 8px", color: "#6b7280", verticalAlign: "middle", textAlign: "center", width: "35%" }}>
                        {pdfRangeWithUnit(key)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {result && (
          <div className="mt-6 pt-4 border-t border-gray-300">
            <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2" style={{ fontSize: "14pt" }}>
              Prediction Results
            </h2>

            <div className="flex items-center gap-3 mb-3">
              <p className="font-bold text-sm">Performance Category:</p>
              <span style={{ fontWeight: "bold", paddingTop: "0px", paddingBottom: "10px", paddingLeft: "3px", paddingRight: "3px", borderRadius: "4px", display: "inline-block", fontSize: "10pt", textAlign: "center" }}>
                {result.performance_category}
              </span>
            </div>

            <div className="mt-3 space-y-3">
              <h3 className="font-semibold text-base text-gray-800 mb-2" style={{ fontSize: "12pt" }}>
                Energy Metrics
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "100px", fontWeight: "bold", fontSize: "10pt" }}>Total Energy:</span>
                  <div style={{ flexGrow: 1, backgroundColor: "#e0f2ff", height: "18px", borderRadius: "4px", overflow: "hidden", minWidth: "100px" }}>
                    <div style={{ height: "100%", width: `${Math.min((result.total_energy_month_kwh / 3000) * 100, 100)}%`, backgroundColor: "#1d4ed8" }} />
                  </div>
                  <span style={{ width: "80px", textAlign: "right", fontWeight: "bold", fontSize: "10pt" }}>{result.total_energy_month_kwh} kWh</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "100px", fontWeight: "bold", fontSize: "10pt" }}>Monthly EUI:</span>
                  <div style={{ flexGrow: 1, backgroundColor: "#e9f8e9", height: "18px", borderRadius: "4px", overflow: "hidden", minWidth: "100px" }}>
                    <div style={{ height: "100%", width: `${Math.min((result.eui_month_kwh_m2 / 50) * 100, 100)}%`, backgroundColor: "#15803d" }} />
                  </div>
                  <span style={{ width: "80px", textAlign: "right", fontWeight: "bold", fontSize: "10pt" }}>{result.eui_month_kwh_m2} kWh/m²</span>
                </div>
              </div>

              {/* NEW: Optimal Performance Metric (EUI after recommendations) */}
              {result.optimal_performance !== undefined && result.optimal_performance !== null && (
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "100px", fontWeight: "bold", fontSize: "10pt", color: "#10b981" }}>Optimal EUI:</span>
                    <div style={{ flexGrow: 1, backgroundColor: "#dcfce7", height: "18px", borderRadius: "4px", overflow: "hidden", minWidth: "100px" }}>
                      <div style={{ height: "100%", width: `${Math.min((result.optimal_performance / 50) * 100, 100)}%`, backgroundColor: "#10b981" }} />
                    </div>
                    <span style={{ width: "80px", textAlign: "right", fontWeight: "bold", fontSize: "10pt", color: "#10b981" }}>{fmt2(result.optimal_performance)} kWh/m²</span>
                  </div>
                </div>
              )}
              {/* END NEW BLOCK */}
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-base text-gray-700 mb-2" style={{ fontSize: "12pt" }}>Impacting Factors</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {result.impacting_factors?.length ? (
                  result.impacting_factors.map((f, i) => (
                    <li key={`${String(f)}-${i}`} style={{ display: "flex", alignItems: "center", marginBottom: "4px", fontSize: "10pt" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981", marginRight: "6px" }} />
                      {f}
                    </li>
                  ))
                ) : (
                  <li style={{ fontSize: "10pt" }}>No major issues found.</li>
                )}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold text-base text-gray-700 mb-2" style={{ fontSize: "12pt" }}>Recommendations</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {result.recommendations?.length ? (
                  result.recommendations.map((r, i) => (
                    <li key={`rec-${i}`} style={{ display: "flex", alignItems: "flex-start", marginBottom: "4px", fontSize: "10pt" }}>
                      <span style={{ color: "#3b82f6", fontSize: "1em", marginRight: "6px" }}>💡</span>
                      {r}
                    </li>
                  ))
                ) : (
                  <li style={{ fontSize: "10pt" }}>No improvements recommended.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-500 mt-6 pt-3 border-t" style={{ fontSize: "9pt" }}>
          Report Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
      </div>
    );
  };

  const SummaryCard = () => {
    const [editValues, setEditValues] = useState({});
    const [backupValues, setBackupValues] = useState({});

    const handleEdit = (key) => {
      setBackupValues((prev) => ({ ...prev, [key]: form[key] }));
      setEditValues((prev) => ({ ...prev, [key]: form[key] }));
    };

    const handleSave = (key) => {
      const proposed = editValues[key];
      if (key !== "Building_Type") {
        if (
          proposed === "" ||
          proposed === null ||
          proposed === undefined ||
          proposed === "-" ||
          proposed === "." ||
          proposed === "-."
        ) {
          if (ranges && ranges[key]) setForm((prev) => ({ ...prev, [key]: fmt2(ranges[key][0]) }));
          else setForm((prev) => ({ ...prev, [key]: "0.00" }));
        } else {
          const num = Number(proposed);
          if (isNaN(num)) {
            if (ranges && ranges[key]) setForm((prev) => ({ ...prev, [key]: fmt2(ranges[key][0]) }));
            else setForm((prev) => ({ ...prev, [key]: "0.00" }));
          } else {
            if (ranges && ranges[key]) {
              const [min, max] = ranges[key];
              if (num < min || num > max) {
                alert(`Value for ${key.replace(/_/g, " ")} must be between ${min} and ${max}.`);
                return;
              }
              setForm((prev) => ({ ...prev, [key]: fmt2(num < min ? min : num > max ? max : num) }));
            } else {
              setForm((prev) => ({ ...prev, [key]: fmt2(num) }));
            }
          }
        }
      } else {
        setForm((prev) => ({ ...prev, [key]: proposed }));
      }

      setEditValues((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
      setBackupValues((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    };

    const handleUndo = (key) => {
      setForm((prev) => ({ ...prev, [key]: backupValues[key] }));
      setEditValues((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
      setBackupValues((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Confirm values before predicting</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left" style={{ width: "40%" }}>Field</th>
                <th className="border px-3 py-2 text-left" style={{ width: "40%" }}>Value</th>
                <th className="border px-3 py-2 text-center" style={{ width: "20%" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {Object.keys(form).map((key) => {
                const unit = getUnit(key);
                const displayLabel = key === "Domestic_Hot_Water_Usage" ? "Daily Hot Water Usage" : key.replace(/_/g, " ");
                return (
                  <tr key={`summary-${key}`}>
                    <td className="border px-3 py-2 capitalize">
                      {displayLabel}
                      {unit && <span className="text-gray-500"> ({unit})</span>}
                    </td>

                    <td className="border px-3 py-2">
                      {editValues[key] !== undefined ? (
                        key === "Building_Type" ? (
                          <select
                            value={editValues[key]}
                            onChange={(e) => setEditValues((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="border px-2 py-1 rounded w-full"
                          >
                            <option value="">Select building type</option>
                            {buildingTypes.map((t) => (
                              <option key={`bt-${t}`} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div>
                            <input type="text" step="0.01" value={editValues[key]} onChange={(e) => setEditValues((prev) => ({ ...prev, [key]: e.target.value }))} className="border px-2 py-1 rounded w-full" />
                            {ranges && ranges[key] && <div className="text-xs text-gray-500 mt-1">Range: {ranges[key][0]} — {ranges[key][1]} {unit && unit}</div>}
                          </div>
                        )
                      ) : (
                        <span>{key === "Building_Type" ? String(form[key]) : `${String(form[key])}${unit ? " " + unit : ""}`}</span>
                      )}
                    </td>

                    <td className="border px-3 py-2 text-center">
                      {editValues[key] !== undefined ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleSave(key)} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                          <button onClick={() => handleUndo(key)} className="px-3 py-1 bg-yellow-500 text-white rounded">Undo</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(key)} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={goBack} className="px-4 py-2 border rounded">Back</button>
          <button onClick={confirmAndPredict} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Predicting..." : "Confirm & Predict"}
          </button>
        </div>
        {error && <div className="text-red-600 mt-3">{error}</div>}

        {/* Trial info */}
        <div className="mt-3 text-sm text-gray-600">
          {isAdmin ? (
            <div>Admin: unlimited predictions.</div>
          ) : remainingTrials === null ? (
            <div>Free trial remaining: checking...</div>
          ) : remainingTrials === Infinity ? (
            <div>Unlimited predictions.</div>
          ) : (
            <div>Free trial remaining: <strong>{remainingTrials}</strong></div>
          )}
        </div>
      </div>
    );
  };

  // ---- Upgrade modal component used when trials exhausted ----
  const UpgradeModal = ({ open, onClose }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-3">Free Trial Expired</h3>
          <p className="mb-4">You have used your free predictions. To continue using the prediction model, please upgrade to a paid plan.</p>

          <div className="flex gap-3">
            <button
              onClick={() => {
                onClose();
                window.location.href = "/pricing";
              }}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded"
            >
              View Pricing / Upgrade
            </button>

            <button
              onClick={() => {
                onClose();
              }}
              className="flex-1 border px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  // ------------------------------------------------------------

  return (
    <div ref={formRef} className="min-h-screen bg-[#fcf5ee] flex justify-center items-start px-4 pt-28 pb-10">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="w-full my-auto">
          <div className="bg-blue-50 p-6 rounded-lg shadow w-full">
            <h1 className="text-2xl font-bold mb-4 text-center">Energy Efficiency — Predict</h1>

            {step === 0 && (
              <div className="text-center">
                <p className="mb-6">Click Start to start entering building information (defaults prefilled).</p>
                <button onClick={startFlow} className="bg-blue-600 text-white px-6 py-3 rounded">Start</button>
                {/* show small hint about trials */}
                <div className="text-sm text-gray-600 mt-3">
                  {isAdmin ? (
                    <span>Admin: unlimited predictions.</span>
                  ) : remainingTrials === null ? (
                    <span>Free trial: predictions (login to track usage).</span>
                  ) : remainingTrials === Infinity ? (
                    <span>Unlimited predictions.</span>
                  ) : (
                    <span>Free predictions remaining: <strong>{remainingTrials}</strong></span>
                  )}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 dropdown-wrapper">
                <label className="block font-semibold">Building Type</label>
                <div className="relative">
                  <button type="button" onClick={() => setOpen((o) => !o)} className="w-full p-2 border rounded flex justify-between items-center">
                    {form.Building_Type || "Select building type"}
                    <span>▼</span>
                  </button>
                  {open && (
                    <div className="mt-1 border rounded shadow bg-white max-h-40 overflow-y-auto z-50 relative">
                      {buildingTypes.map((t) => (
                        <div
                          key={`bt-item-${t}`}
                          onClick={() => {
                            setField("Building_Type", t);
                            setOpen(false);
                            setError("");
                          }}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-3">
                  <button type="button" onClick={() => setStep(0)} className="px-4 py-2 rounded border">Cancel</button>
                  <button type="button" onClick={goNext} className="bg-green-600 text-white px-4 py-2 rounded">Next</button>
                </div>
                {error && <div className="text-red-600">{error}</div>}
              </div>
            )}

            {step === 2 && (
              <form className="bg-white/70 backdrop-blur p-8 rounded-2xl shadow-lg mt-6 mb-6 border border-gray-200 animate-fadeIn">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Envelope Properties</h3>
                <div className="space-y-5">{envelopeFields.map((f) => fieldRow(f.replace(/_/g, " "), f, 2, "text", "0.01"))}</div>
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={goBack} className="px-5 py-2 rounded-lg border hover:bg-gray-100 transition">Back</button>
                  <button type="button" onClick={goNext} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition shadow-sm">Next</button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Heat, Ventilation & AC</h3>
                {hvacFields.map((f) => fieldRow(f.replace(/_/g, " "), f, 3, "text", "0.01"))}
                <div className="flex gap-3 mt-4">
                  <button onClick={goBack} className="px-4 py-2 rounded border">Back</button>
                  <button onClick={goNext} className="bg-green-600 text-white px-4 py-2 rounded">Next</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Internal Loads</h3>
                {internalFields.map((f) => {
                  let label = f.replace(/_/g, " ");
                  if (f === "Domestic_Hot_Water_Usage") label = "Daily Hot Water Usage";
                  return fieldRow(label, f, 4, "text", "0.01");
                })}
                <div className="flex gap-3 mt-4">
                  <button onClick={goBack} className="px-4 py-2 rounded border">Back</button>
                  <button onClick={goNext} className="bg-green-600 text-white px-4 py-2 rounded">Next</button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Building Geometry</h3>
                {geometryFields.map((f) => fieldRow(f.replace(/_/g, " "), f, 5, "text", "0.01"))}
                <div className="flex gap-3 mt-4">
                  <button onClick={goBack} className="px-4 py-2 rounded border">Back</button>
                  <button onClick={() => setStep(6)} className="bg-blue-600 text-white px-4 py-2 rounded">Review & Confirm</button>
                </div>
              </div>
            )}

            {step === 6 && <SummaryCard />}

            {step === 7 && result && (
              <div className="mt-6 p-6 bg-white rounded-lg shadow space-y-6">
                <div style={{ position: "absolute", left: "-9999px", top: "0", width: "100%", height: "100%" }}>
                  <PrintableReport />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  Results
                  <span>{result.performance_category === "Excellent" && "🌟"}{result.performance_category === "Moderate" && "⚡"}{result.performance_category === "Poor" && "🔥"}</span>
                </h2>

                <div className="flex items-center gap-3 mt-2">
                  <p className={`font-bold px-3 py-1 rounded inline-block ${result.performance_category === "Excellent" ? "bg-green-100 text-green-800" : result.performance_category === "Moderate" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                    {result.performance_category}
                  </p>
                  <img src={result.performance_category === "Excellent" ? "/assets/excellent.gif" : result.performance_category === "Moderate" ? "/assets/moderate.gif" : "/assets/poor.gif"} alt="Performance Icon" className="w-20 h-30" />
                </div>

                {/* energy metrics, factors, recommendations rendered identically to earlier PrintableReport but inline */}
                <div className="mt-4 space-y-3">
                  <h3 className="font-semibold text-gray-700">Energy Metrics</h3>
                  {["Total Energy", "Monthly EUI"].map((label, idx) => {
                    const value = label === "Total Energy" ? result.total_energy_month_kwh : result.eui_month_kwh_m2;
                    const max = label === "Total Energy" ? 3000 : 50;
                    const colorConfig = label === "Total Energy" ? { bg: "#bfdbfe", progress: "#2563eb" } : { bg: "#dcfce7", progress: "#16a34a" };
                    return (
                      <div key={`metric-${idx}`} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <span className="w-32">{label}:</span>
                        <div className="h-4 rounded flex-1 overflow-hidden" style={{ backgroundColor: colorConfig.bg }}>
                          <div className="h-4 rounded transition-all duration-500" style={{ width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: colorConfig.progress }} />
                        </div>
                        <span>{value}{label === "Total Energy" ? " kWh" : " kWh/m²"}</span>
                      </div>
                    );
                  })}

                  {/* NEW: Optimal Performance Metric (EUI after recommendations) */}
                  {result.optimal_performance !== undefined && result.optimal_performance !== null && (
                      <div key={`metric-optimal`} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <span className="w-32 text-green-700 font-semibold">Optimal EUI:</span>
                        <div className="h-4 rounded flex-1 overflow-hidden" style={{ backgroundColor: "#dcfce7" }}>
                          <div className="h-4 rounded transition-all duration-500" style={{ width: `${Math.min((result.optimal_performance / 50) * 100, 100)}%`, backgroundColor: "#10b981" }} />
                        </div>
                        <span className="text-green-700 font-semibold">{fmt2(result.optimal_performance)} kWh/m²</span>
                      </div>
                  )}
                  {/* END NEW BLOCK */}

                </div>

                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Impacting Factors</h3>
                  <div className="flex flex-wrap gap-3">
                    {result.impacting_factors?.length ? (
                      result.impacting_factors.map((f, i) => (
                        <div key={`imp-${i}`} className="flex items-center gap-2 p-2 border rounded hover:shadow-lg transition cursor-pointer">
                          <span className={`w-3 h-3 rounded-full ${f.toLowerCase().includes("high") ? "bg-red-500" : f.toLowerCase().includes("medium") ? "bg-yellow-400" : "bg-green-500"}`} />
                          <span>{f}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-green-700">No major issues found — building appears efficient.</div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Recommendations</h3>
                  <div className="flex flex-wrap gap-3">
                    {result.recommendations?.length ? (
                      result.recommendations.map((r, i) => (
                        <div key={`rec-inline-${i}`} className="flex items-center gap-2 p-2 border rounded hover:bg-blue-50 transition cursor-pointer">
                          <span className="text-blue-500">💡</span>
                          <span>{r}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-green-700">No improvements recommended. Excellent performance.</div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={handleDownload} className="px-4 py-2 border rounded bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1">⬇️ Download Report (PDF)</button>
                  <button onClick={onPredictAgainSame} className="px-4 py-2 border rounded bg-green-200 hover:bg-gray-100 transition flex items-center gap-1">🔄 Predict Again (Same)</button>
                  <button onClick={onPredictAgainDifferent} className="px-4 py-2 border rounded hover:bg-gray-100 transition flex items-center gap-1">🔄 New</button>
                  <button onClick={onExit} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-1">❌ Exit</button>
                </div>
              </div>
            )}

            {sessionEnded && <div className="mt-4 text-gray-600">Session ended.</div>}
          </div>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full">
            <PredictHeroFull />
          </div>
        </div>
      </div>

      {/* Upgrade modal when trials exhausted */}
      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}