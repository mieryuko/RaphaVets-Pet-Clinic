import React, { useState } from "react";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const patients = [
    { id: 1, owner: "Anna Cruz", pet: "Milo", species: "Dog", breed: "Labrador", age: 3 },
    { id: 2, owner: "Ben Santos", pet: "Luna", species: "Cat", breed: "Persian", age: 2 },
    { id: 3, owner: "Carla Reyes", pet: "Toby", species: "Dog", breed: "Shih Tzu", age: 5 },
  ];

  const filtered = patients.filter(
    (p) =>
      p.owner.toLowerCase().includes(search.toLowerCase()) ||
      p.pet.toLowerCase().includes(search.toLowerCase()) ||
      p.breed.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[#2FA394]">Patients</h2>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by owner, pet, or breed..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5EE6FE]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Owner</th>
              <th className="text-left px-4 py-3">Pet</th>
              <th className="text-left px-4 py-3">Species</th>
              <th className="text-left px-4 py-3">Breed</th>
              <th className="text-left px-4 py-3">Age</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{p.owner}</td>
                <td className="px-4 py-3">{p.pet}</td>
                <td className="px-4 py-3">{p.species}</td>
                <td className="px-4 py-3">{p.breed}</td>
                <td className="px-4 py-3">{p.age}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(p)}
                    className="text-[#2FA394] hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-[350px] shadow-lg text-center animate-popUp">
            <h2 className="text-lg font-semibold text-[#2FA394] mb-2">
              {selected.pet} — {selected.breed}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Owner: <b>{selected.owner}</b><br />
              Species: {selected.species}<br />
              Age: {selected.age} years
            </p>
            <button
              onClick={() => setSelected(null)}
              className="bg-[#2FA394] text-white py-2 px-4 rounded-lg hover:bg-[#278e82] transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
