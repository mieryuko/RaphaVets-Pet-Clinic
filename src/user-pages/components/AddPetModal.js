import React from "react";

function AddPetModal({
  newPet,
  setNewPet,
  handleAddPet,
  showPhotoOptions,
  setShowPhotoOptions,
  handlePhotoChange,
  setShowModal,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80 flex flex-col gap-4 relative shadow-lg">
        <h2 className="text-lg font-semibold text-center">Add New Pet</h2>

        {/* Pet Photo */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-gray-600 font-semibold">Upload Pet Photo</span>
          <div
            className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-[#5EE6FE] cursor-pointer group"
            onClick={() => setShowPhotoOptions(true)}
          >
            <img
              src={newPet.photo || "/images/dog-profile.png"}
              alt="Pet"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <i className="fa-solid fa-pen text-white text-xl"></i>
            </div>
          </div>

          {/* Photo Options */}
          {showPhotoOptions && (
            <div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
              onClick={() => setShowPhotoOptions(false)}
            >
              <div
                className="bg-white rounded-xl p-6 flex flex-col gap-4 w-64"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-center">
                  Update Pet Photo
                </h3>
                <label className="cursor-pointer bg-[#EEF4F5] hover:bg-[#5EE6FE] hover:text-white text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all">
                  <i className="fa-solid fa-camera"></i>
                  Take Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                <label className="cursor-pointer bg-[#EEF4F5] hover:bg-[#5EE6FE] hover:text-white text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all">
                  <i className="fa-solid fa-folder-open"></i>
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="relative">
          <input
            type="text"
            value={newPet.name}
            onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
            className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition-all"
            placeholder=" "
          />
          <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">
            Pet Name
          </label>
        </div>

        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={newPet.breed}
            onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
            className="peer flex-1 border border-gray-300 rounded-lg px-3 pt-5 pb-2 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition-all"
            placeholder=" "
          />
          <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">
            Breed
          </label>
          <button
            onClick={() => alert('Breed detection coming soon!')}
            className="bg-[#5EE6FE] text-white px-3 py-1 rounded-lg shadow-md hover:bg-[#3ecbe0] transition-all text-sm"
          >
            Detect Breed
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={newPet.age}
              onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
              className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition-all"
              placeholder=" "
            />
            <label className="absolute left-3 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm">
              Age
            </label>
          </div>

          <div className="relative flex-1">
            <select
              value={newPet.gender}
              onChange={(e) => setNewPet({ ...newPet, gender: e.target.value })}
              className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition-all bg-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={() => {
              setShowModal(false);
              setNewPet({ photo: null, name: "", breed: "", age: "", gender: "" });
              setShowPhotoOptions(false);
            }}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleAddPet}
            className="bg-[#5EE6FE] text-white py-2 px-4 rounded-lg hover:bg-[#3ecbe0] transition-all"
          >
            Add Pet
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddPetModal;
