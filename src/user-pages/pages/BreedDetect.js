import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import Header from "../template/Header";
import Sidebar from "../template/SideBar";
import BreedDetectCard from "../components/breed-detect/BreedDetectCard";

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

    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1100));
      const mock = {
        breed: "Labrador Retriever",
        confidence: 0.87,
        notes:
          "Most likely Labrador Retriever. For mixed or low-quality images, results may be uncertain.",
      };
      setResult(mock);
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


  return (
    <div
      className={`font-sansation min-h-screen relative flex flex-col ${
        darkMode ? "bg-[#1E1E1E] text-white" : "bg-[#FBFBFB]"
      }`}
    >
      {/* HEADER */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setIsMenuOpen={setIsMenuOpen}
      />

      {/* MAIN LAYOUT */}
      <div className="flex flex-row w-full  sm:px-12">
        {/* SIDEBAR */}
        <Sidebar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          pets={pets}
          setShowModal={setShowModal}
        />

        {/* MAIN CONTENT */}
        <div
          className={`transition-all duration-500 flex flex-col gap-6 py-6 rounded-xl w-full ${
            isMenuOpen ? "md:ml-[60px]" : "md:ml-[10px]"
          }`}
        >
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h1 className="text-3xl font-semibold text-[#2FA394]">
              Pet Breed Detector
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Upload a photo of your dog or cat and our detector will identify its breed with
              confidence. Perfect for owners who want to know more about their pets!
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload pet image
            </label>

            {/* Upload + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mt-2">
              {/* Choose File Section */}
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="px-5 py-2 bg-[#5EE6FE] text-white rounded-lg hover:bg-[#46d7ee] transition-all shadow-sm">
                    Choose File
                  </div>
                  <span className="text-sm text-gray-600 truncate max-w-[200px] sm:max-w-[250px]">
                    {imageFile ? imageFile.name : "No file selected"}
                  </span>
                </label>
              </div>

              {/* Buttons Section */}
              <div className="flex justify-start sm:justify-end gap-3">
                <button
                  onClick={handleDetect}
                  disabled={loading}
                  className={`px-5 py-2.5 rounded-lg font-medium shadow-md transition-all ${
                    loading
                      ? "bg-gray-300 text-gray-700"
                      : "bg-[#2FA394] text-white hover:bg-[#278f83]"
                  }`}
                >
                  {loading ? "Detecting..." : "Detect Breed"}
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-all"
                >
                  Reset
                </button>
              </div>
            </div>


            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          </motion.section>

          {/* Preview & Result */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Preview */}
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 flex flex-col">
              <h2 className="text-lg font-medium text-[#2FA394] mb-3">Preview</h2>
              <div className="w-full h-60 border border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <motion.img
                    src={previewUrl}
                    alt="Pet preview"
                    className="object-contain h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                ) : (
                  <span className="text-sm text-gray-400">No preview available</span>
                )}
              </div>
            </div>

            {/* Result */}
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-medium text-[#2FA394] mb-3">
                Detection Result
              </h2>

              <BreedDetectCard 
                data={result} 
                handleReset={handleReset} 
                handleSaveRecord={handleSaveRecord} 
              />

              {/* ✅ Disclaimer Note */}
              <div className="mt-4 text-xs sm:text-sm text-gray-500 italic bg-[#F8FDFD] rounded-lg px-4 py-3 border border-[#DDF9F4] leading-relaxed">
                ⚠️ <strong>Note:</strong> This breed detection is for educational
                and informational purposes only. Results are not 100% accurate, especially
                for mixed breeds, low-light, or unclear photos. Please consult a licensed
                veterinarian for professional identification.
              </div>
            </div>
          </motion.section>

          {/* Info Section
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#E9FCF8] rounded-2xl p-6 shadow-inner border border-[#C9F7EE]"
          >
            <h2 className="text-lg font-semibold text-[#2FA394] mb-2">
              How It Works
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Once you upload a clear image, the system analyzes key features such
              as color, ear shape, and body structure. It then compares the photo
              to our database of breeds and shows the most probable match. Accuracy
              improves with high-quality, well-lit photos showing your pet’s face.
            </p>
          </motion.section> */}
        </div>
      </div>
    </div>
  );

}

export default BreedDetect;
