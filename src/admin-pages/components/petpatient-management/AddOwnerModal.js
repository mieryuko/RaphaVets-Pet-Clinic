import { useState, useEffect } from "react";
import { X, Copy, Check, AlertCircle } from "lucide-react";
import api from "../../../api/axios";

const AddOwnerModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [ownerData, setOwnerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    sex: "",
    dob: "",
  });

  const [petData, setPetData] = useState({
    type: "",
    breed: "",
    name: "",
    sex: "",
    weight: "",
    color: "",
    dob: "",
    notes: "",
  });

  const [step, setStep] = useState("form");
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  
  // State for breeds from database
  const [dogBreeds, setDogBreeds] = useState([]);
  const [catBreeds, setCatBreeds] = useState([]);
  const [loadingBreeds, setLoadingBreeds] = useState(false);

  // Enhanced date formatting function
  const formatDateForInput = (dateString) => {
    console.log("Formatting date:", dateString);
    
    if (!dateString || dateString === "Invalid Date" || dateString === "null") return "";
    
    try {
      let date;
      
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.log("Invalid date:", dateString);
        return "";
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "";
    }
  };

  // Fetch breeds from database
  const fetchBreeds = async (species) => {
    try {
      setLoadingBreeds(true);
      const response = await api.get(`/admin/breeds?species=${species}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${species} breeds:`, error);
      return [];
    } finally {
      setLoadingBreeds(false);
    }
  };

  // Load breeds when component mounts or when pet type changes
  useEffect(() => {
    const loadBreeds = async () => {
      if (!dogBreeds.length) {
        const dogBreedsData = await fetchBreeds('Dog');
        setDogBreeds(dogBreedsData);
      }
      if (!catBreeds.length) {
        const catBreedsData = await fetchBreeds('Cat');
        setCatBreeds(catBreedsData);
      }
    };

    if (isOpen) {
      loadBreeds();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      console.log("Initial data received:", initialData);
      
      if (initialData) {
        // Editing existing owner - split the name
        const nameParts = initialData.name ? initialData.name.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        console.log("Owner DOB from initialData:", initialData.dateOfBirth);
        console.log("Formatted DOB:", formatDateForInput(initialData.dateOfBirth));
        
        setOwnerData({
          firstName: firstName,
          lastName: lastName,
          email: initialData.email || "",
          phone: initialData.phone || "",
          address: initialData.address || "",
          sex: initialData.gender || "",
          dob: formatDateForInput(initialData.dateOfBirth) || "",
        });

        if (initialData.pets && initialData.pets[0]) {
          const pet = initialData.pets[0];
          console.log("Pet DOB:", pet.petDateOfBirth || pet.dob);
          
          setPetData({
            type: pet.petType || pet.type || "",
            breed: pet.breed || "",
            name: pet.petName || pet.name || "",
            sex: pet.petGender || pet.gender || pet.sex || "",
            weight: pet.weight ? pet.weight.replace(' kg', '') : "",
            color: pet.color || "",
            dob: formatDateForInput(pet.petDateOfBirth || pet.dob) || "",
            notes: pet.note || pet.notes || "",
          });
        } else {
          // Reset pet data if no pets
          setPetData({
            type: "",
            breed: "",
            name: "",
            sex: "",
            weight: "",
            color: "",
            dob: "",
            notes: "",
          });
        }
      } else {
        // New owner - reset all fields
        setOwnerData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          sex: "",
          dob: "",
        });
        setPetData({
          type: "",
          breed: "",
          name: "",
          sex: "",
          weight: "",
          color: "",
          dob: "",
          notes: "",
        });
        setStep("form");
        setGeneratedCredentials(null);
        setCopiedField(null);
        setErrors({});
        setApiError("");
      }
    }
  }, [initialData, isOpen]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) return "Please enter a valid phone number";
    if (phone.replace(/\D/g, '').length < 10) return "Phone number must be at least 10 digits";
    return "";
  };

  const validateName = (name, field) => {
    if (!name) return `${field} is required`;
    if (name.length < 2) return `${field} must be at least 2 characters`;
    if (!/^[a-zA-Z\s]+$/.test(name)) return `${field} can only contain letters and spaces`;
    return "";
  };

  const validateOwnerForm = () => {
    const newErrors = {};
    
    // Owner validations
    newErrors.firstName = validateName(ownerData.firstName, "First name");
    newErrors.lastName = validateName(ownerData.lastName, "Last name");
    newErrors.email = validateEmail(ownerData.email);
    newErrors.phone = validatePhone(ownerData.phone);
    
    // Date of birth validation (optional but if provided, must be valid)
    if (ownerData.dob) {
      const dobDate = new Date(ownerData.dob);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dob = "Date of birth cannot be in the future";
      }
    }

    // PET VALIDATIONS - REQUIRED FOR NEW OWNERS
    if (!initialData) {
      // Pet validations for NEW owners (required)
      newErrors.petName = validateName(petData.name, "Pet name");
      if (!petData.type) newErrors.petType = "Pet type is required";
      if (!petData.breed) newErrors.petBreed = "Breed is required";
      
      // Weight validation
      if (petData.weight) {
        const weight = parseFloat(petData.weight);
        if (isNaN(weight) || weight <= 0) {
          newErrors.petWeight = "Weight must be a positive number";
        } else if (weight > 200) {
          newErrors.petWeight = "Weight seems too high. Please verify.";
        }
      }

      // Date of birth validation for pet
      if (petData.dob) {
        const petDob = new Date(petData.dob);
        const today = new Date();
        if (petDob > today) {
          newErrors.petDob = "Pet date of birth cannot be in the future";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).filter(key => newErrors[key]).length === 0;
  };

  const handleOwnerChange = (field, value) => {
    setOwnerData({ ...ownerData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    // Clear API error when email changes
    if (field === "email" && apiError) {
      setApiError("");
    }
  };

  const handlePetChange = (field, value) => {
    // Don't allow pet changes when editing existing owner
    if (initialData) return;
    
    const updated = { ...petData, [field]: value };
    if (field === "type") updated.breed = "";
    setPetData(updated);
    
    // Clear error when user starts typing
    if (errors[`pet${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors(prev => ({ ...prev, [`pet${field.charAt(0).toUpperCase() + field.slice(1)}`]: "" }));
    }
  };

  const handleNext = () => {
    if (validateOwnerForm()) {
      setStep("review");
      setApiError(""); // Clear any previous API errors
    }
  };
  
  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setApiError("");
      
      // PET DATA IS REQUIRED FOR NEW OWNERS
      const safePetData = {
        type: petData.type || "",
        breed: petData.breed || "",
        name: petData.name || "",
        sex: petData.sex || "",
        weight: petData.weight || "",
        color: petData.color || "",
        dob: petData.dob || "",
        notes: petData.notes || "",
      };

      const safeOwnerData = {
        firstName: ownerData.firstName || "",
        lastName: ownerData.lastName || "",
        email: ownerData.email || "",
        phone: ownerData.phone || "",
        address: ownerData.address || "",
        sex: ownerData.sex || "",
        dob: ownerData.dob || "",
        // PETS ARE REQUIRED FOR NEW OWNERS
        pets: initialData ? [] : [safePetData] // Always include pet for new owners
      };

      // Call onSave and get the response
      const response = await onSave(safeOwnerData);
      
      if (initialData) {
        // Editing - just close the modal after success
        handleClose();
      } else {
        // Creating new owner - show credentials
        setGeneratedCredentials({
          email: response.email,
          password: response.password
        });
        
        // Move to success step to show credentials
        setStep("success");
        
        // Auto-close after 3 seconds to let user see the credentials
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
      
    } catch (error) {
      console.error("Error saving owner:", error);
      
      // Handle specific API errors
      if (error.response?.data?.message?.includes("Email already exists")) {
        setApiError("This email address is already registered. Please use a different email.");
        setStep("form");
      } else if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Failed to save owner. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    setOwnerData({ firstName: "", lastName: "", email: "", phone: "", address: "", sex: "", dob: "" });
    setPetData({ type: "", breed: "", name: "", sex: "", weight: "", color: "", dob: "", notes: "" });
    setGeneratedCredentials(null);
    setCopiedField(null);
    setErrors({});
    setApiError("");
    setIsLoading(false);
    onClose();
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (!isOpen) return null;

  const breedOptions = petData.type === "Dog" ? dogBreeds : petData.type === "Cat" ? catBreeds : [];
  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-[900px] h-[600px] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Edit Pet Owner" : "Add New Pet Owner"}
          </h2>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-white rounded-lg transition-colors duration-200"
            disabled={isLoading}
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* API Error Message */}
        {apiError && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{apiError}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-5 overflow-auto">
          {step === "form" && (
            <div className="flex h-full gap-6">
              {/* Owner Information - Left Side */}
              <div className="flex-1 space-y-4 border-r border-gray-200 pr-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
                    <h3 className="text-base font-semibold text-gray-800">Owner Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">First Name *</label>
                        <input 
                          type="text" 
                          value={ownerData.firstName} 
                          onChange={(e) => handleOwnerChange("firstName", e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.firstName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter first name"
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle size={12} />
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Last Name *</label>
                        <input 
                          type="text" 
                          value={ownerData.lastName} 
                          onChange={(e) => handleOwnerChange("lastName", e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.lastName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter last name"
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle size={12} />
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Email Address *</label>
                      <input 
                        type="email" 
                        value={ownerData.email} 
                        onChange={(e) => handleOwnerChange("email", e.target.value)}
                        className={`w-full px-2.5 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Phone Number *</label>
                      <input 
                        type="text" 
                        value={ownerData.phone} 
                        onChange={(e) => handleOwnerChange("phone", e.target.value)}
                        className={`w-full px-2.5 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter phone number"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Gender</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="owner-sex"
                              value="Male"
                              checked={ownerData.sex === "Male"}
                              onChange={(e) => handleOwnerChange("sex", e.target.value)}
                              className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Male</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="owner-sex"
                              value="Female"
                              checked={ownerData.sex === "Female"}
                              onChange={(e) => handleOwnerChange("sex", e.target.value)}
                              className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Female</span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Date of Birth</label>
                        <input 
                          type="date" 
                          value={ownerData.dob} 
                          onChange={(e) => handleOwnerChange("dob", e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.dob ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.dob && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle size={12} />
                            {errors.dob}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-700">Address</label>
                      <input 
                        type="text" 
                        value={ownerData.address} 
                        onChange={(e) => handleOwnerChange("address", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter address (optional)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pet Information - Right Side */}
              <div className="flex-1 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-green-500 rounded-full"></div>
                    <h3 className="text-base font-semibold text-gray-800">Pet Information</h3>
                    <span className="text-xs text-gray-500">
                      {isEditing ? "(View Only)" : "REQUIRED"}
                    </span>
                    {isEditing && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Use Add Pet modal to manage pets
                      </span>
                    )}
                  </div>
                  
                  {isEditing ? (
                    // View-only mode for editing
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-600">
                        <p className="mb-2">Pet information cannot be edited here. To add or edit pets for this owner:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-500">
                          <li>Use the "Add Pet" button in the Pets tab</li>
                          <li>Or edit existing pets from the Pets table</li>
                        </ul>
                      </div>
                      
                      {/* Display existing pet info if available */}
                      {petData.name && (
                        <div className="mt-4 p-3 bg-white rounded border">
                          <h4 className="font-medium text-gray-800 mb-2">Current Pet:</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="text-gray-600">Name:</span> {petData.name}</div>
                            <div><span className="text-gray-600">Type:</span> {petData.type}</div>
                            <div><span className="text-gray-600">Breed:</span> {petData.breed}</div>
                            <div><span className="text-gray-600">Gender:</span> {petData.sex}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // REQUIRED PET FIELDS FOR NEW OWNERS
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-700">Pet Type *</label>
                          <select 
                            value={petData.type} 
                            onChange={(e) => handlePetChange("type", e.target.value)}
                            className={`w-full px-2.5 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                              errors.petType ? 'border-red-300' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select type</option>
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                          </select>
                          {errors.petType && (
                            <p className="text-red-500 text-xs flex items-center gap-1">
                              <AlertCircle size={12} />
                              {errors.petType}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-700">Breed *</label>
                          <select 
                            value={petData.breed} 
                            onChange={(e) => handlePetChange("breed", e.target.value)}
                            className={`w-full px-2.5 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                              errors.petBreed ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={!petData.type}
                          >
                            <option value="">Select breed</option>
                            {breedOptions.map((breed, index) => (
                              <option key={index} value={breed}>{breed}</option>
                            ))}
                          </select>
                          {errors.petBreed && (
                            <p className="text-red-500 text-xs flex items-center gap-1">
                              <AlertCircle size={12} />
                              {errors.petBreed}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Pet Name *</label>
                        <input 
                          type="text" 
                          value={petData.name} 
                          onChange={(e) => handlePetChange("name", e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            errors.petName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter pet name"
                        />
                        {errors.petName && (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            <AlertCircle size={12} />
                            {errors.petName}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-700">Gender</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="pet-sex"
                                value="Male"
                                checked={petData.sex === "Male"}
                                onChange={(e) => handlePetChange("sex", e.target.value)}
                                className="w-4 h-4 text-green-500 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">Male</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="pet-sex"
                                value="Female"
                                checked={petData.sex === "Female"}
                                onChange={(e) => handlePetChange("sex", e.target.value)}
                                className="w-4 h-4 text-green-500 focus:ring-green-500"
                              />
                              <span className="text-sm text-gray-700">Female</span>
                            </label>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-700">Weight (kg)</label>
                          <input 
                            type="number" 
                            value={petData.weight} 
                            onChange={(e) => handlePetChange("weight", e.target.value)}
                            className={`w-full px-2.5 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                              errors.petWeight ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter weight"
                            step="0.1"
                            min="0"
                          />
                          {errors.petWeight && (
                            <p className="text-red-500 text-xs flex items-center gap-1">
                              <AlertCircle size={12} />
                              {errors.petWeight}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-700">Color</label>
                          <input 
                            type="text" 
                            value={petData.color} 
                            onChange={(e) => handlePetChange("color", e.target.value)}
                            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter color"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-gray-700">Date of Birth</label>
                          <input 
                            type="date" 
                            value={petData.dob} 
                            onChange={(e) => handlePetChange("dob", e.target.value)}
                            className={`w-full px-2.5 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                              errors.petDob ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.petDob && (
                            <p className="text-red-500 text-xs flex items-center gap-1">
                              <AlertCircle size={12} />
                              {errors.petDob}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Additional Notes</label>
                        <textarea 
                          value={petData.notes} 
                          onChange={(e) => handlePetChange("notes", e.target.value)}
                          className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          placeholder="Enter any additional notes (optional)"
                          rows="2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="h-full flex flex-col">
              <div className="text-center mb-2">
                <h3 className="text-md font-semibold text-gray-800">Review Information</h3>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-6">
                {/* Owner Details Card */}
                <div className="bg-white border border-gray-200 rounded-xl px-5 pt-4 pb-2 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100">
                    <div className="w-2 h-4 bg-blue-500 rounded-full"></div>
                    <h4 className="font-semibold text-gray-800 text-sm">Owner Details</h4>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Full Name:</span>
                      <span className="text-gray-800 font-semibold">{ownerData.firstName} {ownerData.lastName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Email:</span>
                      <span className="text-gray-800 font-semibold">{ownerData.email || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Phone:</span>
                      <span className="text-gray-800 font-semibold">{ownerData.phone || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Gender:</span>
                      <span className="text-gray-800 font-semibold">{ownerData.sex || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-600 font-medium">Date of Birth:</span>
                      <span className="text-gray-800 font-semibold">{ownerData.dob || "-"}</span>
                    </div>
                    <div className="flex justify-between items-start py-2">
                      <span className="text-gray-600 font-medium">Address:</span>
                      <span className="text-gray-800 font-semibold text-right max-w-[200px]">{ownerData.address || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Pet Details Card - Only show for new owners */}
                {!isEditing && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100">
                      <div className="w-2 h-4 bg-green-500 rounded-full"></div>
                      <h4 className="font-semibold text-gray-800 text-sm">Pet Details</h4>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-600 font-medium">Pet Name:</span>
                        <span className="text-gray-800 font-semibold">{petData.name || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-600 font-medium">Type:</span>
                        <span className="text-gray-800 font-semibold">{petData.type || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-600 font-medium">Breed:</span>
                        <span className="text-gray-800 font-semibold">{petData.breed || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-600 font-medium">Gender:</span>
                        <span className="text-gray-800 font-semibold">{petData.sex || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-600 font-medium">Weight:</span>
                        <span className="text-gray-800 font-semibold">{petData.weight ? `${petData.weight} kg` : "-"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-600 font-medium">Color:</span>
                        <span className="text-gray-800 font-semibold">{petData.color || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-600 font-medium">Date of Birth:</span>
                        <span className="text-gray-800 font-semibold">{petData.dob || "-"}</span>
                      </div>
                      <div className="flex justify-between items-start py-2">
                        <span className="text-gray-600 font-medium">Notes:</span>
                        <span className="text-gray-800 font-semibold text-right max-w-[200px]">{petData.notes || "-"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "success" && generatedCredentials && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-base">✓</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Owner Added Successfully!</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 max-w-md mx-auto">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">Login Credentials</h4>
                
                {/* Email */}
                <div className="flex items-center justify-between mb-3 bg-white p-3 rounded border">
                  <div className="text-left flex-1">
                    <p className="text-xs text-blue-600 font-medium">Email</p>
                    <p className="text-blue-800 font-mono text-sm break-all">{generatedCredentials.email}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.email, 'email')}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors ml-2"
                  >
                    {copiedField === 'email' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                
                {/* Password */}
                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="text-left flex-1">
                    <p className="text-xs text-blue-600 font-medium">Temporary Password</p>
                    <p className="text-blue-800 font-mono text-sm break-all">{generatedCredentials.password}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generatedCredentials.password, 'password')}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors ml-2"
                  >
                    {copiedField === 'password' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                These credentials have been sent to <strong>{generatedCredentials.email}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Please ask the owner to check their email and change their password after first login.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end gap-2">
            {step === "form" && (
              <>
                <button 
                  onClick={handleClose}
                  className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleNext}
                  className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
                >
                  Continue
                </button>
              </>
            )}
            
            {step === "review" && (
              <>
                <button 
                  onClick={() => setStep("form")}
                  className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="px-4 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Confirm & Save"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOwnerModal;