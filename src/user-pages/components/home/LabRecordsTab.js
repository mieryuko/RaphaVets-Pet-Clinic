import React from "react";
import { motion } from "framer-motion";

const LabRecordsTab = ({ records, onDownload, loading }) => {
  const getLabIcon = (lab) => {
    if (lab.type?.toLowerCase().includes('blood')) return 'fa-vial';
    if (lab.type?.toLowerCase().includes('urine')) return 'fa-flask';
    if (lab.type?.toLowerCase().includes('x-ray')) return 'fa-x-ray';
    return 'fa-flask';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#5EE6FE]"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {records.length === 0 ? (
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-6 sm:py-8 text-gray-500">
          <i className="fas fa-flask text-3xl sm:text-4xl mb-2 sm:mb-3 text-gray-300"></i>
          <p className="text-sm sm:text-base">No lab records found.</p>
        </div>
      ) : (
        records.map((lab, index) => (
          <motion.div
            key={lab.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#FFF8F9] backdrop-blur-md border border-[#5EE6FE]/30 p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 transition-all"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <i className={`fa-solid ${getLabIcon(lab)} text-[#FFB6C1] text-base sm:text-lg`}></i>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">{lab.title}</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 flex items-center gap-1">
              <i className="fa-regular fa-calendar"></i> {lab.date}
            </p>
            {lab.fileID ? (
              <button
                onClick={() => onDownload(lab.fileID, lab.originalName)}
                className="bg-[#FFB6C1] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm hover:bg-[#ff9aab] transition-all w-full"
              >
                <i className="fa-solid fa-download mr-1 sm:mr-2"></i>Download PDF
              </button>
            ) : (
              <button
                disabled
                className="bg-gray-400 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm w-full cursor-not-allowed"
              >
                No File Available
              </button>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
};

export default LabRecordsTab;