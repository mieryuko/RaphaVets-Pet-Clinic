import React from 'react';
import { Users, Plus, Search } from 'lucide-react';

const Patients = () => {
  const patients = [
    { id: 1, name: 'Buddy', owner: 'John Doe', breed: 'Golden Retriever', lastVisit: '2024-01-15' },
    { id: 2, name: 'Mittens', owner: 'Jane Smith', breed: 'Siamese', lastVisit: '2024-01-14' },
    { id: 3, name: 'Rocky', owner: 'Mike Johnson', breed: 'German Shepherd', lastVisit: '2024-01-10' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Patient Management</h2>
          <p className="text-gray-600 mt-1">Manage your veterinary patients</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-[#5EE6FE] text-white rounded-xl hover:bg-[#4CD4EC] transition-colors font-medium">
          <Plus size={18} />
          Add Patient
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Active Patients</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search patients..."
              className="pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5EE6FE] focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="space-y-3">
          {patients.map(patient => (
            <div key={patient.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#5EE6FE] to-[#4CD4EC] rounded-full flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{patient.name}</p>
                  <p className="text-sm text-gray-600">{patient.owner} • {patient.breed}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Last Visit</p>
                <p className="text-sm font-medium text-gray-800">{patient.lastVisit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Patients;