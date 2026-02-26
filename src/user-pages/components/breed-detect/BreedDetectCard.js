import React from "react";
import { motion } from "framer-motion";

export default function BreedDetectCard({ data, handleReset, handleSaveRecord, loading }) {
  if (!data) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full aspect-square sm:aspect-auto sm:h-48 md:h-56 border border-dashed border-gray-300 rounded-lg sm:rounded-md flex flex-col items-center justify-center text-gray-400 bg-gray-50 p-4"
      >
        <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span className="text-xs sm:text-sm text-center">No detection yet.<br/>Upload an image to get started.</span>
      </motion.div>
    );
  }

  const { breed, confidence, notes } = data;
  const percent = Math.round((confidence || 0) * 100);

  // Determine color based on confidence
  const getConfidenceColor = () => {
    if (percent >= 80) return "bg-green-500";
    if (percent >= 60) return "bg-yellow-500";
    if (percent >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full border border-gray-200 rounded-lg sm:rounded-md p-3 sm:p-4 flex flex-col gap-3 sm:gap-4"
    >
      {/* Breed and Confidence */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#2FA394] break-words">
            {breed}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Confidence: <span className="font-semibold">{percent}%</span>
          </p>
        </div>
        
        {/* Confidence Badge */}
        <div className={`self-start xs:self-auto px-2 py-1 rounded-full text-white text-xs font-medium ${getConfidenceColor()}`}>
          {percent >= 80 ? "High" : percent >= 60 ? "Medium" : percent >= 40 ? "Low" : "Very Low"}
        </div>
      </div>

      {/* Notes */}
      {notes && (
        <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-700">{notes}</p>
        </div>
      )}

      {/* Confidence Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Confidence Level</span>
          <span>{percent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full ${getConfidenceColor()}`}
          ></motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col xs:flex-row gap-2 mt-2">
        <button
          onClick={handleReset}
          className="flex-1 px-3 sm:px-4 py-2 bg-[#5EE6FE] text-white font-medium rounded-lg text-xs sm:text-sm hover:bg-[#46d7ee] transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Upload Another</span>
        </button>
        
        <button
          onClick={handleSaveRecord}
          className="flex-1 px-3 sm:px-4 py-2 border border-[#2FA394] text-[#2FA394] font-medium rounded-lg text-xs sm:text-sm hover:bg-[#2FA394] hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
          </svg>
          <span>Save Record</span>
        </button>
      </div>
    </motion.div>
  );
}