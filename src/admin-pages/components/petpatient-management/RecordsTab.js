// components/petpatient-management/RecordsTab.jsx
import { Edit2, Trash2, Eye } from "lucide-react";

const RecordsTab = ({ 
  records, 
  setSelectedRecord, 
  handleEditRecord, 
  handleDeleteRecordClick,
  isVetView
}) => {
  const handleViewRecord = (record, e) => {
    e.stopPropagation();
    // This would open the PDF viewer
    console.log('View record:', record);
    // You can implement PDF viewing logic here
  };

  return (
    <div className="flex flex-1 gap-4 min-h-0">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-[#1B1B1B] sticky top-0">
            <tr>
              <th className="p-2 text-sm text-gray-600 dark:text-gray-300">ID</th>
              <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Pet Name</th>
              <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Owner</th>
              <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Type</th>
              <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Record Title</th>
              <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Uploaded On</th>
              {!isVetView && <th className="p-2 text-sm text-gray-600 dark:text-gray-300">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr className="hover:bg-[#E5FBFF] dark:hover:bg-[#222] transition">
                <td colSpan={isVetView ? 6 : 7} className="text-center p-4 text-gray-400 dark:text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              records.map(record => (
                <tr
                  key={record.id}
                  className="hover:bg-[#E5FBFF] dark:hover:bg-[#222] transition cursor-pointer"
                  onClick={() => setSelectedRecord(record)}
                >
                  <td className="p-2 text-sm">{record.id}</td>
                  <td className="p-2 text-sm">{record.petName}</td>
                  <td className="p-2 text-sm">{record.owner}</td>
                  <td className="p-2 text-sm">{record.type}</td>
                  <td className="p-2 text-sm">{record.recordTitle}</td>
                  <td className="p-2 text-sm">{record.uploadedOn}</td>
                  {!isVetView && (
                    <td className="p-2 text-sm flex gap-2">
                      <Edit2
                        size={16}
                        className="text-blue-500 cursor-pointer hover:text-blue-600"
                        onClick={e => {
                          e.stopPropagation();
                          handleEditRecord(record);
                        }}
                      />
                      <Trash2
                        size={16}
                        className="text-red-500 cursor-pointer hover:text-red-600"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteRecordClick(record);
                        }}
                      />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordsTab;