import React from "react";
import { motion } from "framer-motion";

const MedicalReportsTab = ({ records, onDownload, loading }) => {
  const getRecordIcon = (record) => {
    if (record.type?.toLowerCase().includes('vaccin')) return 'fa-syringe';
    if (record.type?.toLowerCase().includes('deworm')) return 'fa-capsules';
    if (record.type?.toLowerCase().includes('health')) return 'fa-file-medical';
    if (record.type?.toLowerCase().includes('lab')) return 'fa-flask';
    return 'fa-file-medical';
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
          <i className="fas fa-file-medical text-3xl sm:text-4xl mb-2 sm:mb-3 text-gray-300"></i>
          <p className="text-sm sm:text-base">No medical reports found.</p>
        </div>
      ) : (
        records.map((record, index) => (
          <motion.div
            key={record.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#E3FAF7] backdrop-blur-md border border-[#5EE6FE]/30 p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 transition-all"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <i className={`fa-solid ${getRecordIcon(record)} text-[#5EE6FE] text-base sm:text-lg`}></i>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">{record.title}</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 flex items-center gap-1">
              <i className="fa-regular fa-calendar"></i> {record.date}
            </p>
            {record.fileID ? (
              <button
                onClick={() => onDownload(record.fileID, record.originalName)}
                className="bg-[#5EE6FE] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm hover:bg-[#3ecbe0] transition-all w-full"
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

export default MedicalReportsTab;