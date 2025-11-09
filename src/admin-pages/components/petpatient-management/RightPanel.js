const RightPanel = ({ activeTab, selectedOwner, selectedPet, selectedRecord, setIsPdfModalOpen }) => {
  if ((activeTab === "Pet Owners" && !selectedOwner) || (activeTab === "Pets" && !selectedPet)) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-gray-400 dark:text-gray-500">
        Select a {activeTab === "Pet Owners" ? "owner" : "pet"} to see details
      </div>
    );
  }

  return (
    <div className="w-1/3 bg-white dark:bg-[#181818] rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-6 flex flex-col min-h-0 overflow-y-auto">
      {activeTab === "Pet Owners" && selectedOwner && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{selectedOwner.name}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedOwner.id}</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Email</span>
              <span className="text-gray-800 dark:text-gray-200">{selectedOwner.email}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Phone</span>
              <span className="text-gray-800 dark:text-gray-200">{selectedOwner.phone}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Address</span>
              <span className="text-gray-800 dark:text-gray-200">123 Main St, City</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Sex</span>
              <span className="text-gray-800 dark:text-gray-200">Male</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Date of Birth</span>
              <span className="text-gray-800 dark:text-gray-200">Jan 1, 1990</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Pets</span>
              <span className="text-gray-800 dark:text-gray-200">Vanerie, Mark</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Account Created</span>
              <span className="text-gray-800 dark:text-gray-200">{selectedOwner.createdAt}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Pets" && selectedPet && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/images/sad-dog.png"
              alt={selectedPet.name}
              className="w-20 h-20 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
            />
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{selectedPet.name}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedPet.id}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Owner</span>
              <span className="text-gray-800 dark:text-gray-200">{selectedPet.owner}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Breed</span>
              <span className="text-gray-800 dark:text-gray-200">Labrador</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Age</span>
              <span className="text-gray-800 dark:text-gray-200">1 year</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Sex</span>
              <span className="text-gray-800 dark:text-gray-200">Female</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Weight</span>
              <span className="text-gray-800 dark:text-gray-200">12 kg</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Color</span>
              <span className="text-gray-800 dark:text-gray-200">Golden</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Date of Birth</span>
              <span className="text-gray-800 dark:text-gray-200">Mar 3, 2021</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-medium text-gray-600 dark:text-gray-400">Notes</span>
              <span className="text-gray-800 dark:text-gray-200">Allergy to teokbokki</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Lab/Medical Records" && selectedRecord && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-col flex-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {selectedRecord.petName} - {selectedRecord.type}
              </h3>
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#222]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600 dark:text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m0 8v3a2 2 0 002 2h3m8-16h3a2 2 0 012 2v3m0 8v3a2 2 0 01-2 2h-3" />
                </svg>
              </button>
            </div>
            <iframe
              src={`/${selectedRecord.fileName}`}
              title={selectedRecord.fileName}
              className="flex-1 w-full border rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPanel;
