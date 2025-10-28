import React, { useState } from "react";
import { motion } from "framer-motion";

function BehaviorNote() {
  const [notes, setNotes] = useState([
    "Friendly with other pets.",
    "Gets anxious during loud noises.",
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes([...notes, newNote]);
    setNewNote("");
    setShowModal(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowModal(true)}
        className="absolute top-0 right-0 bg-[#5EE6FE] text-white p-2 rounded-full hover:bg-[#3ecbe0] shadow-md transition-all"
      >
        <i className="fa-solid fa-plus"></i>
      </button>

      <ul className="list-disc list-inside mt-6 space-y-2 text-gray-700 text-sm">
        {notes.map((n, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {n}
          </motion.li>
        ))}
      </ul>

      {/* Add Note Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add Behavior Note</h3>
            <textarea
              placeholder="Write a short note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-3"
            ></textarea>
            <button
              onClick={handleAddNote}
              className="bg-[#5EE6FE] text-white py-2 px-4 rounded-lg hover:bg-[#3ecbe0]"
            >
              Add Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BehaviorNote;
