import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import api from "../../../api/axios";

const PdfModal = ({ isOpen, onClose, selectedRecord }) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
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
      setError(false);
      const response = await api.get(`/admin/pet-records/file/${fileName}`, {
        responseType: 'blob',
        timeout: 30000
      });
      
      if (response.data instanceof Blob) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        return blobUrl;
      } else {
        throw new Error('Invalid response type');
      }
    } catch (error) {
      console.error('Error fetching PDF for modal:', error);
      setError(true);
      return null;
    }
  };

  useEffect(() => {
    const fetchPdf = async () => {
      if (isOpen && selectedRecord && (selectedRecord.fileName || selectedRecord.storedName)) {
        setLoading(true);
        setError(false);
        
        // Clean up previous blob URL
        cleanupBlobUrl();
        
        try {
          const fileName = selectedRecord.fileName || selectedRecord.storedName;
          const blobUrl = await fetchPdfAsBlob(fileName);
          
          if (blobUrl) {
            currentBlobUrlRef.current = blobUrl;
            setPdfBlobUrl(blobUrl);
          } else {
            setPdfBlobUrl(null);
          }
        } catch (error) {
          console.error('Error loading PDF for modal:', error);
          setError(true);
          setPdfBlobUrl(null);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      fetchPdf();
    } else {
      // Clean up when modal closes
      cleanupBlobUrl();
      setLoading(false);
      setError(false);
    }
  }, [isOpen, selectedRecord]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupBlobUrl();
    };
  }, []);

  // Handle download with blob URL
  const handleDownload = () => {
    if (pdfBlobUrl) {
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = selectedRecord.originalName || selectedRecord.fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen || !selectedRecord) return null;

  const fileName = selectedRecord.originalName || selectedRecord.fileName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#181818] rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col p-4">
        {/* Header - Retained your design */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
            {fileName}
          </h3>
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p>Loading PDF...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-4">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" stroke-linejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-center mb-2">Failed to load PDF</p>
              <button
                onClick={() => {
                  const fileName = selectedRecord.fileName || selectedRecord.storedName;
                  if (fileName) {
                    fetchPdfAsBlob(fileName).then(blobUrl => {
                      if (blobUrl) {
                        cleanupBlobUrl();
                        currentBlobUrlRef.current = blobUrl;
                        setPdfBlobUrl(blobUrl);
                        setError(false);
                      }
                    });
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : pdfBlobUrl ? (
            <iframe
              src={pdfBlobUrl}
              title={fileName}
              className="w-full h-full"
              onError={() => setError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" stroke-linejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No file available</p>
            </div>
          )}
        </div>

        {/* Optional: Add download button at the bottom */}
        {pdfBlobUrl && !error && (
          <div className="flex justify-end mt-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfModal;