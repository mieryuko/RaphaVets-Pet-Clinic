import React, { useState } from "react";
import { motion } from "framer-motion";

function DietFeedingSection() {
  const [meals, setMeals] = useState([
    { time: "8:00 AM", food: "Chicken & Rice" },
    { time: "6:00 PM", food: "Dry Kibble + Water" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newMeal, setNewMeal] = useState({ time: "", food: "" });

  const handleAddMeal = () => {
    if (!newMeal.time || !newMeal.food) return;
    setMeals([...meals, newMeal]);
    setNewMeal({ time: "", food: "" });
    setShowModal(false);
  };

  return (
    <div className="relative">
      {/* Add Button */}
      <button
        onClick={() => setShowModal(true)}
        className="absolute top-0 right-0 bg-[#5EE6FE] text-white p-2 rounded-full hover:bg-[#3ecbe0] shadow-md transition-all"
      >
        <i className="fa-solid fa-plus"></i>
      </button>

      {/* Meals List */}
      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {meals.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
          >
            <h4 className="font-semibold text-gray-800">{m.time}</h4>
            <p className="text-gray-600 text-sm">{m.food}</p>
          </motion.div>
        ))}
      </div>

      {/* Add Meal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Add Feeding</h3>
            <input
              type="text"
              placeholder="Time (e.g., 8:00 AM)"
              value={newMeal.time}
              onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 mb-3"
            />
            <input
              type="text"
              placeholder="Food (e.g., Chicken & Rice)"
              value={newMeal.food}
              onChange={(e) => setNewMeal({ ...newMeal, food: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            />
            <button
              onClick={handleAddMeal}
              className="bg-[#5EE6FE] text-white py-2 px-4 rounded-lg hover:bg-[#3ecbe0]"
            >
              Add Meal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DietFeedingSection;
