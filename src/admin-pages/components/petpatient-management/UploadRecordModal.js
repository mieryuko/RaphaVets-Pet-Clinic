// components/petpatient-management/UploadRecordModal.jsx
import { useState, useEffect } from 'react';
import api from '../../../api/axios';

const UploadRecordModal = ({
  isOpen,
  onClose,
  pets,
  searchQuery,
  setSearchQuery,
  selectedPet,
  setSelectedPet,
  setSuccessMessage,
  setErrorMessage,
  refreshRecords,
  editingItem
}) => {
  const [formData, setFormData] = useState({
    recordTitle: '',
    labTypeID: '1' // Default to Lab Record
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [labTypes, setLabTypes] = useState([]);

  // Fetch lab types on component mount
  useEffect(() => {
    const fetchLabTypes = async () => {
      try {
        const response = await api.get('/admin/pet-records/lab-types');
        if (response.data.success) {
          setLabTypes(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching lab types:', error);
      }
    };
    
    if (isOpen) {
      fetchLabTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        // Populate form for editing
        setFormData({
          recordTitle: editingItem.recordTitle || '',
          labTypeID: editingItem.labTypeID?.toString() || '1'
        });
        setFile(null);
      } else {
        // Reset form for new upload
        setFormData({ recordTitle: '', labTypeID: '1' });
        setFile(null);
        setSelectedPet(null);
      }
    }
  }, [isOpen, editingItem, setSelectedPet]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setErrorMessage('Please select a PDF file only.');
        e.target.value = '';
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setErrorMessage('File size must be less than 10MB.');
        e.target.value = '';
        return;
      }
      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    // Validation for new record
    if (!editingItem && !selectedPet) {
      setErrorMessage('Please select a pet.');
      return;
    }

    if (!formData.recordTitle.trim()) {
      setErrorMessage('Record title is required.');
      return;
    }

    if (!file && !editingItem) {
      setErrorMessage('Please select a PDF file to upload.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const uploadFormData = new FormData();
      
      if (editingItem) {
        // Editing existing record
        uploadFormData.append('recordTitle', formData.recordTitle);
        uploadFormData.append('labTypeID', formData.labTypeID);
        if (file) {
          uploadFormData.append('file', file);
        }

        const response = await api.put(`/admin/pet-records/medical-records/${editingItem.id}`, uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.success) {
          setSuccessMessage('Record updated successfully!');
          refreshRecords();
          onClose();
        }
      } else {
        // Creating new record - removed accID as it's not needed in backend
        uploadFormData.append('petID', selectedPet.petID);
        uploadFormData.append('recordTitle', formData.recordTitle);
        uploadFormData.append('labTypeID', formData.labTypeID);
        uploadFormData.append('file', file);

        const response = await api.post('/admin/pet-records/upload', uploadFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data.success) {
          setSuccessMessage('Record uploaded successfully!');
          refreshRecords();
          onClose();
          // Reset selection after successful upload
          setSelectedPet(null);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to upload record. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ recordTitle: '', labTypeID: '1' });
    setFile(null);
    setSelectedPet(null);
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"> {/* Added p-4 */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 w-[900px] max-w-full max-h-[85vh] flex gap-6 overflow-hidden"> {/* Removed shadow-xl, added overflow-hidden */}
        
        {/* Left Panel: Pet Selection */}
        <div className="flex-1 flex flex-col gap-4 border-r border-gray-200 dark:border-gray-700 pr-4 min-w-0 overflow-hidden"> {/* Added overflow-hidden */}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex-shrink-0">Select Pet</h3>
    
          <input
            type="text"
            placeholder="Search pet or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50 transition flex-shrink-0"
            disabled={!!editingItem}
          />

          {/* Scrollable Pet List */}
          <div className="flex-1 overflow-y-auto min-h-0"> {/* Added min-h-0 */}
            {pets.filter(p =>
              p.petName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.owner?.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 ? (
              <p className="text-gray-400 dark:text-gray-500 text-center mt-4">No pets found</p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {pets.filter(p =>
                  p.petName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.owner?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(pet => (
                  <li
                    key={pet.petID}
                    className={`p-2 rounded-lg cursor-pointer hover:bg-[#E5FBFF] dark:hover:bg-[#222] ${
                      selectedPet?.petID === pet.petID ? "bg-[#5EE6FE]/20 dark:bg-[#3BAFDA]/20" : ""
                    } ${editingItem ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !editingItem && setSelectedPet(pet)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                        {pet.petName || pet.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                        {pet.owner}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {pet.breed} • {pet.species}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Half: File Upload */}
        <div className="flex-1 flex flex-col gap-4 pl-4 min-w-0 overflow-hidden"> {/* Added min-w-0 and overflow-hidden */}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex-shrink-0">
            {editingItem ? 'Edit Medical Record' : 'Upload Medical Record'}
          </h3>

          {/* Selected Pet Info */}
          {(selectedPet || editingItem) ? (
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {editingItem ? editingItem.petName : (selectedPet.petName || selectedPet.name)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                  {editingItem ? editingItem.owner : selectedPet.owner}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                {editingItem ? 
                  `Type: ${editingItem.type}` : 
                  `${selectedPet.breed} • ${selectedPet.species}`
                }
              </div>
              {editingItem && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  Current file: {editingItem.fileName || editingItem.filePath}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-center py-4 flex-shrink-0">
              Select a pet from the left to upload a medical record
            </p>
          )}

          {/* Upload Form Card */}
          <div className="flex flex-col gap-4 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm overflow-y-auto min-h-0"> {/* Added overflow-y-auto and min-h-0 */}

            {/* Record Title */}
            <div className="flex flex-col flex-shrink-0">
              <label className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                Record Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="recordTitle"
                value={formData.recordTitle}
                onChange={handleInputChange}
                placeholder="e.g. Vaccination Record, Blood Test Results, X-ray Report"
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50 transition"
              />
            </div>

            {/* Type Selector */}
            <div className="flex flex-col flex-shrink-0">
              <label className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                Record Type <span className="text-red-500">*</span>
              </label>
              <select 
                name="labTypeID"
                value={formData.labTypeID}
                onChange={handleInputChange}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50 transition"
              >
                {labTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div className="flex flex-col flex-shrink-0">
              <label className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                {editingItem ? 'Update PDF File (Optional)' : 'Upload PDF File'} 
                {!editingItem && <span className="text-red-500"> *</span>}
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1B1B1B] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5EE6FE]/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#5EE6FE] file:text-gray-800 hover:file:bg-[#40c6e3] transition"
              />
              {file && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1 truncate">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Only PDF files are allowed (max 10MB).
                {editingItem && ' Leave empty to keep current file.'}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-auto pt-4 flex-shrink-0">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || (!editingItem && (!selectedPet || !file)) || !formData.recordTitle.trim()}
              className="px-4 py-2 rounded-lg bg-[#5EE6FE] hover:bg-[#40c6e3] text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {editingItem ? 'Updating...' : 'Uploading...'}
                </span>
              ) : (
                editingItem ? 'Update Record' : 'Upload Record'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadRecordModal;