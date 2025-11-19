import React from 'react';
import { FileText, Download, Upload, Search } from 'lucide-react';

const Records = () => {
  const recentRecords = [
    { id: 1, name: 'Blood Test Results', patient: 'Buddy', date: '2024-01-15', type: 'Lab' },
    { id: 2, name: 'Vaccination Record', patient: 'Mittens', date: '2024-01-14', type: 'Medical' },
    { id: 3, name: 'X-Ray Scan', patient: 'Rocky', date: '2024-01-13', type: 'Imaging' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Medical Records</h2>
          <p className="text-gray-600 mt-1">Access and manage patient medical records</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-[#5EE6FE] text-white rounded-xl hover:bg-[#4CD4EC] transition-colors font-medium">
          <Upload size={18} />
          Upload Records
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Records</h3>
          <div className="space-y-3">
            {recentRecords.map(record => (
              <div key={record.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{record.name}</p>
                    <p className="text-sm text-gray-600">{record.patient} • {record.date}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Record Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
              <span className="text-gray-700">Total Records</span>
              <span className="font-bold text-blue-600">1,247</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
              <span className="text-gray-700">This Month</span>
              <span className="font-bold text-green-600">48</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Records;