import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import ClientLayout from "../ClientLayout";
import BreedDetectCard from "../components/breed-detect/BreedDetectCard";
import api from "../../api/axios";

function BreedDetect() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [pets, setPets] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Save record handler
  const handleSaveRecord = () => {
    if (!result) {
      alert("No result available to save yet!");
      return;
    }

    alert(`✅ Record saved successfully!\nBreed: ${result.breed}\nConfidence: ${(result.confidence * 100).toFixed(1)}%`);
  };


  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleFileChange = (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setError("Please upload a JPG or PNG image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Please choose a file under 5 MB.");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDetect = async () => {
    if (!imageFile) {
      setError("Please upload an image of your pet first.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const res = await api.post("/ml/predict/breed", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("An error occurred while detecting breed. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError("");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <ClientLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 sm:gap-5 md:gap-6 px-0 sm:px-1 md:px-0"
      >
        {/* Title */}
        <motion.div
          variants={itemVariants}
          className="text-center md:text-left"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#2FA394]">
            Pet Breed Detector
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl mx-auto md:mx-0">
            Upload a photo of your dog or cat and our detector will identify its breed with
            confidence. Perfect for owners who want to know more about their pets!
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.section
          variants={itemVariants}
          className="bg-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100"
        >
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Upload pet image
          </label>

          {/* Upload + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-5 mt-2">
            {/* Choose File Section */}
            <div className="flex flex-col xs:flex-row xs:items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="px-4 sm:px-5 py-1.5 sm:py-2 bg-[#5EE6FE] text-white rounded-lg hover:bg-[#46d7ee] transition-all shadow-sm text-xs sm:text-sm whitespace-nowrap">
                  Choose File
                </div>
                <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[150px] xs:max-w-[180px] sm:max-w-[200px] md:max-w-[250px]">
                  {imageFile ? imageFile.name : "No file selected"}
                </span>
              </label>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-row gap-2 sm:gap-3">
              <button
                onClick={handleDetect}
                disabled={loading}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-1.5 sm:py-2.5 rounded-lg font-medium shadow-md transition-all text-xs sm:text-sm ${
                  loading
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-[#2FA394] text-white hover:bg-[#278f83]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Detecting...</span>
                  </span>
                ) : "Detect Breed"}
              </button>

              <button
                onClick={handleReset}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-all text-xs sm:text-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs sm:text-sm text-red-500 bg-red-50 p-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}
        </motion.section>

        {/* Preview & Result */}
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6"
        >
          {/* Preview */}
          <div className="bg-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100 flex flex-col">
            <h2 className="text-base sm:text-lg font-medium text-[#2FA394] mb-3">Preview</h2>
            <div className="w-full aspect-square sm:aspect-video md:h-60 border border-dashed border-gray-300 rounded-lg sm:rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <motion.img
                  src={previewUrl}
                  alt="Pet preview"
                  className="object-contain w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              ) : (
                <div className="text-center p-4">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-xs sm:text-sm text-gray-400 mt-2 block">No preview available</span>
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="bg-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100">
            <h2 className="text-base sm:text-lg font-medium text-[#2FA394] mb-3">
              Detection Result
            </h2>

            <BreedDetectCard 
              data={result} 
              handleReset={handleReset} 
              handleSaveRecord={handleSaveRecord} 
              loading={loading}
            />

            {/* Disclaimer Note */}
            <div className="mt-4 text-xs sm:text-sm text-gray-500 italic bg-[#F8FDFD] rounded-lg px-3 sm:px-4 py-2 sm:py-3 border border-[#DDF9F4] leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-[#2FA394] font-bold text-sm sm:text-base">⚠️</span>
                <div>
                  <strong className="text-[#2FA394]">Note:</strong> This breed detection is for educational
                  and informational purposes only. Results are not 100% accurate, especially
                  for mixed breeds, low-light, or unclear photos. Please consult a licensed
                  veterinarian for professional identification.
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Recent Detections Section 
        {result && (
          <motion.section
            variants={itemVariants}
            className="bg-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100"
          >
            <h2 className="text-base sm:text-lg font-medium text-[#2FA394] mb-3">
              Recent Detections
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Your recent breed detections will appear here. This feature is coming soon!
            </p>
          </motion.section>
        )}*/}
      </motion.div>
    </ClientLayout>
  );
}

export default BreedDetect;