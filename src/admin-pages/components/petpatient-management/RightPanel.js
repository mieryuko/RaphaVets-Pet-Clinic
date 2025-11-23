import { useState, useEffect, useRef } from "react";
import api from "../../../api/axios";

const RightPanel = ({ 
  activeTab, 
  selectedOwner, 
  selectedPet, 
  selectedRecord, 
  setIsPdfModalOpen 
}) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  
  // Use ref to track current blob URL for cleanup
  const currentBlobUrlRef = useRef(null);

  // Clean up blob URL
  const cleanupBlobUrl = () => {
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }
    setPdfBlobUrl(null);
  };

  // Fetch PDF as blob
  const fetchPdfAsBlob = async (fileName) => {
    try {
      setPdfError(false);
      const response = await api.get(`/admin/pet-records/file/${fileName}`, {
        responseType: 'blob',
        timeout: 30000 // 30 second timeout
      });
      
      if (response.data instanceof Blob) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        return blobUrl;
      } else {
        throw new Error('Invalid response type');
      }
    } catch (error) {
      console.error('Error fetching PDF:', error);
      setPdfError(true);
      return null;
    }
  };

  // Fetch PDF when selectedRecord changes
  useEffect(() => {
    const fetchPdf = async () => {
      if (selectedRecord && (selectedRecord.fileName || selectedRecord.storedName || selectedRecord.filePath)) {
        setLoadingPdf(true);
        setPdfError(false);
        
        // Clean up previous blob URL
        cleanupBlobUrl();
        
        try {
          const fileName = selectedRecord.fileName || selectedRecord.storedName || selectedRecord.filePath;
          const blobUrl = await fetchPdfAsBlob(fileName);
          
          if (blobUrl) {
            currentBlobUrlRef.current = blobUrl;
            setPdfBlobUrl(blobUrl);
          } else {
            setPdfBlobUrl(null);
          }
        } catch (error) {
          console.error('Error loading PDF:', error);
          setPdfError(true);
          setPdfBlobUrl(null);
        } finally {
          setLoadingPdf(false);
        }
      } else {
        cleanupBlobUrl();
        setLoadingPdf(false);
        setPdfError(false);
      }
    };

    fetchPdf();
  }, [selectedRecord]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      cleanupBlobUrl();
    };
  }, []);

  // Handle PDF iframe error
  const handlePdfError = () => {
    console.error('Failed to load PDF in iframe');
    setPdfError(true);
  };

  // Handle PDF iframe load
  const handlePdfLoad = () => {
    setPdfError(false);
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };

  return (
    <div className="w-1/3 bg-white dark:bg-[#181818] rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-6 flex flex-col min-h-0 overflow-y-auto">
      {/* Pet Owners Details */}
      {activeTab === "Pet Owners" && selectedOwner && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {selectedOwner.firstName} {selectedOwner.lastName}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedOwner.accId || selectedOwner.id}</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Email</span>
              <span className="text-gray-800 dark:text-gray-200 text-right max-w-[60%] break-words">
                {selectedOwner.email || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Phone</span>
              <span className="text-gray-800 dark:text-gray-200">
                {formatPhone(selectedOwner.contactNo || selectedOwner.phone)}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Address</span>
              <span className="text-gray-800 dark:text-gray-200 text-right max-w-[60%]">
                {selectedOwner.address || 'No address provided'}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Gender</span>
              <span className="text-gray-800 dark:text-gray-200 capitalize">
                {selectedOwner.gender?.toLowerCase() || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Date of Birth</span>
              <span className="text-gray-800 dark:text-gray-200">
                {formatDate(selectedOwner.dateOfBirth || selectedOwner.dateOfBIrth)}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Pets</span>
              <span className="text-gray-800 dark:text-gray-200 text-right max-w-[60%]">
                {selectedOwner?.pets?.length
                  ? selectedOwner.pets.map(p => p.petName || p.name).join(", ")
                  : "No pets registered"}
              </span>
            </div>
            
            <div className="flex justify-between pt-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Account Created</span>
              <span className="text-gray-800 dark:text-gray-200">
                {formatDate(selectedOwner.createdAt)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pets Details */}
      {activeTab === "Pets" && selectedPet && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <img
              src={selectedPet.imageName || selectedPet.image || "/images/sad-dog.png"}
              alt={selectedPet.petName || selectedPet.name}
              className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
              onError={(e) => {
                e.target.src = "/images/sad-dog.png";
              }}
            />
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {selectedPet.petName || selectedPet.name}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ID: {selectedPet.petID || selectedPet.id}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Owner</span>
              <span className="text-gray-800 dark:text-gray-200 text-right max-w-[60%]">
                {selectedPet.owner || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Breed</span>
              <span className="text-gray-800 dark:text-gray-200 capitalize">
                {selectedPet.breed || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Species</span>
              <span className="text-gray-800 dark:text-gray-200 capitalize">
                {selectedPet.species || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Age</span>
              <span className="text-gray-800 dark:text-gray-200">
                {selectedPet.age || calculateAge(selectedPet.dateOfBirth) || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Gender</span>
              <span className="text-gray-800 dark:text-gray-200 capitalize">
                {selectedPet.petGender || selectedPet.gender || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Weight</span>
              <span className="text-gray-800 dark:text-gray-200">
                {selectedPet.weight_kg || selectedPet.weight 
                  ? `${selectedPet.weight_kg || selectedPet.weight} kg`
                  : 'N/A'
                }
              </span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Color</span>
              <span className="text-gray-800 dark:text-gray-200 capitalize">
                {selectedPet.color || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Date of Birth</span>
              <span className="text-gray-800 dark:text-gray-200">
                {formatDate(selectedPet.dateOfBirth || selectedPet.petDateOfBirth)}
              </span>
            </div>
            
            <div className="flex justify-between pt-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">Notes</span>
              <span className="text-gray-800 dark:text-gray-200 text-right max-w-[60%]">
                {selectedPet.note || 'No notes provided'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Lab/Medical Records Details */}
      {activeTab === "Lab/Medical Records" && (
        <div className="flex-1 flex flex-col min-h-0">
          {selectedRecord ? (
            <div className="flex flex-col flex-1 gap-4">
              {/* Record Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {selectedRecord.petName} - {selectedRecord.type}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedRecord.recordTitle}
                  </p>
                </div>
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"
                  title="Open in full screen"
                  disabled={!pdfBlobUrl || loadingPdf}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${(!pdfBlobUrl || loadingPdf) ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3" />
                  </svg>
                </button>
              </div>

              {/* Record Details */}
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Uploaded:</span>
                  <span className="text-gray-800 dark:text-gray-200">
                    {formatDate(selectedRecord.uploadedOn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">File:</span>
                  <span className="text-gray-800 dark:text-gray-200 text-right max-w-[60%] break-words">
                    {selectedRecord.originalName || selectedRecord.fileName || selectedRecord.filePath}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Owner:</span>
                  <span className="text-gray-800 dark:text-gray-200">
                    {selectedRecord.owner || 'N/A'}
                  </span>
                </div>
              </div>

              {/* PDF Preview */}
              <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-[#1B1B1B]">
                {loadingPdf ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-4">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-center">Loading PDF...</p>
                  </div>
                ) : pdfError ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-4">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-center mb-2">Failed to load PDF</p>
                    <button 
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      onClick={() => {
                        // Retry loading the PDF
                        const fileName = selectedRecord.fileName || selectedRecord.storedName || selectedRecord.filePath;
                        if (fileName) {
                          fetchPdfAsBlob(fileName).then(blobUrl => {
                            if (blobUrl) {
                              cleanupBlobUrl();
                              currentBlobUrlRef.current = blobUrl;
                              setPdfBlobUrl(blobUrl);
                              setPdfError(false);
                            }
                          });
                        }
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : pdfBlobUrl ? (
                  <iframe
                    key={pdfBlobUrl}
                    src={pdfBlobUrl}
                    title={selectedRecord.originalName || selectedRecord.fileName}
                    className="w-full h-full min-h-[400px]"
                    onError={handlePdfError}
                    onLoad={handlePdfLoad}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-4">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-center">No file available</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-400 dark:text-gray-500 p-4 text-center">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium mb-2">No Record Selected</p>
              <p className="text-sm">Select a medical record from the list to view details</p>
            </div>
          )}
        </div>
      )}

      {/* Empty States */}
      {((activeTab === "Pet Owners" && !selectedOwner) || 
        (activeTab === "Pets" && !selectedPet) ||
        (activeTab === "Lab/Medical Records" && !selectedRecord)) && (
        <div className="flex flex-col justify-center items-center h-full text-gray-400 dark:text-gray-500 p-4 text-center">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg font-medium mb-2">
            {activeTab === "Pet Owners" && "No Owner Selected"}
            {activeTab === "Pets" && "No Pet Selected"}
            {activeTab === "Lab/Medical Records" && "No Record Selected"}
          </p>
          <p className="text-sm">
            Select an item from the list to view details
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age > 0 ? `${age} year${age !== 1 ? 's' : ''}` : 'Less than 1 year';
  } catch {
    return null;
  }
};

export default RightPanel;