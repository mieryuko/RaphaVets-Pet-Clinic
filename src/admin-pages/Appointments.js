import React, { useState } from "react";

export default function Appointments() {
  // mock data — replace later with fetch("/api/admin/appointments")
  const [appointments, setAppointments] = useState([
    { id: 1, client: "Anna Dela Cruz", pet: "Milo 🐶", time: "09:30 AM", status: "Pending" },
    { id: 2, client: "Ben Santos", pet: "Luna 🐱", time: "11:00 AM", status: "Approved" },
    { id: 3, client: "Carla Reyes", pet: "Toby 🐕", time: "01:00 PM", status: "Pending" },
  ]);

  const [selected, setSelected] = useState(null); // appointment clicked
  const [action, setAction] = useState(null);     // "Approve" | "Cancel"

  const openModal = (appt, act) => {
    setSelected(appt);
    setAction(act);
  };

  const closeModal = () => {
    setSelected(null);
    setAction(null);
  };

  const handleConfirm = () => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === selected.id ? { ...a, status: action === "Approve" ? "Approved" : "Cancelled" } : a
      )
    );
    closeModal();
  };

  const statusClass = (s) => {
    if (s === "Approved") return "bg-green-100 text-green-700";
    if (s === "Cancelled") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[#2FA394]">Appointments</h2>

      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Pet</th>
              <th className="text-left px-4 py-3">Time</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{a.client}</td>
                <td className="px-4 py-3">{a.pet}</td>
                <td className="px-4 py-3">{a.time}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass(a.status)}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {a.status === "Pending" && (
                    <>
                      <button
                        onClick={() => openModal(a, "Approve")}
                        className="text-[#2FA394] hover:underline mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openModal(a, "Cancel")}
                        className="text-red-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {a.status !== "Pending" && (
                    <span className="text-gray-400 text-xs italic">No actions</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-[320px] shadow-xl text-center animate-popUp">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {action === "Approve" ? "Approve Appointment?" : "Cancel Appointment?"}
            </h2>
            <p className="text-gray-600 text-sm mb-5">
              Client <b>{selected.client}</b> with pet <b>{selected.pet}</b> at {selected.time}.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={closeModal}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-300"
              >
                No
              </button>
              <button
                onClick={handleConfirm}
                className={`py-2 px-4 rounded-lg text-white transition-all duration-300 ${
                  action === "Approve"
                    ? "bg-[#2FA394] hover:bg-[#278e82]"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                Yes, {action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
