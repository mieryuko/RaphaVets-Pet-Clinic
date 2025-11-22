import { useState, useRef, useEffect } from "react";
import api from "../../api/axios"; 
import { PlusCircle } from "lucide-react";
import Header from "../template/Header";
import AddOwnerModal from "../components/petpatient-management/AddOwnerModal";
import AddPetModal from "../components/petpatient-management/AddPetModal";
import SuccessToast from "../../template/SuccessToast";
import ErrorToast from "../../template/ErrorToast";

import PetOwnersTab from "../components/petpatient-management/PetOwnersTab";
import PetsTab from "../components/petpatient-management/PetsTab";
import RecordsTab from "../components/petpatient-management/RecordsTab";
import RightPanel from "../components/petpatient-management/RightPanel";

import DeleteModal from "../components/petpatient-management/DeleteModal";
import UploadRecordModal from "../components/petpatient-management/UploadRecordModal";
import PdfModal from "../components/petpatient-management/PdfModal";

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
    { id: 1, petName: "Bogart", owner: "Mark Mapili", type: "Lab Record", uploadedOn: "2025-10-01", fileName: "sample_medicalreport.pdf" },
    { id: 2, petName: "Tan tan", owner: "Miguel Rojero", type: "Medical History", uploadedOn: "2025-09-25", fileName: "sample_medicalreport.pdf" },
    { id: 3, petName: "Ming", owner: "Jordan Frando", type: "Lab Record", uploadedOn: "2025-09-28", fileName: "sample_medicalreport.pdf" },
  ]);

  // Check if user is veterinarian (role 3)
  const [isVet, setIsVet] = useState(false);

  useEffect(() => {
    // Check user role from localStorage or API
    const userRole = localStorage.getItem('userRole') || 2; // Default to admin if not found
    setIsVet(userRole === '3');
  }, []);

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
    setShowUploadRecordModal(true);
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
      setEditingItem(item);
      setIsAddPetModalOpen(true);
    } else if (type === "owner") {
      setEditingItem({ ...item, type });
      setIsAddOwnerModalOpen(true);
    }
  };

  const handleSaveOwner = async (newData) => {
    try {
      if (editingItem) {
        const res = await api.put(`/update-owner/${editingItem.id}`, newData);
        console.log("Owner updated:", res.data);

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
        
        await fetchOwnersAndPets();
        
        return { message: "Owner updated successfully" };
        
      } else {
        const res = await api.post("admin/add-owner", newData);
        console.log("Owner created:", res.data);

        setSuccessMessage("Owner added successfully!");
        
        await fetchOwnersAndPets();

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
          owner: editingItem.owner,
          image: editingItem.image || "/images/sad-dog.png"
        };

        setPets(prev => prev.map(p => p.id === editingItem.id ? updatedPet : p));
        
        if (selectedPet && selectedPet.id === editingItem.id) {
          setSelectedPet(updatedPet);
        }
        
        setEditingItem(null);
        setSuccessMessage("Pet updated successfully!");
      } else {
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedOwner(null);
    setSelectedPet(null);
    setSearchQuery("");
  };

  const handleAddButtonClick = () => {
    setEditingItem(null);
    if (activeTab === "Pet Owners") setIsAddOwnerModalOpen(true);
    else if (activeTab === "Pets") setIsAddPetModalOpen(true);
    else if (activeTab === "Lab/Medical Records") setShowUploadRecordModal(true);
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case "Pet Owners": return "Add Owner";
      case "Pets": return "Add Pet";
      case "Lab/Medical Records": return "Add Record";
      default: return "Add";
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "Pet Owners": return "Search owners...";
      case "Pets": return "Search pets...";
      case "Lab/Medical Records": return "Search records...";
      default: return "Search...";
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
            onClick={() => handleTabChange(tab)}
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
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
            />
            {/* Hide Add button for veterinarians */}
            {!isVet && (
              <button
                className="ml-2 flex items-center gap-2 bg-[#5EE6FE] hover:bg-[#40c6e3] text-white px-3 py-2 rounded-lg transition"
                onClick={handleAddButtonClick}
              >
                <PlusCircle size={16} />
                <span className="text-sm font-semibold">
                  {getAddButtonText()}
                </span>
              </button>
            )}
          </div>

          {/* Render Active Tab */}
          {activeTab === "Pet Owners" && (
            <PetOwnersTab
              filteredOwners={filteredOwners}
              setSelectedOwner={setSelectedOwner}
              handleEdit={handleEdit}
              setDeleteTarget={setDeleteTarget}
              setShowDeleteModal={setShowDeleteModal}
              isVetView={isVet}
            />
          )}

          {activeTab === "Pets" && (
            <PetsTab
              filteredPets={filteredPets}
              setSelectedPet={setSelectedPet}
              handleEdit={handleEdit}
              setDeleteTarget={setDeleteTarget}
              setShowDeleteModal={setShowDeleteModal}
              isVetView={isVet}
            />
          )}

          {activeTab === "Lab/Medical Records" && (
            <RecordsTab
              records={records}
              setSelectedRecord={setSelectedRecord}
              handleEditRecord={handleEditRecord}
              handleDeleteRecordClick={handleDeleteRecordClick}
              isVetView={isVet}
            />
          )}
        </div>

        {/* Right Panel Component */}
        <RightPanel
          activeTab={activeTab}
          selectedOwner={selectedOwner}
          selectedPet={selectedPet}
          selectedRecord={selectedRecord}
          setIsPdfModalOpen={setIsPdfModalOpen}
          isVetView={isVet}
        />
      </div>

      {/* Add/Edit Modals - Only show for non-veterinarians */}
      {!isVet && (
        <>
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
            initialData={editingItem}
          />

          {/* Delete Confirmation Modal */}
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
            <UploadRecordModal
              isOpen={showUploadRecordModal}
              onClose={() => {
                setShowUploadRecordModal(false);
                setSelectedPet(null);
                setSearchQuery("");
              }}
              pets={pets}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedPet={selectedPet}
              setSelectedPet={setSelectedPet}
              setSuccessMessage={setSuccessMessage}
            />
          )}
        </>
      )}

      {/* PDF Modal - Show for both roles */}
      {isPdfModalOpen && selectedRecord && (
        <PdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          selectedRecord={selectedRecord}
        />
      )}
    </div>
  );
};

export default PetPatientManagement;