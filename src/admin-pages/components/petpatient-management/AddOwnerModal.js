import { useState, useEffect } from "react";
import { X } from "lucide-react";

const AddOwnerModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [ownerData, setOwnerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    sex: "",
    dob: "",
  });

  const [petData, setPetData] = useState({
    type: "",
    breed: "",
    name: "",
    sex: "",
    weight: "",
    color: "",
    dob: "",
    notes: "",
  });

  const [step, setStep] = useState("form");

  const dogBreeds = ["Labrador", "Golden Retriever", "Bulldog", "Poodle", "Beagle"];
  const catBreeds = ["Persian", "Siamese", "Maine Coon", "Sphynx", "Ragdoll"];

  useEffect(() => {
    if (initialData) {
      setOwnerData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        sex: initialData.sex || "",
        dob: initialData.dob || "",
      });

      if (initialData.pets && initialData.pets[0]) {
        setPetData({
          type: initialData.pets[0].type || "",
          breed: initialData.pets[0].breed || "",
          name: initialData.pets[0].name || "",
          sex: initialData.pets[0].sex || "",
          weight: initialData.pets[0].weight || "",
          color: initialData.pets[0].color || "",
          dob: initialData.pets[0].dob || "",
          notes: initialData.pets[0].notes || "",
        });
      }
    }
  }, [initialData]);

  const handleOwnerChange = (field, value) => setOwnerData({ ...ownerData, [field]: value });
  const handlePetChange = (field, value) => {
    const updated = { ...petData, [field]: value };
    if (field === "type") updated.breed = "";
    setPetData(updated);
  };

  const handleNext = () => setStep("review");
  
  const handleConfirm = () => {
    const safePetData = {
      type: petData.type || "",
      breed: petData.breed || "",
      name: petData.name || "",
      sex: petData.sex || "",
      weight: petData.weight || "",
      color: petData.color || "",
      dob: petData.dob || "",
      notes: petData.notes || "",
    };

    const safeOwnerData = {
      firstName: ownerData.firstName || "",
      lastName: ownerData.lastName || "",
      email: ownerData.email || "",
      phone: ownerData.phone || "",
      address: ownerData.address || "",
      sex: ownerData.sex || "",
      dob: ownerData.dob || "",
    };

    onSave({ ...safeOwnerData, pets: [safePetData] });
    setStep("success");
  };

  const handleClose = () => {
    setStep("form");
    setOwnerData({ firstName: "", lastName: "", email: "", phone: "", address: "", sex: "", dob: "" });
    setPetData({ type: "", breed: "", name: "", sex: "", weight: "", color: "", dob: "", notes: "" });
    onClose();
  };

  if (!isOpen) return null;

  const breedOptions = petData.type === "Dog" ? dogBreeds : petData.type === "Cat" ? catBreeds : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[900px] h-[580px] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? "Edit Pet Owner" : "Add New Pet Owner"}
          </h2>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-white rounded-lg transition-colors duration-200"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-hidden">
          {step === "form" && (
            <div className="flex h-full gap-6">
              {/* Owner Information - Left Side */}
              <div className="flex-1 space-y-4 border-r border-gray-200 pr-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
                    <h3 className="text-base font-semibold text-gray-800">Owner Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">First Name *</label>
                        <input 
                          type="text" 
                          value={ownerData.firstName} 
                          onChange={(e) => handleOwnerChange("firstName", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Last Name *</label>
                        <input 
                          type="text" 
                          value={ownerData.lastName} 
                          onChange={(e) => handleOwnerChange("lastName", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Email Address *</label>
                      <input 
                        type="email" 
                        value={ownerData.email} 
                        onChange={(e) => handleOwnerChange("email", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Phone Number *</label>
                      <input 
                        type="text" 
                        value={ownerData.phone} 
                        onChange={(e) => handleOwnerChange("phone", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Gender</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="sex"
                              value="Male"
                              checked={ownerData.sex === "Male"}
                              onChange={(e) => handleOwnerChange("sex", e.target.value)}
                              className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Male</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="sex"
                              value="Female"
                              checked={ownerData.sex === "Female"}
                              onChange={(e) => handleOwnerChange("sex", e.target.value)}
                              className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Female</span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Date of Birth</label>
                        <input 
                          type="date" 
                          value={ownerData.dob} 
                          onChange={(e) => handleOwnerChange("dob", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Address</label>
                      <input 
                        type="text" 
                        value={ownerData.address} 
                        onChange={(e) => handleOwnerChange("address", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter address (optional)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pet Information - Right Side */}
              <div className="flex-1 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-green-500 rounded-full"></div>
                    <h3 className="text-base font-semibold text-gray-800">Pet Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Pet Type *</label>
                        <select 
                          value={petData.type} 
                          onChange={(e) => handlePetChange("type", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select type</option>
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Breed *</label>
                        <select 
                          value={petData.breed} 
                          onChange={(e) => handlePetChange("breed", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          disabled={!petData.type}
                        >
                          <option value="">Select breed</option>
                          {breedOptions.map((breed, index) => (
                            <option key={index} value={breed}>{breed}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Pet Name *</label>
                      <input 
                        type="text" 
                        value={petData.name} 
                        onChange={(e) => handlePetChange("name", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter pet name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Gender</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="sex"
                              value="Male"
                              checked={petData.sex === "Male"}
                              onChange={(e) => handlePetChange("sex", e.target.value)}
                              className="w-4 h-4 text-green-500 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">Male</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="sex"
                              value="Female"
                              checked={petData.sex === "Female"}
                              onChange={(e) => handlePetChange("sex", e.target.value)}
                              className="w-4 h-4 text-green-500 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">Female</span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Weight (kg)</label>
                        <input 
                          type="number" 
                          value={petData.weight} 
                          onChange={(e) => handlePetChange("weight", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter weight"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Color</label>
                        <input 
                          type="text" 
                          value={petData.color} 
                          onChange={(e) => handlePetChange("color", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter color"
                        />
                      </div>
                      <div className="space-y-1.5">
  <label className="text-xs font-medium text-gray-700">Date of Birth</label>
  <input 
    type="date" 
    value={petData.dob} 
    onChange={(e) => handlePetChange("dob", e.target.value)}
    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
  />
</div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Additional Notes</label>
                      <textarea 
                        value={petData.notes} 
                        onChange={(e) => handlePetChange("notes", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder="Enter any additional notes (optional)"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="h-full flex flex-col">
              <div className="text-center mb-2">
                {/* <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">✓</span>
                  </div>
                </div> */}
                <h3 className="text-md font-semibold text-gray-800">Review Information</h3>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-6">
                {/* Owner Details Card */}
                <div className="bg-white border border-gray-200 rounded-xl px-5 pt-4 pb-2 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100">
                    <div className="w-2 h-4 bg-blue-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-800 text-sm">Owner Details</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Full Name:</span>
                      <span className="text-gray-800 font-semibold">{ownerData.firstName} {ownerData.lastName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Email:</span>
                      <span className="text-gray-800 font-semibold">{ownerData.email || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Phone:</span>
                      <span className="text-gray-800 font-semibold">{ownerData.phone || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Gender:</span>
                      <span className="text-gray-800 font-semibold">{ownerData.sex || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Date of Birth:</span>
                      <span className="text-gray-800 font-semibold">{ownerData.dob || "-"}</span>
                    </div>
                    <div className="flex justify-between items-start py-2">
                      <span className="text-gray-600 font-medium">Address:</span>
                      <span className="text-gray-800 font-semibold text-right max-w-[200px]">{ownerData.address || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Pet Details Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100">
                    <div className="w-2 h-4 bg-green-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-800 text-sm">Pet Details</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Pet Name:</span>
                      <span className="text-gray-800 font-semibold">{petData.name || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Type:</span>
                      <span className="text-gray-800 font-semibold">{petData.type || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Breed:</span>
                      <span className="text-gray-800 font-semibold">{petData.breed || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Gender:</span>
                      <span className="text-gray-800 font-semibold">{petData.sex || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Weight:</span>
                      <span className="text-gray-800 font-semibold">{petData.weight ? `${petData.weight} kg` : "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Color:</span>
                      <span className="text-gray-800 font-semibold">{petData.color || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Date of Birth:</span>
                      <span className="text-gray-800 font-semibold">{petData.dob || "-"}</span>
                    </div>
                    <div className="flex justify-between items-start py-2">
                      <span className="text-gray-600 font-medium">Notes:</span>
                      <span className="text-gray-800 font-semibold text-right max-w-[200px]">{petData.notes || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-base">✓</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Owner Added Successfully!</h3>
              <p className="text-sm text-gray-600 mb-6">
                The system has sent a login link to the owner's email to access their account.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end gap-2">
            {step === "form" && (
              <>
                <button 
                  onClick={handleClose}
                  className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleNext}
                  className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
                >
                  Continue
                </button>
              </>
            )}
            
            {step === "review" && (
              <>
                <button 
                  onClick={() => setStep("form")}
                  className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Back
                </button>
                <button 
                  onClick={handleConfirm}
                  className="px-4 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
                >
                  Confirm & Save
                </button>
              </>
            )}
            
            {step === "success" && (
              <button 
                onClick={handleClose}
                className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOwnerModal;