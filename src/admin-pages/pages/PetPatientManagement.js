  import { useState, useRef, useEffect } from "react";
  import api from "../../api/axios"; 
  import { PlusCircle, Edit2, Trash2 } from "lucide-react";
  import Header from "../template/Header";
  import AddOwnerModal from "../components/petpatient-management/AddOwnerModal";
  import AddPetModal from "../components/petpatient-management/AddPetModal";
  import SuccessToast from "../../template/SuccessToast";
  import ErrorToast from "../../template/ErrorToast";

  import OwnerTable from "../components/petpatient-management/OwnerTable";
  import PetTable from "../components/petpatient-management/PetTable";
  import RecordTable from "../components/petpatient-management/RecordTable";
  import DeleteModal from "../components/petpatient-management/DeleteModal";
  import UploadRecordModal from "../components/petpatient-management/UploadRecordModal";

  const PetPatientManagement = () => {
    const [activeTab, setActiveTab] = useState("Pet Owners");
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [selectedPet, setSelectedPet] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
    const [isAddOwnerModalOpen, setIsAddOwnerModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showUploadRecordModal, setShowUploadRecordModal] = useState(false);
    const fileInputRef = useRef(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);


    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [petOwners, setPetOwners] = useState([
      { id: 1, name: "Mark Mapili", email: "sample@example.com", phone: "09123456789", createdAt: "2022-03-05" },
      { id: 2, name: "Miguel Rojero", email: "sample@example.com", phone: "09987654321", createdAt: "2022-04-12" },
      { id: 3, name: "Jordan Frando", email: "sample@example.com", phone: "09234567890", createdAt: "2022-05-20" },
    ]);

    const [pets, setPets] = useState([
      { id: 1, name: "Bogart", type: "Dog", owner: "Mark Mapili" },
      { id: 2, name: "Tan tan", type: "Cat", owner: "Miguel Rojero" },
      { id: 3, name: "Ming", type: "Cat", owner: "Jordan Frando" },
    ]);

    const [records, setRecords] = useState([
      { id: 1, petName: "Bogart", owner: "Mark Mapili", type: "Lab Record", uploadedOn: "2025-10-01", fileName: "Module-3.pdf" },
      { id: 2, petName: "Tan tan", owner: "Miguel Rojero", type: "Medical History", uploadedOn: "2025-09-25", fileName: "matrix-operation.pdf" },
      { id: 3, petName: "Ming", owner: "Jordan Frando", type: "Lab Record", uploadedOn: "2025-09-28", fileName: "xray.pdf" },
    ]);

    const formatDate = (dateString) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      });
    };
    
    const calculateAge = (dob) => {
      const birth = new Date(dob);
      const today = new Date();

      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      let days = today.getDate() - birth.getDate();

      if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      if (years > 0) {
        return `${years} yrs old`;
      } else if (months > 0) {
        return `${months} mos old`;
      } else {
        return `${days} days old`;
      }
    };


    const fetchOwnersAndPets = async () => {
      try {
        const res = await api.get("/admin/owners-with-pets");
        const data = res.data;

        setPetOwners(
          data.map(o => ({
            id: o.accId,
            name: o.name,
            gender: o.gender,
            dateOfBirth: formatDate(o.dateOfBirth),
            email: o.email,
            phone: o.contactNo,
            address: o.address,
            createdAt: formatDate(o.createdAt),
            pets: o.pets
          }))
        );

        setPets(
          data.flatMap(owner =>
            (owner.pets || []).map(p => ({
              id: p.petID,
              name: p.petName,
              petType: p.petType,
              gender: p.petGender,
              breed: p.breedName,
              age: calculateAge(p.dateOfBirth),
              petDateOfBirth: formatDate(p.dateOfBirth),
              weight: (p.weight_kg ?? 0) + " kg",
              color: p.color,
              note: p.note,
              owner: owner.name,
              image: p.imageName ? `http://localhost:5000/api/pets/images/${p.imageName}` : "/images/sad-dog.png"
            }))
          )
        );
      } catch (err) {
        console.error(err);
      }
    };


    

    useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await api.get("/admin/owners-with-pets");
          const data = res.data;

          setPetOwners(
            data.map(o => ({
              id: o.accId,
              name: o.name,
              gender: o.gender,
              dateOfBirth: formatDate(o.dateOfBirth),
              email: o.email,
              phone: o.contactNo,
              address: o.address,
              createdAt: formatDate(o.createdAt),
              pets: o.pets
            }))
          );

          setPets(
            data.flatMap(owner =>
              (owner.pets || []).map(p => ({
                id: p.petID,
                name: p.petName,
                petType: p.petType,
                gender: p.petGender,
                breed: p.breedName,
                age: calculateAge(p.dateOfBirth),
                petDateOfBirth: formatDate(p.dateOfBirth),
                weight: (p.weight_kg ?? 0) + " kg",
                color: p.color,
                note: p.note,
                owner: owner.name,
                image: p.imageName 
                  ? `http://localhost:5000/api/pets/images/${p.imageName}`
                  : "/images/sad-dog.png"
              }))
            )
          );


        } catch (error) {
          console.error("Fetch owners failed:", error);
        }
      };

      fetchData();
    }, []);


    const handleEditRecord = (record) => {
      setEditingItem({ ...record, type: "record" });
      setShowUploadRecordModal(true); // Reuse your modal for editing
    };

    const handleDeleteRecordClick = (record) => {
      setDeleteTarget({ type: "record", id: record.id });
      setShowDeleteModal(true);
    };

    const filteredOwners = petOwners.filter(o =>
    o.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPets = pets.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );


    const handleDelete = (id, type) => {
      try {
        if (type === "owner") {
          setPetOwners(prev => prev.filter(o => o.id !== id));
          if (selectedOwner?.id === id) setSelectedOwner(null);
          setSuccessMessage("Owner deleted successfully!");
        } else {
          setPets(prev => prev.filter(p => p.id !== id));
          if (selectedPet?.id === id) setSelectedPet(null);
          setSuccessMessage("Pet deleted successfully!");
        }
      } catch {
        setErrorMessage("Failed to delete!");
      }
    };

    const handleEdit = (item, type) => {
      if (type === "pet") {
        setEditingItem(item); // just the pet object, no type field
        setIsAddPetModalOpen(true);
      } else if (type === "owner") {
        setEditingItem({ ...item, type }); // keep type for owners if needed
        setIsAddOwnerModalOpen(true);
      }
    };


    const handleSaveOwner = async (newData) => {
    try {
      if (editingItem) {
        // Editing existing owner - call backend
        const res = await api.put(`/update-owner/${editingItem.id}`, newData);
        console.log("Owner updated:", res.data);

        // Update frontend state
        const updatedOwner = {
          ...editingItem,
          ...newData,
          name: `${newData.firstName} ${newData.lastName}`,
          email: newData.email,
          phone: newData.phone,
          address: newData.address,
          gender: newData.sex,
          dateOfBirth: formatDate(newData.dob),
        };

        setPetOwners(prev =>
          prev.map(o => o.id === editingItem.id ? updatedOwner : o)
        );
        
        if (selectedOwner && selectedOwner.id === editingItem.id) {
          setSelectedOwner(updatedOwner);
        }
        
        setEditingItem(null);
        setSuccessMessage("Owner updated successfully!");
        
        // Refresh data from backend
        await fetchOwnersAndPets();
        
        // Return simple response for editing (no credentials)
        return { message: "Owner updated successfully" };
        
      } else {
        // Adding new owner - call backend
        const res = await api.post("admin/add-owner", newData);
        console.log("Owner created:", res.data);

        setSuccessMessage("Owner added successfully!");
        
        // Refresh data from backend to get the new owner with proper ID
        await fetchOwnersAndPets();

        // Return credentials for new owner
        return {
          email: res.data.email,
          password: res.data.password
        };
      }
    } catch (error) {
      console.error("Error saving owner:", error);
      throw error;
    }
  };
    const handleSavePet = (savedPet) => {
  try {
    if (editingItem) {
      // Create the complete updated pet object
      const updatedPet = {
        id: editingItem.id,
        name: savedPet.name || editingItem.name,
        petType: savedPet.type || editingItem.petType,
        breed: savedPet.breed || editingItem.breed,
        gender: savedPet.sex || editingItem.gender,
        age: savedPet.dob ? calculateAge(savedPet.dob) : editingItem.age,
        petDateOfBirth: savedPet.dob ? formatDate(savedPet.dob) : editingItem.petDateOfBirth,
        weight: savedPet.weight ? `${savedPet.weight} kg` : editingItem.weight,
        color: savedPet.color || editingItem.color,
        note: savedPet.notes || editingItem.note,
        owner: editingItem.owner, // Keep the same owner
        image: editingItem.image || "/images/sad-dog.png" // Keep the same image
      };

      // Update the pets list
      setPets(prev => prev.map(p => p.id === editingItem.id ? updatedPet : p));
      
      // IMPORTANT: Update the selectedPet if it's the one being edited
      if (selectedPet && selectedPet.id === editingItem.id) {
        setSelectedPet(updatedPet);
      }
      
      setEditingItem(null);
      setSuccessMessage("Pet updated successfully!");
    } else {
      // For new pets
      const ownerName = petOwners.find(o => o.id === parseInt(savedPet.ownerId))?.name || "";
      const newPet = {
        id: pets.length ? Math.max(...pets.map(p => p.id)) + 1 : 1,
        name: savedPet.name,
        petType: savedPet.type,
        breed: savedPet.breed,
        gender: savedPet.sex,
        age: savedPet.dob ? calculateAge(savedPet.dob) : "",
        petDateOfBirth: savedPet.dob ? formatDate(savedPet.dob) : "",
        weight: savedPet.weight ? `${savedPet.weight} kg` : "",
        color: savedPet.color,
        note: savedPet.notes,
        owner: ownerName,
        image: "/images/sad-dog.png"
      };
      
      setPets(prev => [...prev, newPet]);
      setSuccessMessage("Pet added successfully!");
    }
  } catch {
    setErrorMessage("Failed to save pet!");
  }
};


    return (
      <div className="flex flex-col h-screen bg-[#FBFBFB] dark:bg-[#101010] p-4 gap-4 relative">
        <Header title="Customer & Pet Management" />

        {/* Toasts */}
        {successMessage && (
          <SuccessToast message={successMessage} duration={3000} onClose={() => setSuccessMessage(null)} />
        )}
        {errorMessage && (
          <ErrorToast message={errorMessage} duration={3000} onClose={() => setErrorMessage(null)} />
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 relative">
          {["Pet Owners", "Pets", "Lab/Medical Records"].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedOwner(null);
                setSelectedPet(null);
                setSearchQuery("");
              }}
              className={`relative px-5 py-2 font-semibold text-md transition-colors ${
                activeTab === tab
                  ? "text-[#A9E6FF]"
                  : "text-gray-600 dark:text-gray-300 hover:text-[#A9E6FF] dark:hover:text-[#3BAFDA]"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-[#5EE6FE] dark:bg-[#3BAFDA] rounded-t-lg" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Main Tables */}
          <div className="flex flex-col flex-1 bg-white dark:bg-[#181818] rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-4 min-h-0">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder={
                  activeTab === "Pet Owners"
                    ? "Search owners..."
                    : activeTab === "Pets"
                    ? "Search pets..."
                    : "Search records..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
              />
              <button
                className="ml-2 flex items-center gap-2 bg-[#5EE6FE] hover:bg-[#40c6e3] text-white px-3 py-2 rounded-lg transition"
                onClick={() => {
                  setEditingItem(null);
                  if (activeTab === "Pet Owners") setIsAddOwnerModalOpen(true);
                  else if (activeTab === "Pets") setIsAddPetModalOpen(true);
                  else if (activeTab === "Lab/Medical Records") setShowUploadRecordModal(true);
                }}
              >
                <PlusCircle size={16} />
                <span className="text-sm font-semibold">
                  {activeTab === "Pet Owners"
                    ? "Add Owner"
                    : activeTab === "Pets"
                    ? "Add Pet"
                    : "Add Record"}
                </span>
              </button>
            </div>

            {/* Owners Table */}
            {activeTab === "Pet Owners" && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 dark:bg-[#1B1B1B] sticky top-0">
                  <tr>
                    <th className="p-2 text-sm text-gray-600 dark:text-gray-300">ID</th>
                    <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Name</th>
                    <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Email</th>
                    <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Phone</th>
                    <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOwners.map(owner => (
                    <tr key={owner.id} className="cursor-pointer hover:bg-[#E5FBFF] dark:hover:bg-[#222] transition" onClick={() => setSelectedOwner(owner)}>
                      <td className="p-2 text-sm">{owner.id}</td>
                      <td className="p-2 text-sm">{owner.name}</td>
                      <td className="p-2 text-sm">{owner.email}</td>
                      <td className="p-2 text-sm">{owner.phone}</td>
                      <td className="p-2 text-sm flex gap-2">
                        <Edit2
                          size={16}
                          className="text-blue-500 cursor-pointer hover:text-blue-600"
                          onClick={e => { e.stopPropagation(); handleEdit(owner, "owner"); }}
                        />
                        <Trash2
                          size={16}
                          className="text-red-500 cursor-pointer hover:text-red-600"
                          onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'owner', id: owner.id }); setShowDeleteModal(true); }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pets Table */}
            {activeTab === "Pets" && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 dark:bg-[#1B1B1B] sticky top-0">
                  <tr>
                    <th className="p-2 text-sm text-gray-600 dark:text-gray-300">ID</th>
                    <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Name</th>
                    <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Type</th>
                    <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Owner</th>
                    <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPets.map(pet => (
                    <tr key={pet.id} className="cursor-pointer hover:bg-[#E5FBFF] dark:hover:bg-[#222] transition" onClick={() => setSelectedPet(pet)}>
                      <td className="p-2 text-sm">{pet.id}</td>
                      <td className="p-2 text-sm">{pet.name}</td>
                      <td className="p-2 text-sm">{pet.petType}</td>
                      <td className="p-2 text-sm">{pet.owner}</td>
                      <td className="p-2 text-sm flex gap-2">
                        <Edit2
                          size={16}
                          className="text-blue-500 cursor-pointer hover:text-blue-600"
                          onClick={e => { e.stopPropagation(); handleEdit(pet, "pet"); }}
                        />
                        <Trash2
                          size={16}
                          className="text-red-500 cursor-pointer hover:text-red-600"
                          onClick={e => { e.stopPropagation(); setDeleteTarget({ type: 'pet', id: pet.id }); setShowDeleteModal(true); }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Lab/Medical Records Table */}
            {activeTab === "Lab/Medical Records" && (
              <div className="flex flex-1 gap-4 min-h-0">
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 dark:bg-[#1B1B1B] sticky top-0">
                      <tr>
                        <th className="p-2 text-sm text-gray-600 dark:text-gray-300">ID</th>
                        <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Pet Name</th>
                        <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Owner</th> {/* NEW */}
                        <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Type</th>
                        <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Uploaded On</th>
                        <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr className="hover:bg-[#E5FBFF] dark:hover:bg-[#222] transition">
                          <td colSpan={6} className="text-center p-4 text-gray-400 dark:text-gray-500">
                            No records yet
                          </td>
                        </tr>
                      ) : (
                        records.map(record => (
                          <tr
                            key={record.id}
                            className="hover:bg-[#E5FBFF] dark:hover:bg-[#222] transition cursor-pointer"
                            onClick={() => setSelectedRecord(record)}
                          >
                            <td className="p-2 text-sm">{record.id}</td>
                            <td className="p-2 text-sm">{record.petName}</td>
                            <td className="p-2 text-sm">{record.owner}</td> {/* NEW */}
                            <td className="p-2 text-sm">{record.type}</td>
                            <td className="p-2 text-sm">{record.uploadedOn}</td>
                            <td className="p-2 text-sm flex gap-2">
                              <Edit2
                                size={16}
                                className="text-blue-500 cursor-pointer hover:text-blue-600"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleEditRecord(record);
                                }}
                              />
                              <Trash2
                                size={16}
                                className="text-red-500 cursor-pointer hover:text-red-600"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteRecordClick(record);
                                }}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* Right Panel */}
          <div className="w-1/3 bg-white dark:bg-[#181818] rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-6 flex flex-col min-h-0 overflow-y-auto">
            {/* Pet Owners Details */}
            {activeTab === "Pet Owners" && selectedOwner && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{selectedOwner.name}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedOwner.id}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Email</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedOwner.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Phone</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedOwner.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Address</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedOwner.address}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Sex</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedOwner.gender}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Date of Birth</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedOwner.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Pets</span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {selectedOwner?.pets?.length
                        ? selectedOwner.pets.map(p => p.petName).join(", ")
                        : "No pets"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Account Created</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedOwner.createdAt}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pets Details */}
            {activeTab === "Pets" && selectedPet && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedPet.image || "/images/sad-dog.png"}
                    alt={selectedPet.name}
                    className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                  />
                  <div className="flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{selectedPet.name}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedPet.id}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Owner</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedPet.owner}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Breed</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedPet.breed}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Age</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedPet.age}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Sex</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedPet.gender}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Weight</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedPet.weight}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Color</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedPet.color}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Date of Birth</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedPet.petDateOfBirth}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="font-medium text-gray-600 dark:text-gray-400">Notes</span>
                    <span className="text-gray-800 dark:text-gray-200">{selectedPet.note}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Lab/Medical Records Details */}
            {activeTab === "Lab/Medical Records" && (
              <div className="flex-1 flex flex-col min-h-0">
                {selectedRecord ? (
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {selectedRecord.petName} - {selectedRecord.type}
                      </h3>
                      <button
                        onClick={() => setIsPdfModalOpen(true)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#222]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-600 dark:text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3" />
                        </svg>
                      </button>
                    </div>
                    <iframe
                      src={`/${selectedRecord.fileName}`}
                      title={selectedRecord.fileName}
                      className="flex-1 w-full border rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center h-full text-gray-400 dark:text-gray-500">
                    Select a record to see file
                  </div>
                )}
              </div>
            )}


            {((activeTab === "Pet Owners" && !selectedOwner) || (activeTab === "Pets" && !selectedPet)) && (
              <div className="flex flex-col justify-center items-center h-full text-gray-400 dark:text-gray-500">
                Select a {activeTab === "Pet Owners" ? "owner" : "pet"} to see details
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Modals */}
        <AddOwnerModal
          isOpen={isAddOwnerModalOpen}
          onClose={() => { setIsAddOwnerModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveOwner}
          refreshOwners={fetchOwnersAndPets}
          initialData={editingItem?.type === "owner" ? editingItem : null}
        />
        <AddPetModal
          key={editingItem ? editingItem.id : "new"}
          isOpen={isAddPetModalOpen}
          onClose={() => { setIsAddPetModalOpen(false); setEditingItem(null); }}
          onSave={handleSavePet}
          owners={petOwners}
          refreshPets={fetchOwnersAndPets}
          initialData={editingItem} // pass editingItem for edit
        />




        {/* Delete Confirmation Modal */}
        {/* Delete Confirmation Modal - REPLACE THIS SECTION */}
        {showDeleteModal && (
          <DeleteModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setDeleteTarget(null);
            }}
            onDelete={handleDelete}
            itemType={deleteTarget?.type === "owner" ? "owner" : deleteTarget?.type === "pet" ? "pet" : "record"}
            deleteTarget={deleteTarget}
            refreshData={fetchOwnersAndPets}
          />
        )}

        {/* Upload Record Modal */}
        {showUploadRecordModal && (
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

                {/* Scrollable Pet List */}
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
                          <div className="text-sm text-gray-500 dark:text-gray-400">{pet.petType}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Right Half: File Upload */}
              <div className="flex-1 flex flex-col gap-2 pl-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Upload Record</h3>

                {/* Selected Pet Info */}
                {selectedPet ? (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{selectedPet.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{selectedPet.owner}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedPet.petType}</div>
                  </div>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500">Select a pet from the left</p>
                )}

                {/* Upload Form Card */}
                <div className="flex flex-col gap-4 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">

                  {/* Record Title */}
                  <div className="flex flex-col">
                    <label className="text-gray-600 dark:text-gray-300 font-medium mb-1">Record Title / Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Vaccination, Lab Test, X-ray"
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50 transition"
                    />
                  </div>

                  {/* Type Selector */}
                  <div className="flex flex-col">
                    <label className="text-gray-600 dark:text-gray-300 font-medium mb-1">Type</label>
                    <select className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50 transition">
                      <option>Lab Record</option>
                      <option>Medical History</option>
                    </select>
                  </div>

                  {/* File Upload */}
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

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-auto">
                  <button
                    onClick={() => setShowUploadRecordModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setSuccessMessage("Record uploaded successfully!");
                      setShowUploadRecordModal(false);
                      setSelectedPet(null);
                      setSearchQuery("");
                    }}
                    className="px-4 py-2 rounded-lg bg-[#5EE6FE] hover:bg-[#40c6e3] text-white font-semibold transition"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Modal */}
        {isPdfModalOpen && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-[#181818] rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{selectedRecord.fileName}</h3>
                <button
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  onClick={() => setIsPdfModalOpen(false)}
                >
                  Close
                </button>
              </div>
              <iframe
                src={`/${selectedRecord.fileName}`}
                title={selectedRecord.fileName}
                className="w-full flex-1 border rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  export default PetPatientManagement;
