import { useState } from "react";
import { X } from "lucide-react";

const AddOwnerModal = ({ isOpen, onClose, onSave }) => {
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
    age: "",
    sex: "",
    weight: "",
    color: "",
    dob: "",
    notes: "",
  });

  const [step, setStep] = useState("form"); // form, review, success

  const dogBreeds = ["Labrador", "Golden Retriever", "Bulldog", "Poodle", "Beagle"];
  const catBreeds = ["Persian", "Siamese", "Maine Coon", "Sphynx", "Ragdoll"];

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
      age: petData.age || "",
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
    setPetData({ type: "", breed: "", name: "", age: "", sex: "", weight: "", color: "", dob: "", notes: "" });
    onClose();
  };

  if (!isOpen) return null;

  const breedOptions = petData.type === "Dog" ? dogBreeds : petData.type === "Cat" ? catBreeds : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#F5F7FA] dark:bg-[#1C1C1E] w-[900px] rounded-2xl shadow-2xl p-6 flex flex-col relative">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition">
          <X size={24} />
        </button>

        {step === "form" && (
          <>
            <h2 className="text-2xl font-semibold text-[#212529] dark:text-white mb-6">Add Pet Owner & Pet</h2>

            <div className="flex gap-6">
              {/* Owner Info */}
              <div className="flex-1 bg-white dark:bg-[#252525] p-5 rounded-xl flex flex-col gap-4 shadow-inner">
                <h3 className="text-lg font-semibold text-[#212529] dark:text-white mb-2">Owner Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" value={ownerData.firstName} onChange={(e)=>handleOwnerChange("firstName", e.target.value)} className="input-field"/>
                  <input type="text" placeholder="Last Name" value={ownerData.lastName} onChange={(e)=>handleOwnerChange("lastName", e.target.value)} className="input-field"/>
                  <input type="email" placeholder="Email" value={ownerData.email} onChange={(e)=>handleOwnerChange("email", e.target.value)} className="input-field col-span-2"/>
                  <input type="text" placeholder="Phone" value={ownerData.phone} onChange={(e)=>handleOwnerChange("phone", e.target.value)} className="input-field"/>
                  <input type="text" placeholder="Address (Optional)" value={ownerData.address} onChange={(e)=>handleOwnerChange("address", e.target.value)} className="input-field col-span-2"/>
                  <select value={ownerData.sex} onChange={(e)=>handleOwnerChange("sex", e.target.value)} className="input-field">
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</label>
                    <input type="date" value={ownerData.dob} onChange={(e)=>handleOwnerChange("dob", e.target.value)} className="input-field" />
                  </div>
                </div>
              </div>

              {/* Pet Info */}
              <div className="flex-1 bg-white dark:bg-[#252525] p-5 rounded-xl flex flex-col gap-4 shadow-inner">
                <h3 className="text-lg font-semibold text-[#212529] dark:text-white mb-2">Pet Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <select value={petData.type} onChange={(e)=>handlePetChange("type", e.target.value)} className="input-field">
                    <option value="">Select Type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                  </select>
                  <select value={petData.breed} onChange={(e)=>handlePetChange("breed", e.target.value)} className="input-field" disabled={!petData.type}>
                    <option value="">Select Breed</option>
                    {breedOptions.map((b,i)=><option key={i} value={b}>{b}</option>)}
                  </select>
                  <input type="text" placeholder="Name" value={petData.name} onChange={(e)=>handlePetChange("name", e.target.value)} className="input-field"/>
                  <input type="number" placeholder="Age" value={petData.age} onChange={(e)=>handlePetChange("age", e.target.value)} className="input-field"/>
                  <select value={petData.sex} onChange={(e)=>handlePetChange("sex", e.target.value)} className="input-field">
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <input type="number" placeholder="Weight (kg)" value={petData.weight} onChange={(e)=>handlePetChange("weight", e.target.value)} className="input-field"/>
                  <input type="text" placeholder="Color" value={petData.color} onChange={(e)=>handlePetChange("color", e.target.value)} className="input-field"/>
                  <div className="flex flex-col">
                    <label className="text-sm text-gray-600 dark:text-gray-400">DOB (Month/Year)</label>
                    <input type="month" value={petData.dob} onChange={(e)=>handlePetChange("dob", e.target.value)} className="input-field"/>
                  </div>
                  <input type="text" placeholder="Notes (optional)" value={petData.notes} onChange={(e)=>handlePetChange("notes", e.target.value)} className="input-field col-span-2"/>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={handleClose} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] transition">Cancel</button>
              <button onClick={handleNext} className="px-4 py-2 rounded-lg bg-[#5EE6FE] hover:bg-[#0B5ED7] text-white font-semibold transition">Next</button>
            </div>
          </>
        )}

        {step === "review" && (
          <>
            <h2 className="text-2xl font-semibold text-[#212529] dark:text-white mb-6">Review Details</h2>
            <div className="flex gap-6">
              <div className="flex-1 bg-white dark:bg-[#252525] p-5 rounded-xl flex flex-col gap-2 shadow-inner">
                <h3 className="font-semibold text-[#212529] dark:text-white">Owner Info</h3>
                <p>Full Name: {ownerData.firstName} {ownerData.lastName}</p>
                <p>Email: {ownerData.email}</p>
                <p>Phone: {ownerData.phone}</p>
                <p>Address: {ownerData.address}</p>
                <p>Sex: {ownerData.sex}</p>
                <p>DOB: {ownerData.dob}</p>
              </div>
              <div className="flex-1 bg-white dark:bg-[#252525] p-5 rounded-xl flex flex-col gap-2 shadow-inner">
                <h3 className="font-semibold text-[#212529] dark:text-white">Pet Info</h3>
                <p>Type: {petData.type}</p>
                <p>Breed: {petData.breed}</p>
                <p>Name: {petData.name}</p>
                <p>Age: {petData.age}</p>
                <p>Sex: {petData.sex}</p>
                <p>Weight: {petData.weight} kg</p>
                <p>Color: {petData.color}</p>
                <p>DOB: {petData.dob}</p>
                <p>Notes: {petData.notes}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setStep("form")} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] transition">Back</button>
              <button onClick={handleConfirm} className="px-4 py-2 rounded-lg bg-[#5EE6FE] hover:bg-[#0B5ED7] text-white font-semibold transition">Confirm</button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center p-10">
            <h2 className="text-2xl font-semibold text-[#212529] dark:text-white mb-4">Owner Added Successfully!</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300 text-center">
              The system has sent a login link to the owner's email to access their account.
            </p>
            <button onClick={handleClose} className="px-4 py-2 rounded-lg bg-[#5EE6FE] hover:bg-[#0B5ED7] text-white font-semibold transition">
              Close
            </button>
          </div>
        )}

        {/* Input field style */}
        <style jsx>{`
          .input-field {
            padding: 0.75rem;
            border-radius: 0.75rem;
            border: 1px solid #CED4DA;
            background-color: #FFF;
            color: #212529;
            outline: none;
            transition: all 0.2s;
          }
          .input-field:focus {
            border-color: #20C997;
            box-shadow: 0 0 0 3px rgba(32,201,151,0.2);
          }
          .dark .input-field {
            background-color: #2A2A2A;
            border-color: #495057;
            color: #DEE2E6;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddOwnerModal;
