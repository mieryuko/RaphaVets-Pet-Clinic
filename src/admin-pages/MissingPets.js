import React, { useState } from "react";

export default function MissingPets() {
  const [selected, setSelected] = useState(null);

  const reports = [
    {
      id: 1,
      pet: "Max",
      breed: "Beagle",
      location: "BGC Taguig",
      status: "Pending",
      image: "https://place-puppy.com/200x200",
      reporter: "Anna Cruz",
    },
    {
      id: 2,
      pet: "Snow",
      breed: "Persian Cat",
      location: "Pasig City",
      status: "Approved",
      image: "https://placekitten.com/200/200",
      reporter: "Ben Santos",
    },
  ];

  const openModal = (report) => setSelected(report);
  const closeModal = () => setSelected(null);

  const approve = () => {
    alert(`Approved report for ${selected.pet}`);
    closeModal();
  };
  const reject = () => {
    alert(`Rejected report for ${selected.pet}`);
    closeModal();
  };

  const badgeColor = (s) =>
    s === "Approved"
      ? "bg-green-100 text-green-700"
      : s === "Rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[#2FA394]">Missing Pets</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl shadow p-4 border border-gray-100 hover:shadow-md transition"
          >
            <img
              src={r.image}
              alt={r.pet}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{r.pet}</p>
                <p className="text-xs text-gray-500">{r.breed}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor(
                  r.status
                )}`}
              >
                {r.status}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              📍 {r.location}
              <br />👤 {r.reporter}
            </p>
            <button
              onClick={() => openModal(r)}
              className="mt-3 w-full py-2 text-sm bg-[#2FA394] text-white rounded-lg hover:bg-[#278e82] transition"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-[360px] shadow-lg text-center animate-popUp">
            <img
              src={selected.image}
              alt={selected.pet}
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
            />
            <h2 className="text-lg font-semibold text-[#2FA394]">{selected.pet}</h2>
            <p className="text-sm text-gray-600 mb-4">
              Breed: {selected.breed} <br />
              Location: {selected.location} <br />
              Reporter: {selected.reporter}
            </p>

            {selected.status === "Pending" ? (
              <div className="flex justify-center gap-3">
                <button
                  onClick={reject}
                  className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
                >
                  Reject
                </button>
                <button
                  onClick={approve}
                  className="bg-[#2FA394] text-white py-2 px-4 rounded-lg hover:bg-[#278e82] transition"
                >
                  Approve
                </button>
              </div>
            ) : (
              <button
                onClick={closeModal}
                className="bg-[#2FA394] text-white py-2 px-4 rounded-lg hover:bg-[#278e82] transition"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
