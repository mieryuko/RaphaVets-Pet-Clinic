import React, { useState } from "react";

export default function Pets() {
  const [pets, setPets] = useState([
    { id: 1, name: "Milo", owner: "Anna Cruz", species: "Dog", breed: "Labrador", age: 3 },
    { id: 2, name: "Luna", owner: "Ben Santos", species: "Cat", breed: "Persian", age: 2 },
  ]);
  const [newPet, setNewPet] = useState({
    name: "",
    owner: "",
    species: "",
    breed: "",
    age: "",
  });
  const [showModal, setShowModal] = useState(false);

  const addPet = () => {
    if (!newPet.name || !newPet.owner || !newPet.species) {
      alert("Please complete all fields!");
      return;
    }
    setPets([...pets, { id: Date.now(), ...newPet }]);
    setNewPet({ name: "", owner: "", species: "", breed: "", age: "" });
    setShowModal(false);
  };

  const deletePet = (id) => {
    setPets(pets.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#2FA394]">Pet Records</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#2FA394] text-white px-4 py-2 rounded-lg hover:bg-[#278e82] transition"
        >
          + Add Pet
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Pet Name</th>
              <th className="text-left px-4 py-3">Owner</th>
              <th className="text-left px-4 py-3">Species</th>
              <th className="text-left px-4 py-3">Breed</th>
              <th className="text-left px-4 py-3">Age</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pets.map((pet) => (
              <tr key={pet.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{pet.name}</td>
                <td className="px-4 py-3">{pet.owner}</td>
                <td className="px-4 py-3">{pet.species}</td>
                <td className="px-4 py-3">{pet.breed}</td>
                <td className="px-4 py-3">{pet.age}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deletePet(pet.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Pet Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-[360px] shadow-lg animate-popUp">
            <h2 className="text-lg font-semibold text-[#2FA394] mb-4">Add New Pet</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Pet Name"
                value={newPet.name}
                onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE]"
              />
              <input
                type="text"
                placeholder="Owner Name"
                value={newPet.owner}
                onChange={(e) => setNewPet({ ...newPet, owner: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE]"
              />
              <input
                type="text"
                placeholder="Species (Dog/Cat)"
                value={newPet.species}
                onChange={(e) => setNewPet({ ...newPet, species: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE]"
              />
              <input
                type="text"
                placeholder="Breed"
                value={newPet.breed}
                onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE]"
              />
              <input
                type="number"
                placeholder="Age"
                value={newPet.age}
                onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE]"
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={addPet}
                  className="bg-[#2FA394] text-white px-4 py-2 rounded-lg hover:bg-[#278e82]"
                >
                  Add Pet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
