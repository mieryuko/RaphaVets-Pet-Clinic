const DeleteModal = ({ isOpen, onClose, onDelete, itemType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 w-96 shadow-xl flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Confirm Delete</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to delete this {itemType}?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222] transition"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-green-600 text-white font-semibold transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
