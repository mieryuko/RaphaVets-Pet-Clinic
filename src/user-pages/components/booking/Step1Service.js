import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/axios";

export default function Step1Service({ selectedService, setSelectedService }) {
  const [serviceTypes, setServiceTypes] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get("/appointment/services"); // use api instance
        const mapped = res.data.map((s) => ({
          id: s.serviceID,
          label: s.service,
          note: s.description,
          duration: s.duration,
        }));
        setServiceTypes(mapped);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Choose a service</h2>
      <p className="text-sm text-gray-500">Tap a card to choose.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {serviceTypes.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedService(t)}
            className={`relative text-left p-4 rounded-2xl border transition-all shadow-sm hover:shadow-md focus:outline-none ${
              selectedService?.id === t.id
                ? "border-[#5EE6FE] bg-[#EAFBFD] shadow-lg"
                : "border-gray-100 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white border border-gray-100">
                <i className="fa-solid fa-paw text-[#5EE6FE]" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">{t.label}</div>
                <div className="text-xs text-gray-500 mt-1">{t.note}</div>
              </div>
            </div>
            <div className="absolute right-3 top-3 text-xs text-gray-400">
              {t.duration}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
