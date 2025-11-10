import { useState } from "react";
import { 
  Scissors, Dumbbell, Droplets, Bone, Puzzle, 
  Heart, Stethoscope, Utensils, Activity, Bath,
  Check, X, Plus, FileText
} from "lucide-react";

// Icon options for pet tips
const iconOptions = [
  { icon: Scissors, name: "Scissors", value: "scissors" },
  { icon: Dumbbell, name: "Exercise", value: "dumbbell" },
  { icon: Droplets, name: "Water", value: "droplets" },
  { icon: Bone, name: "Nutrition", value: "bone" },
  { icon: Puzzle, name: "Mental", value: "puzzle" },
  { icon: Heart, name: "Health", value: "heart" },
  { icon: Stethoscope, name: "Vet", value: "stethoscope" },
  { icon: Utensils, name: "Food", value: "utensils" },
  { icon: Activity, name: "Activity", value: "activity" },
  { icon: Bath, name: "Hygiene", value: "bath" },
];

const PetTipModal = ({ item, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    icon: item?.icon || "scissors",
    category: item?.category || "",
    newCategory: "",
    title: item?.title || "",
    shortDescription: item?.shortDescription || "",
    longDescription: item?.longDescription || "",
    url: item?.url || ""
  });

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(item?.icon || "scissors");

  const handleSubmit = (e) => {
    e.preventDefault();
    const category = showNewCategory ? formData.newCategory : formData.category;
    const finalData = { ...formData, category, icon: selectedIcon };
    onSave(finalData);
  };

  const handleIconSelect = (iconValue) => {
    setSelectedIcon(iconValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-semibold text-gray-800">
            {item ? "Edit Pet Tip" : "Add New Pet Tip"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* Icon Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Select Icon</label>
            <div className="grid grid-cols-5 gap-3">
              {iconOptions.map((iconOption) => {
                const IconComponent = iconOption.icon;
                const isSelected = selectedIcon === iconOption.value;
                
                return (
                  <button
                    key={iconOption.value}
                    type="button"
                    onClick={() => handleIconSelect(iconOption.value)}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 relative ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className={`h-6 w-6 ${
                      isSelected ? "text-blue-600" : "text-gray-600"
                    }`} />
                    <span className={`text-xs mt-2 ${
                      isSelected ? "text-blue-600 font-medium" : "text-gray-600"
                    }`}>
                      {iconOption.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <div className="bg-blue-500 rounded-full p-0.5">
                          <Check size={12} className="text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              {!showNewCategory ? (
                <div className="flex space-x-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={formData.newCategory}
                  onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new category"
                />
              )}
            </div>

            {/* Preview Icon */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Icon Preview</label>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                {(() => {
                  const SelectedIcon = iconOptions.find(opt => opt.value === selectedIcon)?.icon || FileText;
                  return <SelectedIcon className="h-6 w-6 text-blue-600" />;
                })()}
                <span className="text-sm text-gray-600 capitalize">{selectedIcon}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tip title"
              required
            />
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Short Description</label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description that appears on the card"
              required
            />
          </div>

          {/* Long Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Detailed Description</label>
            <textarea
              value={formData.longDescription}
              onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Detailed explanation of the pet care tip..."
              required
            />
          </div>

          {/* URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Learn More URL (Optional)</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/learn-more"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-medium"
            >
              {item ? "Update" : "Create"} Pet Tip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetTipModal;