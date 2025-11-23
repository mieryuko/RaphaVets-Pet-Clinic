import React from "react";
import { motion } from "framer-motion";

const LabRecordsTab = ({ records, onDownload, loading }) => {
  // Get icon based on lab type
  const getLabIcon = (lab) => {
    if (lab.type?.toLowerCase().includes('blood')) return 'fa-vial';
    if (lab.type?.toLowerCase().includes('urine')) return 'fa-flask';
    if (lab.type?.toLowerCase().includes('x-ray')) return 'fa-x-ray';
    return 'fa-flask'; // default icon
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EE6FE]"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {records.length === 0 ? (
        <div className="col-span-3 text-center py-8 text-gray-500">
          <i className="fas fa-flask text-4xl mb-3 text-gray-300"></i>
          <p>No lab records found.</p>
        </div>
      ) : (
        records.map((lab, index) => (
          <motion.div
            key={lab.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#FFF8F9] backdrop-blur-md border border-[#5EE6FE]/30 p-5 rounded-xl shadow-md hover:shadow-lg hover:bg-[#EFFFFF]/60 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <i className={`fa-solid ${getLabIcon(lab)} text-[#FFB6C1] text-lg`}></i>
              <h3 className="font-semibold text-gray-800">{lab.title}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
              <i className="fa-regular fa-calendar"></i> {lab.date}
            </p>
            {lab.fileID ? (
              <button
                onClick={() => onDownload(lab.fileID, lab.originalName)}
                className="bg-[#FFB6C1] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#ff9aab] transition-all w-full"
              >
                <i className="fa-solid fa-download mr-2"></i>Download PDF
              </button>
            ) : (
              <button
                disabled
                className="bg-gray-400 text-white px-4 py-2 rounded-lg font-medium text-sm w-full cursor-not-allowed"
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