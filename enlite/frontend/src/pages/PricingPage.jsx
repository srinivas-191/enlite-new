// src/pages/PricingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Zap, TrendingUp, Crown } from "lucide-react";

const pricingTiers = [
  {
    name: "Basic",
    predictions: "100",
    price: "₹75",
    description: "Ideal for individual projects and occasional use.",
    features: [
      "Up to 50 predictions ",
      "Standard API access",
      "Prediction history storage",
      "Email support",
    ],
    color: "bg-green-500",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    name: "Super",
    predictions:"300",
    price: "₹175",
    description: "Great for small teams and frequent analysis needs.",
    features: [
      "Up to 300 predictions",
      "Priority API processing",
      "Full input data storage",
      "Priority email support",
    ],
    color: "bg-blue-600",
    icon: <TrendingUp className="w-6 h-6" />,
    popular: true,
  },
  {
    name: "Premium",
    predictions: "500",
    price: "₹300",
    description: "The ultimate plan for large-scale energy modeling and research.",
    features: [
      "Up to 500 predictions",
      "Dedicated high-speed API",
      "Custom reporting features",
      "24/7 dedicated support",
    ],
    color: "bg-purple-600",
    icon: <Crown className="w-6 h-6" />,
  },
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto mt-24 p-6">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-extrabold text-gray-900">
          Transparent Pricing for <span className="text-sia-blue">Energy Insights</span>
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Start with <strong>10 free predictions</strong>. Choose a plan to unlock powerful, continuous analysis.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {pricingTiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col p-8 rounded-xl shadow-2xl transition duration-300 ease-in-out hover:scale-[1.02] ${
              tier.popular ? "bg-blue-50" : "border border-gray-200 bg-blue-50"
            }`}
          >
            {/* {tier.popular && (
              <span className="mb-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold leading-5 bg-sia-blue text-white">
                Most Popular
              </span>
            )} */}

            <div className="flex items-center gap-3">
              <span className={`p-2 rounded-full text-white ${tier.color}`}>{tier.icon}</span>
              <h3 className="text-3xl font-bold text-gray-900">{tier.name}</h3>
            </div>

            <p className="mt-4 text-lg text-gray-500">{tier.description}</p>

            <p className="mt-6">
              <span className="text-5xl font-extrabold text-gray-900">{tier.price}</span>
              
            </p>

            <div className="mt-2 text-sm font-semibold text-gray-600">Predictions: {tier.predictions}</div>

            <button
              onClick={() => navigate(`/invoice?plan=${encodeURIComponent(tier.name)}`)}
              className={`mt-8 block w-full text-center py-3 px-6 border border-transparent rounded-md text-lg font-semibold text-white ${
                tier.popular ? "bg-gray-800 hover:bg-blue-700" : "bg-gray-800 hover:bg-blue-700"
              }`}
            >
              Get Started
            </button>

            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900">What's included:</h4>
              <ul className="mt-4 space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 text-sia-blue mr-3" />
                    <p className="text-gray-600">{feature}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center p-6 bg-gray-200 rounded-lg shadow-inner">
        <h3 className="text-2xl font-bold text-gray-900">Exceeded your limit?</h3>
        <p className="mt-2 text-gray-600">
          If you have crossed your initial <strong>10 free predictions</strong>, you must subscribe to a plan to continue your
          analysis. Your current prediction count is checked on every use.
        </p>
      </div>
    </div>
  );
}
