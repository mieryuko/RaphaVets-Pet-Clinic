import { useState } from "react";
import { X, Search } from "lucide-react";

const AddPetModal = ({ isOpen, onClose, onSave, owners }) => {
  const [petData, setPetData] = useState({
    ownerId: "",
    type: "",
    breed: "",
    name: "",
    age: "",
    sex: "",
    weight: "",
    color: "",
    dob: "",
    notes: "",
  });

  const [ownerSearch, setOwnerSearch] = useState("");
  const dogBreeds = ["Labrador", "Golden Retriever", "Bulldog", "Poodle", "Beagle"];
  const catBreeds = ["Persian", "Siamese", "Maine Coon", "Sphynx", "Ragdoll"];

  const handleChange = (field, value) => {
    const updated = { ...petData, [field]: value };
    if (field === "type") updated.breed = "";
    setPetData(updated);
  };

  const handleSave = () => {
    if (!petData.ownerId) return alert("Please select an owner.");
    onSave({ ...petData });
    setPetData({
      ownerId: "",
      type: "",
      breed: "",
      name: "",
      age: "",
      sex: "",
      weight: "",
      color: "",
      dob: "",
      notes: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  const breedOptions = petData.type === "Dog" ? dogBreeds : petData.type === "Cat" ? catBreeds : [];
  const filteredOwners = owners.filter(
    (o) =>
      o.name.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      o.email.toLowerCase().includes(ownerSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
  <div className="bg-[#F5F7FA] dark:bg-[#1C1C1E] w-[820px] rounded-2xl shadow-2xl p-5 flex flex-col relative max-h-[90vh] box-border">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          <X size={26} />
        </button>

        <h2 className="text-2xl font-bold text-[#212529] dark:text-white mb-5 text-center">
          Add New Pet
        </h2>

  <div className="flex gap-4 flex-1 min-h-0">
          {/* Left: Owner selection */}
          <div className="flex-1 bg-white dark:bg-[#252525] p-4 rounded-xl flex flex-col gap-3 min-h-0 overflow-y-auto">
            <h3 className="font-semibold text-[#212529] dark:text-white mb-2 text-base">Select Owner</h3>
            <div className="relative mb-2">
              <Search className="absolute top-3 left-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={ownerSearch}
                onChange={(e) => setOwnerSearch(e.target.value)}
                className="w-full pl-10 p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 text-sm focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition"
              />
            </div>
            <div className="flex-1">
              {filteredOwners.length ? (
                filteredOwners.map((owner) => (
                  <div
                    key={owner.id}
                    onClick={() => handleChange("ownerId", owner.id)}
                    className={`p-2 cursor-pointer rounded-md ${
                      petData.ownerId === owner.id
                        ? "bg-[#5EE6FE]/30 dark:bg-[#5EE6FE]/50"
                        : "hover:bg-[#5EE6FE]/20 dark:hover:bg-[#5EE6FE]/30"
                    }`}
                  >
                    <p className="font-medium text-sm">{owner.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">{owner.email}</p>
                  </div>
                ))
              ) : (
                <p className="p-2 text-gray-400 text-sm">No owner found</p>
              )}
            </div>
          </div>

          {/* Right: Pet details */}
          <div className="flex-1 bg-white dark:bg-[#252525] p-4 rounded-xl flex flex-col gap-2 justify-between min-h-0 overflow-y-auto">
            <h3 className="font-semibold text-[#212529] dark:text-white text-base">Pet Details</h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block mb-1">Type</label>
                <select
                  value={petData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition"
                >
                  <option value="">Select Type</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Breed</label>
                <select
                  value={petData.breed}
                  onChange={(e) => handleChange("breed", e.target.value)}
                  disabled={!petData.type}
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition"
                >
                  <option value="">Select Breed</option>
                  {breedOptions.map((b, i) => (
                    <option key={i} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Name</label>
                <input
                  type="text"
                  value={petData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Pet Name"
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition"
                />
              </div>

              <div>
                <label className="block mb-1">Age</label>
                <input
                  type="number"
                  value={petData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="Age"
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition"
                />
              </div>

              <div>
                <label className="block mb-1">Sex</label>
                <select
                  value={petData.sex}
                  onChange={(e) => handleChange("sex", e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition"
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={petData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  placeholder="Weight"
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition"
                />
              </div>

              <div>
                <label className="block mb-1">Color</label>
                <input
                  type="text"
                  value={petData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  placeholder="Color"
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition"
                />
              </div>

              <div>
                <label className="block mb-1">DOB (Month/Year)</label>
                <input
                  type="month"
                  value={petData.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition"
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-1">Notes</label>
                <textarea
                  value={petData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-[#5EE6FE] hover:bg-[#40c6e3] text-white font-semibold transition"
              >
                Save Pet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPetModal;
