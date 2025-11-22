import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  PawPrint,
  UserCheck,
  Clock,
  Brain,
  Stethoscope,
  View,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    vetName: "Dr. Eric",
    todayAppointments: 0,
    weeklyVisits: 0,
    totalOwners: 0,
    totalPets: 0,
  });
  const [loading, setLoading] = useState(true);

  // Simple mock data for appointments only
  const mockAppointmentData = {
    todayAppointments: 5,
    weeklyVisits: 10,
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        // Combine real data with mock appointment data
        setStats({
          ...response.data,
          todayAppointments: mockAppointmentData.todayAppointments,
          weeklyVisits: mockAppointmentData.weeklyVisits,
        });
      } catch (err) {
        console.error("❌ Failed to fetch dashboard stats:", err);
        // Use mock data as fallback
        setStats({
          vetName: "Dr. Eric",
          todayAppointments: mockAppointmentData.todayAppointments,
          weeklyVisits: mockAppointmentData.weeklyVisits,
          totalOwners: 0,
          totalPets: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const appointmentsData = [
    { day: "Mon", appointments: 8 },
    { day: "Tue", appointments: 12 },
    { day: "Wed", appointments: 6 },
    { day: "Thu", appointments: 14 },
    { day: "Fri", appointments: 10 },
    { day: "Sat", appointments: 4 },
  ];

  const upcomingAppointments = [
    { time: "09:00 AM", patient: "Max - Golden Retriever", service: "Annual Checkup" },
    { time: "10:30 AM", patient: "Bella - Siamese Cat", service: "Vaccination" },
    { time: "01:15 PM", patient: "Rocky - German Shepherd", service: "Injury Assessment" },
    { time: "03:00 PM", patient: "Luna - Persian Cat", service: "Dental Cleaning" },
    { time: "04:30 PM", patient: "Charlie - Beagle", service: "Skin Allergy" },
  ];

  const statCards = [
    { 
      title: "Today's Appointments", 
      value: loading ? "..." : stats.todayAppointments, 
      color: "from-[#E0F7FA] to-[#E5FBFF]",
      icon: Calendar,
    },
    { 
      title: "This Week's Visits", 
      value: loading ? "..." : stats.weeklyVisits, 
      color: "from-[#E8F5E9] to-[#F1FBF1]",
      icon: Users,
    },
    { 
      title: "Total Pet Owners", 
      value: loading ? "..." : stats.totalOwners, 
      color: "from-[#FFF8E1] to-[#FFFBEA]",
      icon: UserCheck,
    },
    { 
      title: "Total Pets Registered", 
      value: loading ? "..." : stats.totalPets, 
      color: "from-[#FCE4EC] to-[#FFF0F5]",
      icon: PawPrint,
    },
  ];

  const quickActions = [
    {
      title: "New Diagnostic",
      icon: <Brain size={18} />,
      color: "from-[#D6F6FF] to-[#E5FBFF]",
    },
    {
      title: "View Appointments",
      icon: <View size={18} />,
      color: "from-[#E0F8D8] to-[#EAFCE3]",
    },
    {
      title: "Patient Records",
      icon: <Users size={18} />,
      color: "from-[#FFF0D2] to-[#FFF9E5]",
    },
    {
      title: "Medical History",
      icon: <Stethoscope size={18} />,
      color: "from-[#FFDDEE] to-[#FFE6F5]",
    },
  ];

  return (
    <div className="flex bg-[#FBFBFB] dark:bg-[#101010] h-screen overflow-hidden">
      <main className="flex-1 p-4 flex flex-col justify-between">
        {/* ========== WELCOME SECTION ========== */}
        <div className="bg-gradient-to-r from-[#E5FBFF] to-[#FDFBFF] dark:from-[#1F1F1F] dark:to-[#232323] rounded-2xl p-4 mb-3 flex justify-between items-center shadow-sm border border-gray-100 dark:border-gray-800">
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Welcome back, {stats.adminName} 👋
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Here's your clinical overview for today at Rapha Vet Clinic.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-[#2A2A2A] px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <Clock size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* ========== MAIN GRID ========== */}
        <div className="grid grid-rows-[auto_auto_1fr] gap-3 flex-1 overflow-hidden">
          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${card.color} dark:from-[#1B1B1B] dark:to-[#222] rounded-2xl shadow-md border border-white/40 dark:border-gray-800 p-4 hover:scale-[1.02] transition-transform`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                        {card.title}
                      </p>
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-1">
                        {card.value}
                      </h2>
                    </div>
                    <Icon size={20} className="text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Quick Actions
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {quickActions.map((action, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${action.color} dark:from-[#1B1B1B] dark:to-[#222] 
                    rounded-xl p-3 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200 
                    cursor-pointer hover:brightness-105 hover:scale-101 transition duration-200`}
                >
                  {action.icon}
                  <span className="text-xs font-semibold">{action.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart + Today's Appointments */}
          <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
            {/* Chart */}
            <div className="col-span-2 bg-white dark:bg-[#181818] rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-4 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Weekly Appointments
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appointmentsData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5EE6FE" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#5EE6FE" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="5 5" stroke="#E5E7EB" className="dark:stroke-gray-700" />
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.9)",
                        borderRadius: "10px",
                        border: "1px solid #E5E7EB",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="appointments"
                      stroke="#5EE6FE"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      fill="url(#lineGradient)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Today's Appointments - Full Height */}
            <div className="col-span-1 flex flex-col min-h-0">
              <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 p-4 flex flex-col flex-1 min-h-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Today's Appointments
                  </h3>
                  <span className="text-xs text-[#5EE6FE] font-medium cursor-pointer hover:underline">
                    View All
                  </span>
                </div>

                {/* Scrollable appointments area */}
                <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-[#5EE6FE]/40 scrollbar-track-transparent">
                  <ul className="space-y-3">
                    {upcomingAppointments.map((appointment, i) => (
                      <li
                        key={i}
                        className="p-3 rounded-xl bg-gradient-to-r from-[#F0F9FF] to-[#E5FBFF] dark:from-[#1B1B1B] dark:to-[#222] 
                                  flex items-start justify-between gap-2 text-gray-800 dark:text-gray-200 
                                  border border-gray-100 dark:border-gray-800 hover:translate-x-0.5 hover:brightness-105 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full bg-[#5EE6FE] dark:bg-[#3BAFDA] mt-2 flex-shrink-0" />
                          <div className="flex flex-col">
                            <p className="font-medium text-sm">{appointment.time}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{appointment.patient}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{appointment.service}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;