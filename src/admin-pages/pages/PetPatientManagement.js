import { useState } from "react";
import { PlusCircle, Edit2, Trash2 } from "lucide-react";
import Header from "../template/Header";
import AddOwnerModal from "../components/petpatient-management/AddOwnerModal";
import AddPetModal from "../components/petpatient-management/AddPetModal";

const PetPatientManagement = () => {
  const [activeTab, setActiveTab] = useState("Pet Owners");
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [isAddOwnerModalOpen, setIsAddOwnerModalOpen] = useState(false);


  // State for pet owners
  const [petOwners, setPetOwners] = useState([
    { id: 1, name: "Mark Mapili", email: "sample@example.com", phone: "09123456789", createdAt: "2022-03-05" },
    { id: 2, name: "Miguel Rojero", email: "sample@example.com", phone: "09987654321", createdAt: "2022-04-12" },
    { id: 3, name: "Jordan Frando", email: "sample@example.com", phone: "09234567890", createdAt: "2022-05-20" },
  ]);

  // State for pets
  const [pets, setPets] = useState([
    { id: 1, name: "Bogart", type: "Dog", owner: "Mark Mapili" },
    { id: 2, name: "Tan tan", type: "Cat", owner: "Miguel Rojero" },
    { id: 3, name: "Ming", type: "Cat", owner: "Jordan Frando" },
  ]);

  // Add new owner handler
  const handleAddOwner = (newOwner) => {
    const nextId = petOwners.length ? Math.max(...petOwners.map(o => o.id)) + 1 : 1;
    setPetOwners([...petOwners, { id: nextId, name: `${newOwner.firstName} ${newOwner.lastName}`, ...newOwner, createdAt: new Date().toISOString().split('T')[0] }]);
  };

  // Filtered lists for search
  const filteredOwners = petOwners.filter(owner =>
    owner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPet = (newPet) => {
    const nextId = pets.length ? Math.max(...pets.map(p => p.id)) + 1 : 1;
    setPets([...pets, { id: nextId, ...newPet }]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#FBFBFB] dark:bg-[#101010] p-4 gap-4">
      <Header title="Pet & Patient Management" />

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
            className={`relative px-5 py-2 font-semibold text-sm transition-colors ${
              activeTab === tab
                ? "text-[#5EE6FE]"
                : "text-gray-600 dark:text-gray-300 hover:text-[#5EE6FE] dark:hover:text-[#3BAFDA]"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#5EE6FE] dark:bg-[#3BAFDA] rounded-t-lg" />
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Left Panel */}
        <div className="flex flex-col flex-1 bg-white dark:bg-[#181818] rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-4 min-h-0">
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder={`Search ${activeTab === "Pet Owners" ? "owners" : "pets"}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50"
            />
            <button
              className="ml-2 flex items-center gap-2 bg-[#5EE6FE] hover:bg-[#40c6e3] text-white px-3 py-2 rounded-lg transition"
              onClick={() => {
                if (activeTab === "Pet Owners") setIsAddOwnerModalOpen(true);
                else setIsAddPetModalOpen(true);
              }}
            >
              <PlusCircle size={16} />
              <span className="text-sm font-semibold">
                {activeTab === "Pet Owners" ? "Add Owner" : "Add Pet"}
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 rounded-lg border border-gray-100 dark:border-gray-800">
            {/* Pet Owners Table */}
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
                    <tr
                      key={owner.id}
                      className="cursor-pointer hover:bg-[#E5FBFF] dark:hover:bg-[#222] transition"
                      onClick={() => setSelectedOwner(owner)}
                    >
                      <td className="p-2 text-sm">{owner.id}</td>
                      <td className="p-2 text-sm">{owner.name}</td>
                      <td className="p-2 text-sm">{owner.email}</td>
                      <td className="p-2 text-sm">{owner.phone}</td>
                      <td className="p-2 text-sm flex gap-2">
                        <Edit2
                          size={16}
                          className="text-blue-500 cursor-pointer hover:text-blue-600"
                          onClick={e => { e.stopPropagation(); /* Add edit logic */ }}
                        />
                        <Trash2
                          size={16}
                          className="text-red-500 cursor-pointer hover:text-red-600"
                          onClick={e => { e.stopPropagation(); /* Add delete logic */ }}
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
                    <tr
                      key={pet.id}
                      className="cursor-pointer hover:bg-[#E5FBFF] dark:hover:bg-[#222] transition"
                      onClick={() => setSelectedPet(pet)}
                    >
                      <td className="p-2 text-sm">{pet.id}</td>
                      <td className="p-2 text-sm">{pet.name}</td>
                      <td className="p-2 text-sm">{pet.type}</td>
                      <td className="p-2 text-sm">{pet.owner}</td>
                      <td className="p-2 text-sm flex gap-2">
                        <Edit2
                          size={16}
                          className="text-blue-500 cursor-pointer hover:text-blue-600"
                          onClick={e => { e.stopPropagation(); /* Add edit logic */ }}
                        />
                        <Trash2
                          size={16}
                          className="text-red-500 cursor-pointer hover:text-red-600"
                          onClick={e => { e.stopPropagation(); /* Add delete logic */ }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "Lab/Medical Records" && (
              <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                No records available
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/3 bg-white dark:bg-[#181818] rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-6 flex flex-col min-h-0 overflow-y-auto">
          {/* Pet Owners Details */}
          {activeTab === "Pet Owners" && selectedOwner && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{selectedOwner.name}</h3>
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
                  <span className="text-gray-800 dark:text-gray-200">123 Main St, City</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Sex</span>
                  <span className="text-gray-800 dark:text-gray-200">Male</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Date of Birth</span>
                  <span className="text-gray-800 dark:text-gray-200">Jan 1, 1990</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Pets</span>
                  <span className="text-gray-800 dark:text-gray-200">Vanerie, Mark</span>
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
                  src="/images/sad-dog.png"
                  alt={selectedPet.name}
                  className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{selectedPet.name}</h3>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Owner</span>
                  <span className="text-gray-800 dark:text-gray-200">{selectedPet.owner}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Breed</span>
                  <span className="text-gray-800 dark:text-gray-200">Labrador</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Age</span>
                  <span className="text-gray-800 dark:text-gray-200">1 year</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Sex</span>
                  <span className="text-gray-800 dark:text-gray-200">Female</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Weight</span>
                  <span className="text-gray-800 dark:text-gray-200">12 kg</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Color</span>
                  <span className="text-gray-800 dark:text-gray-200">Golden</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Date of Birth</span>
                  <span className="text-gray-800 dark:text-gray-200">Mar 3, 2021</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Notes</span>
                  <span className="text-gray-800 dark:text-gray-200">Allergy to teokbokki</span>
                </div>
              </div>
            </div>
          )}

          {((activeTab === "Pet Owners" && !selectedOwner) || (activeTab === "Pets" && !selectedPet)) && (
            <div className="flex flex-col justify-center items-center h-full text-gray-400 dark:text-gray-500">
              Select a {activeTab === "Pet Owners" ? "owner" : "pet"} to see details
            </div>
          )}
        </div>
      </div>

      {/* Add Owner Modal */}
      <AddOwnerModal
        isOpen={isAddOwnerModalOpen}
        onClose={() => setIsAddOwnerModalOpen(false)}
        onSave={handleAddOwner}
      />

      <AddPetModal
        isOpen={isAddPetModalOpen}
        onClose={() => setIsAddPetModalOpen(false)}
        onSave={handleAddPet}
        owners={petOwners}
      />
    </div>
  );
};

export default PetPatientManagement;
