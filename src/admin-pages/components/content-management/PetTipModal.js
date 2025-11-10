import { useState } from "react";
import { 
  Scissors, Dumbbell, Droplets, Bone, Puzzle, 
  Heart, Stethoscope, Utensils, Activity, Bath,
  Check, X, Plus, FileText, Globe, Eye, Archive
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
    url: item?.url || "",
    status: item?.status || "Draft"
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

  const handleStatusChange = (status) => {
    setFormData({ ...formData, status });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-semibold text-gray-800">
            {item ? "Edit Pet Tip" : "Create New Pet Tip"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex min-h-0">
          {/* Left Side - Basic Information */}
          <div className="flex-1 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-4">
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
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-sm"
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
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tip title"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category *</label>
                {!showNewCategory ? (
                  <div className="flex space-x-2">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(true)}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.newCategory}
                    onChange={(e) => setFormData({ ...formData, newCategory: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new category"
                  />
                )}
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Short Description *</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Brief description that appears in listings"
                  required
                />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Learn More URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/learn-more"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content & Status */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Status Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Publication Status</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Draft")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      formData.status === "Draft"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <FileText className={`h-5 w-5 ${
                      formData.status === "Draft" ? "text-blue-600" : "text-gray-400"
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.status === "Draft" ? "text-blue-600" : "text-gray-600"
                    }`}>
                      Draft
                    </span>
                    <span className="text-xs text-gray-500 text-center">Save for later editing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange("Published")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      formData.status === "Published"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <Eye className={`h-5 w-5 ${
                      formData.status === "Published" ? "text-green-600" : "text-gray-400"
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.status === "Published" ? "text-green-600" : "text-gray-600"
                    }`}>
                      Publish
                    </span>
                    <span className="text-xs text-gray-500 text-center">Make visible to users</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange("Archived")}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                      formData.status === "Archived"
                        ? "border-gray-500 bg-gray-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <Archive className={`h-5 w-5 ${
                      formData.status === "Archived" ? "text-gray-600" : "text-gray-400"
                    }`} />
                    <span className={`text-sm font-medium ${
                      formData.status === "Archived" ? "text-gray-600" : "text-gray-600"
                    }`}>
                      Archive
                    </span>
                    <span className="text-xs text-gray-500 text-center">Hide from users</span>
                  </button>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    formData.status === "Published" ? "bg-green-500" :
                    formData.status === "Draft" ? "bg-blue-500" : "bg-gray-500"
                  }`} />
                  <span className="text-sm text-gray-600">
                    Status: <span className="font-medium capitalize">{formData.status}</span>
                  </span>
                </div>
              </div>

              {/* Long Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Detailed Content *</label>
                <textarea
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write the full content of your pet care tip here..."
                  required
                />
              </div>

              {/* Preview Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Preview</label>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg border">
                      {(() => {
                        const SelectedIcon = iconOptions.find(opt => opt.value === selectedIcon)?.icon || FileText;
                        return <SelectedIcon className="h-5 w-5 text-blue-600" />;
                      })()}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{formData.title || "Title will appear here"}</h4>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {formData.category || "Category"}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formData.shortDescription || "Short description will appear here"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full ${
                formData.status === "Published" ? "bg-green-500" :
                formData.status === "Draft" ? "bg-blue-500" : "bg-gray-500"
              }`} />
              {formData.status === "Draft" && "This tip will be saved as draft"}
              {formData.status === "Published" && "This tip will be published immediately"}
              {formData.status === "Archived" && "This tip will be archived"}
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className={`px-6 py-2.5 rounded-lg text-white font-medium transition-colors duration-200 ${
                  formData.status === "Published" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : formData.status === "Archived"
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {formData.status === "Draft" && "Save as Draft"}
                {formData.status === "Published" && "Publish Now"}
                {formData.status === "Archived" && "Archive"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetTipModal;