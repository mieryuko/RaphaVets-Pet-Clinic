const PdfModal = ({ isOpen, onClose, fileName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#181818] rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{fileName}</h3>
          <button
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <iframe
          src={`/${fileName}`}
          title={fileName}
          className="w-full flex-1 border rounded-xl"
        />
      </div>
    </div>
  );
};

export default PdfModal;
