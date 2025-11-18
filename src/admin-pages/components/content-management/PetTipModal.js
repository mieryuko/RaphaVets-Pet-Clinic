import { useState, useEffect } from "react";
import { 
  Scissors, Dumbbell, Droplets, Bone, Puzzle, 
  Heart, Stethoscope, Utensils, Activity, Bath,
  Check, X, Plus, Minus, FileText, Globe, Eye, Archive
} from "lucide-react";
import api from "../../../api/axios";

// Enhanced helper function to map iconKey to Lucide component
const getIconComponent = (iconKey) => {
  const iconMap = {
    'scissors': Scissors,
    'dumbbell': Dumbbell,
    'droplets': Droplets,
    'bone': Bone,
    'puzzle': Puzzle,
    'heart': Heart,
    'stethoscope': Stethoscope,
    'utensils': Utensils,
    'activity': Activity,
    'bath': Bath,
    'Scissors': Scissors,
    'Dumbbell': Dumbbell,
    'Droplets': Droplets,
    'Bone': Bone,
    'Puzzle': Puzzle,
    'Heart': Heart,
    'Stethoscope': Stethoscope,
    'Utensils': Utensils,
    'Activity': Activity,
    'Bath': Bath
  };
  
  return iconMap[iconKey] || FileText;
};

// Helper functions for status mapping
const getStatusName = (statusId) => {
  const statusMap = {
    1: "Draft",
    2: "Published", 
    3: "Archived"
  };
  return statusMap[statusId] || "Draft";
};

const PetTipModal = ({ item, categories, icons, publicationStatuses, onClose, onSave, loading, onNewCategoryCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    detailedContent: "",
    learnMoreURL: "",
    iconID: "",
    petCareCategoryID: "",
    pubStatusID: 1,
    newCategory: ""
  });

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Helper function to get status ID from item
  const getStatusIdFromItem = (item) => {
    if (!item) return 1;
    
    console.log('Getting status ID from item:', {
      pubStatusID: item.pubStatusID,
      status: item.status
    });
    
    // Priority 1: Use pubStatusID if available
    if (item.pubStatusID) {
      return item.pubStatusID;
    }
    
    // Priority 2: Map status name to ID
    if (item.status) {
      const statusMap = {
        "Draft": 1,
        "Published": 2, 
        "Archived": 3
      };
      const mappedId = statusMap[item.status];
      console.log(`Mapped status "${item.status}" to ID:`, mappedId);
      return mappedId || 1;
    }
    
    // Priority 3: Default to Draft
    return 1;
  };

  // Helper function to get icon ID from item
  const getIconIdFromItem = (item, icons) => {
    if (!item) return icons?.[0]?.id?.toString() || "";
    
    console.log('Getting icon ID from item:', {
      iconID: item.iconID,
      icon: item.icon
    });
    
    // Priority 1: Use iconID if available
    if (item.iconID) {
      return item.iconID.toString();
    }
    
    // Priority 2: Map icon name to ID
    if (item.icon && icons) {
      const matchingIcon = icons.find(icon => 
        icon.iconName === item.icon || 
        icon.iconKey === item.icon ||
        icon.name === item.icon
      );
      if (matchingIcon) {
        console.log(`Mapped icon "${item.icon}" to ID:`, matchingIcon.id);
        return matchingIcon.id.toString();
      } else {
        console.log(`No matching icon found for: "${item.icon}"`);
        console.log('Available icons:', icons.map(i => ({ id: i.id, name: i.iconName, key: i.iconKey })));
      }
    }
    
    // Priority 3: Default to first icon
    if (icons && icons.length > 0) {
      return icons[0].id.toString();
    }
    
    // Priority 4: Fallback
    return "";
  };

  // Helper function to get category ID from item
  const getCategoryIdFromItem = (item, categories) => {
    if (!item) return categories?.[0]?.id?.toString() || "";
    
    console.log('Getting category ID from item:', {
      petCareCategoryID: item.petCareCategoryID,
      category: item.category
    });
    
    // Priority 1: Use petCareCategoryID if available
    if (item.petCareCategoryID) {
      return item.petCareCategoryID.toString();
    }
    
    // Priority 2: Map category name to ID
    if (item.category && categories) {
      const matchingCategory = categories.find(cat => 
        cat.name === item.category || 
        cat.categoryName === item.category
      );
      if (matchingCategory) {
        console.log(`Mapped category "${item.category}" to ID:`, matchingCategory.id);
        return matchingCategory.id.toString();
      } else {
        console.log(`No matching category found for: "${item.category}"`);
        console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
      }
    }
    
    // Priority 3: Default to first category
    if (categories && categories.length > 0) {
      return categories[0].id.toString();
    }
    
    // Priority 4: Fallback
    return "";
  };

  // Initialize form data when item or props change
  useEffect(() => {
    console.log('=== INITIALIZING PET TIP MODAL ===');
    console.log('Item:', item);
    console.log('Item iconID:', item?.iconID);
    console.log('Item icon:', item?.icon);
    console.log('Item petCareCategoryID:', item?.petCareCategoryID);
    console.log('Item category:', item?.category);
    console.log('Item pubStatusID:', item?.pubStatusID);
    console.log('Item status:', item?.status);
    console.log('Available icons:', icons);
    console.log('Available categories:', categories);
    console.log('Available publicationStatuses:', publicationStatuses);

    if (item) {
      // Editing existing item - use the item's actual values
      console.log('=== EDITING MODE ===');

      // Get the correct values
      const initialIconID = getIconIdFromItem(item, icons);
      const initialPubStatusID = getStatusIdFromItem(item);
      const initialCategoryID = getCategoryIdFromItem(item, categories);

      console.log('Determined values:', {
        iconID: initialIconID,
        pubStatusID: initialPubStatusID,
        categoryID: initialCategoryID
      });

      setFormData({
        title: item.title || "",
        shortDescription: item.shortDescription || "",
        detailedContent: item.detailedContent || "",
        learnMoreURL: item.learnMoreURL || "",
        iconID: initialIconID,
        petCareCategoryID: initialCategoryID,
        pubStatusID: initialPubStatusID,
        newCategory: ""
      });
      
      setSelectedIcon(initialIconID);
      setShowNewCategory(false);
      
      console.log('=== FINAL FORM DATA SET ===', {
        iconID: initialIconID,
        petCareCategoryID: initialCategoryID,
        pubStatusID: initialPubStatusID
      });

    } else {
      // Creating new item - use defaults only if props are available
      console.log('=== CREATING NEW ITEM ===');
      const defaultIconID = icons?.[0]?.id ? icons[0].id.toString() : "";
      const defaultCategoryID = categories?.[0]?.id ? categories[0].id.toString() : "";
      
      setFormData({
        title: "",
        shortDescription: "",
        detailedContent: "",
        learnMoreURL: "",
        iconID: defaultIconID,
        petCareCategoryID: defaultCategoryID,
        pubStatusID: 1,
        newCategory: ""
      });
      setSelectedIcon(defaultIconID);
      setShowNewCategory(false);
    }
  }, [item, icons, categories, publicationStatuses]);

  // Function to create a new category
  const createNewCategory = async (categoryName) => {
    try {
      setCategoryLoading(true);
      console.log('=== DEBUG CATEGORY CREATION ===');
      console.log('Category name to create:', categoryName);
      
      const response = await api.post('/admin/content/pet-care-tips/createCategory', {
        categoryName: categoryName.trim()
      });

      console.log('Category creation API response:', response);
      console.log('Response data:', response.data);

      if (response.data.success) {
        console.log('New category created successfully:', response.data.data);
        if (onNewCategoryCreated) {
          onNewCategoryCreated(response.data.data);
        }
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    } finally {
      setCategoryLoading(false);
    }
  };

  // COMPLETE handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== DEBUG PETTIPMODAL SUBMIT ===');
    console.log('Form data state:', formData);
    console.log('Selected icon:', selectedIcon);
    console.log('Show new category:', showNewCategory);

    // Validate required fields
    const requiredFields = {
      title: formData.title.trim(),
      shortDescription: formData.shortDescription.trim(),
      detailedContent: formData.detailedContent.trim(),
      iconID: formData.iconID
    };

    // Category validation depends on mode
    if (showNewCategory) {
      if (!formData.newCategory.trim()) {
        alert('Please enter a new category name');
        return;
      }
    } else {
      if (!formData.petCareCategoryID) {
        alert('Please select a category');
        return;
      }
    }

    // Check for empty required fields
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      let finalCategoryID;

      // If creating a new category, create it first
      if (showNewCategory && formData.newCategory.trim()) {
        console.log('Creating new category:', formData.newCategory);
        const newCategory = await createNewCategory(formData.newCategory);
        console.log('New category result:', newCategory);
        
        // Double-check the category ID
        if (!newCategory || !newCategory.id) {
          throw new Error('Category was created but no ID was returned');
        }
        
        finalCategoryID = newCategory.id;
        console.log('Using new category ID:', finalCategoryID);
      } else {
        finalCategoryID = formData.petCareCategoryID;
        console.log('Using existing category ID:', finalCategoryID);
      }

      console.log('Final category ID:', finalCategoryID);
      console.log('Final category ID type:', typeof finalCategoryID);

      // Validate finalCategoryID
      if (!finalCategoryID || isNaN(parseInt(finalCategoryID))) {
        console.error('Invalid category ID:', finalCategoryID);
        alert('Invalid category ID. Please try again.');
        return;
      }

      // Prepare data for backend - ensure all fields are properly formatted
      const submitData = {
        title: formData.title.trim(),
        shortDescription: formData.shortDescription.trim(),
        detailedContent: formData.detailedContent.trim(),
        learnMoreURL: formData.learnMoreURL.trim(),
        iconID: parseInt(formData.iconID),
        petCareCategoryID: parseInt(finalCategoryID),
        pubStatusID: parseInt(formData.pubStatusID)
      };

      console.log('Final submit data:', submitData);

      // Validate all numbers are valid
      if (isNaN(submitData.iconID)) {
        throw new Error('Invalid icon ID');
      }
      if (isNaN(submitData.petCareCategoryID)) {
        throw new Error('Invalid category ID: ' + finalCategoryID);
      }
      if (isNaN(submitData.pubStatusID)) {
        throw new Error('Invalid publication status ID');
      }

      console.log('All data validated, calling onSave...');
      onSave(submitData);

    } catch (error) {
      console.error('Error in form submission:', error);
      alert(error.response?.data?.message || error.message || 'Failed to save. Please try again.');
    }
  };

  const handleIconSelect = (iconId) => {
    console.log('Icon selected:', iconId);
    setSelectedIcon(iconId);
    setFormData(prev => ({ ...prev, iconID: iconId }));
  };

  const handleStatusChange = (statusId) => {
    console.log('Status changed to:', statusId);
    setFormData(prev => ({ ...prev, pubStatusID: statusId }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategoryMode = () => {
    setShowNewCategory(!showNewCategory);
    // Reset the other field when switching modes
    if (showNewCategory) {
      // Switching from new category to dropdown
      setFormData(prev => ({ ...prev, newCategory: "" }));
    } else {
      // Switching from dropdown to new category
      setFormData(prev => ({ ...prev, petCareCategoryID: "" }));
    }
  };

  // Get current status name for display
  const currentStatusName = getStatusName(formData.pubStatusID);

  // Get current icon for preview
  const currentIcon = icons?.find(icon => {
    const iconId = parseInt(selectedIcon);
    return icon.id === iconId;
  });
  const CurrentIconComponent = currentIcon ? getIconComponent(currentIcon.iconKey) : FileText;

  // Get current category name for preview
  const currentCategory = categories?.find(cat => {
    const categoryId = parseInt(formData.petCareCategoryID);
    return cat.id === categoryId;
  });
  const currentCategoryName = currentCategory ? currentCategory.name : 
                            formData.newCategory ? formData.newCategory : "Uncategorized";

  // Safe icon rendering with fallback
  const renderIconGrid = () => {
    if (!icons || icons.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          No icons available
        </div>
      );
    }

    console.log('Rendering icon grid - selectedIcon:', selectedIcon);
    console.log('Available icons for grid:', icons.map(i => ({ 
      id: i.id, 
      name: i.iconName, 
      selected: parseInt(selectedIcon) === i.id 
    })));

    return (
      <div className="grid grid-cols-5 gap-3">
        {icons.map((icon) => {
          const IconComponent = getIconComponent(icon.iconKey);
          const isSelected = parseInt(selectedIcon) === icon.id;
          
          console.log(`Icon ${icon.id} (${icon.iconName}): selected=${isSelected}, current selected=${selectedIcon}`);
          
          return (
            <button
              key={icon.id}
              type="button"
              onClick={() => handleIconSelect(icon.id)}
              disabled={loading}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <IconComponent className={`h-6 w-6 ${
                isSelected ? "text-blue-600" : "text-gray-600"
              }`} />
              <span className={`text-xs mt-2 ${
                isSelected ? "text-blue-600 font-medium" : "text-gray-600"
              }`}>
                {icon.iconName || icon.name || 'Unknown'}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // Safe status rendering
  const renderStatusButtons = () => {
    if (!publicationStatuses || publicationStatuses.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          No status options available
        </div>
      );
    }

    console.log('Rendering status buttons - current pubStatusID:', formData.pubStatusID);
    console.log('Available statuses:', publicationStatuses.map(s => ({ 
      id: s.id, 
      name: s.name, 
      selected: formData.pubStatusID === s.id 
    })));

    return (
      <div className="grid grid-cols-3 gap-3">
        {publicationStatuses.map((status) => {
          const isSelected = formData.pubStatusID === status.id;
          
          console.log(`Status ${status.id}: ${status.name}, selected: ${isSelected}, current status: ${formData.pubStatusID}`);
          
          return (
            <button
              key={status.id}
              type="button"
              onClick={() => handleStatusChange(status.id)}
              disabled={loading}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                isSelected
                  ? status.id === 1 ? "border-blue-500 bg-blue-50" :
                    status.id === 2 ? "border-green-500 bg-green-50" :
                    "border-gray-500 bg-gray-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {status.id === 1 && <FileText className={`h-5 w-5 ${isSelected ? "text-blue-600" : "text-gray-400"}`} />}
              {status.id === 2 && <Eye className={`h-5 w-5 ${isSelected ? "text-green-600" : "text-gray-400"}`} />}
              {status.id === 3 && <Archive className={`h-5 w-5 ${isSelected ? "text-gray-600" : "text-gray-400"}`} />}
              <span className={`text-sm font-medium ${
                isSelected 
                  ? status.id === 1 ? "text-blue-600" :
                    status.id === 2 ? "text-green-600" :
                    "text-gray-600"
                  : "text-gray-600"
              }`}>
                {status.name}
              </span>
              <span className="text-xs text-gray-500 text-center">{status.description}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // Category rendering with toggle
  const renderCategorySelect = () => {
    console.log('Rendering category select - current categoryID:', formData.petCareCategoryID);
    console.log('Available categories:', categories?.map(c => ({ 
      id: c.id, 
      name: c.name, 
      selected: formData.petCareCategoryID === c.id.toString() 
    })));

    return (
      <div className="flex space-x-2">
        {showNewCategory ? (
          <input
            type="text"
            value={formData.newCategory}
            onChange={(e) => handleInputChange('newCategory', e.target.value)}
            disabled={loading || categoryLoading}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            placeholder="Enter new category name"
          />
        ) : (
          <select
            value={formData.petCareCategoryID}
            onChange={(e) => handleInputChange('petCareCategoryID', e.target.value)}
            disabled={loading || !categories || categories.length === 0}
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            required={!showNewCategory}
          >
            <option value="">Select category</option>
            {categories?.map((cat) => {
              const isSelected = formData.petCareCategoryID === cat.id.toString();
              console.log(`Category ${cat.id} (${cat.name}): selected=${isSelected}`);
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              );
            })}
          </select>
        )}
        
        <button
          type="button"
          onClick={toggleCategoryMode}
          disabled={loading || categoryLoading}
          className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
        >
          {showNewCategory ? (
            <Minus size={16} className="text-red-500" />
          ) : (
            <Plus size={16} className="text-green-500" />
          )}
        </button>
      </div>
    );
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
            disabled={loading}
            className="p-2 hover:bg-white rounded-lg transition-colors duration-200 disabled:opacity-50"
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
                <label className="text-sm font-medium text-gray-700">Select Icon *</label>
                {renderIconGrid()}
                {!formData.iconID && (
                  <p className="text-red-500 text-xs">Please select an icon</p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter tip title"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category *</label>
                {renderCategorySelect()}
                {!formData.petCareCategoryID && !showNewCategory && (
                  <p className="text-red-500 text-xs">Please select a category</p>
                )}
                {showNewCategory && !formData.newCategory && (
                  <p className="text-red-500 text-xs">Please enter a category name</p>
                )}
                <p className="text-xs text-gray-500">
                  {showNewCategory 
                    ? "Enter a new category name" 
                    : "Select an existing category or click + to add new"}
                </p>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Short Description *</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
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
                    value={formData.learnMoreURL}
                    onChange={(e) => handleInputChange('learnMoreURL', e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                {renderStatusButtons()}

                {/* Status Indicator */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    formData.pubStatusID === 2 ? "bg-green-500" :
                    formData.pubStatusID === 1 ? "bg-blue-500" : "bg-gray-500"
                  }`} />
                  <span className="text-sm text-gray-600">
                    Status: <span className="font-medium capitalize">{currentStatusName}</span>
                  </span>
                </div>
              </div>

              {/* Long Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Detailed Content *</label>
                <textarea
                  value={formData.detailedContent}
                  onChange={(e) => handleInputChange('detailedContent', e.target.value)}
                  disabled={loading}
                  rows={8}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
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
                      <CurrentIconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{formData.title || "Title will appear here"}</h4>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {currentCategoryName}
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
                formData.pubStatusID === 2 ? "bg-green-500" :
                formData.pubStatusID === 1 ? "bg-blue-500" : "bg-gray-500"
              }`} />
              {formData.pubStatusID === 1 && "This tip will be saved as draft"}
              {formData.pubStatusID === 2 && "This tip will be published immediately"}
              {formData.pubStatusID === 3 && "This tip will be archived"}
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || categoryLoading}
                className={`px-6 py-2.5 rounded-lg text-white font-medium transition-colors duration-200 flex items-center gap-2 ${
                  formData.pubStatusID === 2 
                    ? "bg-green-600 hover:bg-green-700" 
                    : formData.pubStatusID === 3
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } ${(loading || categoryLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {(loading || categoryLoading) && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {formData.pubStatusID === 1 && ((loading || categoryLoading) ? "Saving..." : "Save as Draft")}
                {formData.pubStatusID === 2 && ((loading || categoryLoading) ? "Publishing..." : "Publish Now")}
                {formData.pubStatusID === 3 && ((loading || categoryLoading) ? "Archiving..." : "Archive")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetTipModal;