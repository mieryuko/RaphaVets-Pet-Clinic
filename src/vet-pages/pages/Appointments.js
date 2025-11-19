import React from 'react';
import { Calendar, Clock, Users, TrendingUp } from 'lucide-react';

const Appointments = () => {
  const stats = [
    { label: 'Today', value: '12', change: '+2', icon: Calendar },
    { label: 'Upcoming', value: '28', change: '+5', icon: Clock },
    { label: 'Patients', value: '156', change: '+12', icon: Users },
    { label: 'Completion', value: '94%', change: '+3%', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">{stat.change} from yesterday</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Icon className="text-[#5EE6FE]" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              {/* Sample appointment items */}
              {[1, 2, 3].map(item => (
                <div key={item} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="w-3 h-12 bg-[#5EE6FE] rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">Buddy - Annual Checkup</p>
                        <p className="text-sm text-gray-600">John Doe • Golden Retriever</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        09:00 AM
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-[#5EE6FE] hover:bg-blue-50 transition-colors">
                <p className="font-medium text-gray-800">New Appointment</p>
                <p className="text-sm text-gray-600">Schedule a new visit</p>
              </button>
              <button className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-[#5EE6FE] hover:bg-blue-50 transition-colors">
                <p className="font-medium text-gray-800">Patient Lookup</p>
                <p className="text-sm text-gray-600">Find patient records</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
