import { useState } from "react";

const UploadRecordModal = ({
  isOpen,
  onClose,
  pets,
  selectedPet,
  setSelectedPet,
  onUpload,
  searchQuery,
  setSearchQuery
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 w-[900px] max-w-full shadow-xl flex gap-6 max-h-[85vh] overflow-hidden">
        
        {/* Left Panel: Pet Selection */}
        <div className="flex-1 flex flex-col gap-4 border-r border-gray-200 dark:border-gray-700 pr-4 min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Select Pet</h3>
          <input
            type="text"
            placeholder="Search pet or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50 transition"
          />
          <div className="flex-1 overflow-y-auto mt-2">
            {pets.filter(p =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.owner.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-center mt-4">No pets found</p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {pets.filter(p =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.owner.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(pet => (
                  <li
                    key={pet.id}
                    className={`p-2 rounded-lg cursor-pointer hover:bg-[#E5FBFF] dark:hover:bg-[#222] ${
                      selectedPet?.id === pet.id ? "bg-[#5EE6FE]/20 dark:bg-[#3BAFDA]/20" : ""
                    }`}
                    onClick={() => setSelectedPet(pet)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{pet.id} {pet.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{pet.owner}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{pet.type}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Half: File Upload */}
        <div className="flex-1 flex flex-col gap-2 pl-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Upload Record</h3>

          {selectedPet ? (
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPet.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{selectedPet.owner}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedPet.type}</div>
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500">Select a pet from the left</p>
          )}

          <div className="flex flex-col gap-4 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col">
              <label className="text-gray-600 dark:text-gray-300 font-medium mb-1">Record Title / Description</label>
              <input
                type="text"
                placeholder="e.g. Vaccination, Lab Test, X-ray"
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50 transition"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 dark:text-gray-300 font-medium mb-1">Type</label>
              <select className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50 transition">
                <option>Lab Record</option>
                <option>Medical History</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 dark:text-gray-300 font-medium mb-1">Upload PDF</label>
              <input
                type="file"
                accept="application/pdf"
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Only PDF files are allowed.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] transition"
            >
              Cancel
            </button>
            <button
              onClick={onUpload}
              className="px-4 py-2 rounded-lg bg-[#5EE6FE] hover:bg-[#40c6e3] text-white font-semibold transition"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadRecordModal;
