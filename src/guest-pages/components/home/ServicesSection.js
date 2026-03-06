import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";

const serviceIconMap = {
  consultation: "fa-stethoscope",
  vaccination: "fa-syringe",
  surgery: "fa-user-doctor",
  laboratory: "fa-flask",
  "dental care": "fa-tooth",
  "preventive care": "fa-shield-alt",
  confinement: "fa-hospital",
};

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return "Varies";

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return `PHP ${numeric.toLocaleString("en-PH")}`;
  }

  return String(value);
};

const mapApiServiceToUi = (service, fallbackId) => {
  const entries = [];

  Object.entries(service.pricing || {}).forEach(([category, items]) => {
    (items || []).forEach((item) => {
      entries.push({
        name: item.label || category,
        price: formatPrice(item.price),
        description: item.description || category || "Service option",
      });
    });
  });

  if (entries.length === 0) {
    entries.push({
      name: service.service || "Service",
      price: formatPrice(service.price),
      description: service.note || "Contact clinic for detailed pricing.",
    });
  }

  const iconKey = String(service.service || "").trim().toLowerCase();

  return {
    id: service.serviceID || fallbackId,
    name: service.service || `Service ${fallbackId}`,
    icon: serviceIconMap[iconKey] || "fa-paw",
    description:
      service.shortDescription ||
      service.longDescription ||
      service.description ||
      "Comprehensive veterinary care.",
    details: entries,
  };
};

const ServicesSection = () => {
  const navigate = useNavigate();
  const [servicesData, setServicesData] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let loadingTimer;

    const fetchServices = async () => {
      const cacheKey = "guest_services_cache_v1";
      const now = Date.now();
      const cacheTtlMs = 5 * 60 * 1000;

      try {
        const cachedRaw = sessionStorage.getItem(cacheKey);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached?.expiresAt > now && Array.isArray(cached?.data)) {
            if (isMounted) {
              setServicesData(cached.data);
              setHasFetched(true);
            }
            return;
          }
        }
      } catch {
        // Ignore cache parsing errors and fetch fresh data.
      }

      loadingTimer = setTimeout(() => {
        if (isMounted) setIsLoading(true);
      }, 250);

      try {
        const response = await api.get("/appointment/services");
        console.log("Services API response:", response.data);

        const rows =
          Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.services)
            ? response.data.services
            : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        if (!isMounted) return;

        const normalized = rows.map((row, index) =>
          mapApiServiceToUi(row, index + 1)
        );

        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              data: normalized,
              expiresAt: now + cacheTtlMs,
            })
          );
        } catch {
          // Ignore storage quota/private mode errors.
        }

        setServicesData(normalized);
      } catch (error) {
        console.error("Failed to fetch services:", error);
        if (isMounted) setServicesData([]);
      } finally {
        clearTimeout(loadingTimer);
        if (isMounted) {
          setIsLoading(false);
          setHasFetched(true);
        }
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
      clearTimeout(loadingTimer);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const allServicesModalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      opacity: 0,
      y: 50,
      transition: { duration: 0.2 },
    },
  };

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-[#5EE6FE]">Services</span>
          </h2>
          <div className="w-24 h-1 bg-[#5EE6FE] mx-auto rounded-full" />
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Comprehensive veterinary care tailored to your pet&apos;s unique needs
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {isLoading ? (
            [1, 2, 3, 4].map((card) => (
              <div
                key={`services-loading-${card}`}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse"
              >
                <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-gray-100" />
                <div className="mx-auto h-4 w-24 rounded bg-gray-100" />
              </div>
            ))
          ) : servicesData.length > 0 ? (
            <>
              {servicesData.map((service) => (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  onHoverStart={() => setHoveredId(service.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  onClick={() => setSelectedService(service)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md p-6 cursor-pointer border border-gray-100 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 text-2xl mb-3 group-hover:bg-[#5EE6FE] group-hover:text-white transition-colors duration-300">
                      <i className={`fas ${service.icon}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <motion.div
                      className="mt-2 text-[#5EE6FE] text-sm"
                      animate={hoveredId === service.id ? { opacity: 1 } : { opacity: 0 }}
                    >
                      <i className="fas fa-chevron-right text-xs" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                onClick={() => setShowAllServices(true)}
                className="bg-gradient-to-br from-[#5EE6FE] to-[#3ecbe0] rounded-xl shadow-md p-6 cursor-pointer group"
              >
                <div className="flex flex-col items-center text-center h-full justify-center">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl mb-3 group-hover:scale-110 transition-transform">
                    <i className="fas fa-border-all" />
                  </div>
                  <h3 className="font-semibold text-white">See All Services</h3>
                  <p className="text-white/80 text-sm mt-1">View details & pricing</p>
                </div>
              </motion.div>
            </>
          ) : hasFetched ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              No services available.
            </div>
          ) : null}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedService(null)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5EE6FE]/10 rounded-lg flex items-center justify-center text-[#5EE6FE]">
                    <i className={`fas ${selectedService.icon}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedService.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <i className="fas fa-times text-[#5E6C7A]" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-[#5E6C7A] mb-6">{selectedService.description}</p>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Service Details & Pricing</h4>

                  <div className="space-y-3">
                    {selectedService.details.map((detail, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <span className="font-medium text-gray-900">{detail.name}</span>
                          <span className="font-semibold text-[#5EE6FE] whitespace-nowrap">
                            {detail.price}
                          </span>
                        </div>
                        <p className="text-sm text-[#5E6C7A]">{detail.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setShowLoginPrompt(true)}
                    className="bg-[#5EE6FE] hover:bg-[#3ecbe0] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAllServices && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAllServices(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <motion.div
              variants={allServicesModalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">All Services & Pricing</h3>
                <button
                  onClick={() => setShowAllServices(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <i className="fas fa-times text-[#5E6C7A]" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-8">
                  {servicesData.map((service) => (
                    <div
                      key={service.id}
                      className="border-b border-gray-100 pb-6 last:border-0"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#5EE6FE]/10 rounded-lg flex items-center justify-center text-[#5EE6FE]">
                          <i className={`fas ${service.icon}`} />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                      </div>

                      <p className="text-[#5E6C7A] text-sm mb-4">{service.description}</p>

                      <div className="grid gap-3">
                        {service.details.map((detail, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2 gap-4">
                              <span className="font-medium text-gray-900">{detail.name}</span>
                              <span className="font-semibold text-[#5EE6FE] whitespace-nowrap">
                                {detail.price}
                              </span>
                            </div>
                            <p className="text-sm text-[#5E6C7A]">{detail.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowLoginPrompt(false)}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h3>
              <p className="text-sm text-gray-600 mb-5">
                Booking an appointment requires a client account. Please login to continue.
              </p>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    setSelectedService(null);
                    navigate("/");
                  }}
                  className="px-4 py-2 rounded-lg bg-[#5EE6FE] text-white hover:bg-[#3ecbe0]"
                >
                  Go to Login
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ServicesSection;