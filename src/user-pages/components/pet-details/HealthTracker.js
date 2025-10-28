import React, { useState } from "react";
import { motion } from "framer-motion";

function HealthTracker() {
  const [records, setRecords] = useState([
    { label: "Weight", value: "6.4 kg" },
    { label: "Vaccination", value: "Up to Date" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newRecord, setNewRecord] = useState({ label: "", value: "" });

  const handleAddRecord = () => {
    if (!newRecord.label || !newRecord.value) return;
    setRecords([...records, newRecord]);
    setNewRecord({ label: "", value: "" });
    setShowModal(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowModal(true)}
        className="absolute top-0 right-0 bg-[#5EE6FE] text-white p-2 rounded-full hover:bg-[#3ecbe0] shadow-md transition-all"
      >
        <i className="fa-solid fa-plus"></i>
      </button>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {records.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
          >
            <h4 className="font-semibold text-gray-800">{r.label}</h4>
            <p className="text-gray-600 text-sm">{r.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Add Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add Health Record</h3>
            <input
              type="text"
              placeholder="Record Label (e.g., Weight)"
              value={newRecord.label}
              onChange={(e) => setNewRecord({ ...newRecord, label: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 mb-3"
            />
            <input
              type="text"
              placeholder="Value (e.g., 6.4 kg)"
              value={newRecord.value}
              onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            />
            <button
              onClick={handleAddRecord}
              className="bg-[#5EE6FE] text-white py-2 px-4 rounded-lg hover:bg-[#3ecbe0]"
            >
              Add Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthTracker;
