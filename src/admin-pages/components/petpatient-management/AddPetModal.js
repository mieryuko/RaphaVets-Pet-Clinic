import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import api from "../../../api/axios"; 

const AddPetModal = ({ isOpen, onClose, onSave, owners, initialData, refreshPets }) => {
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

  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [ownerSearch, setOwnerSearch] = useState("");

  const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return ""; 
    return d.toISOString().split("T")[0];
  };

  const sanitizeNumber = (value) => {
    if (!value) return "";
    return value.toString().replace(/[^\d.]/g, "");
  };

  // Fetch species (Type)
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const res = await api.get("/species");
        setSpeciesOptions(res.data);
      } catch (err) {
        console.error("Failed to fetch species:", err);
        setSpeciesOptions([]);
      }
    };
    fetchSpecies();
  }, []);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    if (initialData) {
      // Debug log to see what's in initialData
      console.log("Initial Data for editing:", initialData);
      
      const ownerId = owners.find((o) => o.name === initialData.owner)?.id || "";
      
      setPetData({
        ownerId,
        type: initialData.petType || "", // Use petType from initialData
        breed: initialData.breed || "",
        name: initialData.name || "",
        age: initialData.age || "",
        sex: initialData.gender || "", // Note: pets use 'gender' not 'sex'
        weight: sanitizeNumber(initialData.weight),
        color: initialData.color || "",
        dob: toInputDate(initialData.petDateOfBirth),
        notes: initialData.note || "",
      });
    } else {
      resetForm();
    }
  }, [initialData, isOpen, owners]);

  // Fetch breeds whenever petData.type changes
  useEffect(() => {
    if (!petData.type) {
      setBreeds([]);
      return;
    }

    const fetchBreeds = async () => {
      try {
        const res = await api.get(`/breeds?species=${petData.type}`);
        setBreeds(res.data);
      } catch (error) {
        console.error("Failed to fetch breeds:", error);
        setBreeds([]);
      }
    };

    fetchBreeds();
  }, [petData.type]);

  const handleChange = (field, value) => {
    const updated = { ...petData, [field]: value };
    if (field === "type") {
      updated.breed = ""; // Reset breed when type changes
      setBreeds([]); // Clear breeds temporarily
    }
    setPetData(updated);
  };

  const handleSave = async () => {
    if (!petData.ownerId) return alert("Please select an owner.");
    if (!petData.type) return alert("Please select a pet type.");
    if (!petData.breed) return alert("Please select a breed.");
    if (!petData.name) return alert("Please enter a pet name.");

    try {
      // For editing existing pet
      if (initialData) {
        const res = await api.put(`/update-pet/${initialData.id}`, { 
          ...petData,
          type: petData.type // Make sure type is included
        });
        console.log("Pet updated:", res.data);
      } else {
        // For adding new pet
        const res = await api.post("/add-pets", { 
          ...petData,
          type: petData.type // Make sure type is included
        });
        console.log("Pet saved:", res.data);
      }

      // Pass the saved pet data back to parent
      onSave({
        ...petData,
        id: initialData?.id || Date.now(), // Use existing ID or generate new one
        owner: owners.find(o => o.id === parseInt(petData.ownerId))?.name || ""
      });

      resetForm();
      onClose();
      
      if (refreshPets) {
        refreshPets();
      }
    } catch (err) {
      console.error("Error saving pet:", err);
      alert("Failed to save pet.");
    }
  };

  const resetForm = () => {
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
    setOwnerSearch("");
    setBreeds([]);
  };

  if (!isOpen) return null;

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
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          <X size={26} />
        </button>

        <h2 className="text-2xl font-bold text-[#212529] dark:text-white mb-5 text-center">
          {initialData ? "Edit Pet" : "Add New Pet"}
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
                  onChange={e => handleChange("type", e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition"
                >
                  <option value="">Select Type</option>
                  {speciesOptions.map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                  ))}
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
                  {breeds.map((b, i) => (
                    <option key={i} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
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
                <label className="block mb-1">Sex</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sex"
                      value="Male"
                      checked={petData.sex === "Male"}
                      onChange={(e) => handleChange("sex", e.target.value)}
                      className="w-4 h-4 text-[#5EE6FE] focus:ring-[#5EE6FE]"
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200">Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sex"
                      value="Female"
                      checked={petData.sex === "Female"}
                      onChange={(e) => handleChange("sex", e.target.value)}
                      className="w-4 h-4 text-[#5EE6FE] focus:ring-[#5EE6FE]"
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200">Female</span>
                  </label>
                </div>
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
                <label className="block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={petData.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                  className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 focus:border-[#5EE6FE] focus:ring-1 focus:ring-[#5EE6FE] transition"
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-1">Notes (optional)</label>
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
                {initialData ? "Update Pet" : "Save Pet"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPetModal;