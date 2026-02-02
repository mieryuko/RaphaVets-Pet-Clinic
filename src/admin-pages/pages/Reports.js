import React, { useState, useEffect } from "react";
import Header from "../template/Header";
import {
  Calendar,
  MessageSquare,
  Users,
  PawPrint,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  UserCheck,
  FilePieChart,
} from "lucide-react";
import api from "../../api/axios";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [reports, setReports] = useState({
    appointments: [],
    feedbacks: [],
    users: [],
    pets: [],
    visits: [],
    lostPets: [],
    breedDetections: [],
  });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
    totalFeedback: 0,
    positiveFeedback: 0,
    averageRating: 0,
    userGrowth: 0,
    petGrowth: 0,
  });

  const tabs = [
    { id: "appointments", label: "Appointments", icon: <Calendar size={18} /> },
    { id: "feedbacks", label: "Feedbacks", icon: <MessageSquare size={18} /> },
    { id: "users", label: "Users", icon: <Users size={18} /> },
    { id: "pets", label: "Pets", icon: <PawPrint size={18} /> },
    { id: "visits", label: "Visits", icon: <FileText size={18} /> },
    { id: "lost-pets", label: "Lost Pets", icon: <AlertCircle size={18} /> },
  ];

  useEffect(() => {
    fetchReportsData();
  }, [dateRange, activeTab]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      // fetch appointment reports
      const appointmentRes = await api.get('/admin/reports/appointments', {
        params: { startDate: dateRange.start, endDate: dateRange.end }
      });
      
      // fetch feedback reports
      const feedbackRes = await api.get('/admin/reports/feedbacks', {
        params: { startDate: dateRange.start, endDate: dateRange.end }
      });
      
      // fetch user reports
      const userRes = await api.get('/admin/reports/users', {
        params: { startDate: dateRange.start, endDate: dateRange.end }
      });
      
      // fetch pet reports
      const petRes = await api.get('/admin/reports/pets', {
        params: { startDate: dateRange.start, endDate: dateRange.end }
      });
      
      // fetch visit reports
      const visitRes = await api.get('/admin/reports/visits', {
        params: { startDate: dateRange.start, endDate: dateRange.end }
      });
      
      // fetch lost pet reports
      const lostPetRes = await api.get('/admin/reports/lost-pets', {
        params: { startDate: dateRange.start, endDate: dateRange.end }
      });
      
      // fetch breed detection reports
      const breedRes = await api.get('/admin/reports/breed-detections', {
        params: { startDate: dateRange.start, endDate: dateRange.end }
      });

      setReports({
        appointments: appointmentRes.data || [],
        feedbacks: feedbackRes.data || [],
        users: userRes.data || [],
        pets: petRes.data || [],
        visits: visitRes.data || [],
        lostPets: lostPetRes.data || [],
        breedDetections: breedRes.data || [],
      });

      // statistics
      calculateStats(appointmentRes.data, feedbackRes.data, userRes.data, petRes.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointments, feedbacks, users, pets) => {
    // appointment statistics
    const totalAppointments = appointments?.length || 0;
    const completedAppointments = appointments?.filter(a => a.status === 'Completed')?.length || 0;
    const pendingAppointments = appointments?.filter(a => a.status === 'Pending')?.length || 0;
    const cancelledAppointments = appointments?.filter(a => a.status === 'Cancelled')?.length || 0;

    // feedback statistics
    const totalFeedback = feedbacks?.length || 0;
    const positiveFeedback = feedbacks?.filter(f => f.rating >= 4)?.length || 0;
    const averageRating = feedbacks?.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
      : 0;

    // user and pet  
    const userGrowth = users?.filter(u => {
      const userDate = new Date(u.createdAt);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return userDate >= monthAgo;
    })?.length || 0;

    const petGrowth = pets?.filter(p => {
      const petDate = new Date(p.createdAt);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return petDate >= monthAgo;
    })?.length || 0;

    setStats({
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      totalFeedback,
      positiveFeedback,
      averageRating,
      userGrowth,
      petGrowth,
    });
  };

  const exportReport = (format = 'csv') => {
    console.log(`Exporting ${activeTab} report as ${format}`);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'found':
        return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
      case 'pending':
      case 'in progress':
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
      case 'cancelled':
      case 'lost':
        return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
      case 'scheduled':
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const renderAppointmentsReport = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Appointment Details ({reports.appointments.length} records)
        </h3>
        <button
          onClick={() => exportReport('csv')}
          className="flex items-center gap-2 px-4 py-2 bg-[#5EE6FE] text-white rounded-lg hover:bg-[#4CD5ED] transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Veterinarian
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {reports.appointments.map((appointment, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {new Date(appointment.date).toLocaleDateString()} {appointment.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {appointment.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {appointment.petName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {appointment.service}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {appointment.veterinarian || 'Not assigned'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFeedbacksReport = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Customer Feedback ({reports.feedbacks.length} reviews)
        </h3>
        <button
          onClick={() => exportReport('pdf')}
          className="flex items-center gap-2 px-4 py-2 bg-[#5EE6FE] text-white rounded-lg hover:bg-[#4CD5ED] transition-colors"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {reports.feedbacks.map((feedback, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">{feedback.clientName}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(feedback.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{feedback.comment}</p>
            {feedback.suggestion && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Suggestion: {feedback.suggestion}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsersReport = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Registration Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pets
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Appointment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {reports.users.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-[#5EE6FE] dark:bg-[#2D88A5] rounded-full flex items-center justify-center">
                      <Users className="text-white" size={18} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {user.phone || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {user.petCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {user.lastAppointment ? new Date(user.lastAppointment).toLocaleDateString() : 'None'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPetsReport = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Breed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Age
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Visit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Health Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {reports.pets.map((pet, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-[#E8F5E9] to-[#F1FBF1] dark:from-[#1B1B1B] dark:to-[#222] rounded-full flex items-center justify-center">
                      <PawPrint className="text-gray-700 dark:text-gray-300" size={18} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {pet.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{pet.species}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {pet.ownerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {pet.breed || 'Mixed'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {pet.age} years
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {pet.lastVisit ? new Date(pet.lastVisit).toLocaleDateString() : 'No visits'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pet.healthStatus)}`}>
                    {pet.healthStatus || 'Good'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVisitsReport = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Visit Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pet & Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Service
              </th>
              <th className="px6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Diagnosis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Treatment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Follow-up
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {reports.visits.map((visit, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {new Date(visit.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {visit.petName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{visit.ownerName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {visit.service}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {visit.diagnosis || 'Routine check-up'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {visit.treatment || 'None prescribed'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {visit.followUpDate ? new Date(visit.followUpDate).toLocaleDateString() : 'Not required'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLostPetsReport = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.lostPets.map((pet, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">{pet.petName}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{pet.breed}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pet.status)}`}>
                {pet.status}
              </span>
            </div>
            <div className="mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">{pet.description}</p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>📅 Reported: {new Date(pet.reportedDate).toLocaleDateString()}</p>
              <p>📍 Location: {pet.location}</p>
              <p>👤 Contact: {pet.contactName} - {pet.contactPhone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBreedDetectionsReport = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Detection Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Detected Breed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actual Breed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Accuracy
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {reports.breedDetections.map((detection, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {new Date(detection.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {detection.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#E0F7FA] dark:bg-[#1B2B3B] text-[#0077B6] dark:text-[#5EE6FE]">
                    {detection.detectedBreed}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#5EE6FE] h-2 rounded-full" 
                        style={{ width: `${detection.confidence}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs">{detection.confidence}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {detection.actualBreed || 'Not specified'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    detection.accuracy === 'High' 
                      ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                      : detection.accuracy === 'Medium'
                      ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {detection.accuracy || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch(activeTab) {
      case 'appointments':
        return renderAppointmentsReport();
      case 'feedbacks':
        return renderFeedbacksReport();
      case 'users':
        return renderUsersReport();
      case 'pets':
        return renderPetsReport();
      case 'visits':
        return renderVisitsReport();
      case 'lost-pets':
        return renderLostPetsReport();
      case 'breed-detections':
        return renderBreedDetectionsReport();
      default:
        return renderAppointmentsReport();
    }
  };

  return (
    <div className="flex bg-[#FBFBFB] dark:bg-[#101010] min-h-screen">
      <main className="flex-1 p-4 flex flex-col">
        <Header title="Reports & Analytics" />
        
        {/* date range */}
        <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Generate Reports
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select date range and report type
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">From:</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">To:</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300"
                />
              </div>
              <button
                onClick={fetchReportsData}
                className="px-4 py-2 bg-[#5EE6FE] text-white rounded-lg hover:bg-[#4CD5ED] transition-colors flex items-center gap-2"
              >
                <Filter size={16} />
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* stats card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-gradient-to-br from-[#E0F7FA] to-[#E5FBFF] dark:from-[#1B1B1B] dark:to-[#222] rounded-2xl p-4 border border-white/40 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Total Appointments</p>
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  {stats.totalAppointments}
                </h3>
              </div>
              <div className="w-10 h-10 bg-[#5EE6FE]/20 dark:bg-[#5EE6FE]/30 rounded-full flex items-center justify-center">
                <Calendar className="text-[#5EE6FE]" size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <CheckCircle size={14} className="text-green-500 mr-1" />
              <span className="text-gray-600 dark:text-gray-400">{stats.completedAppointments} completed</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#E8F5E9] to-[#F1FBF1] dark:from-[#1B1B1B] dark:to-[#222] rounded-2xl p-4 border border-white/40 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Customer Feedback</p>
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  {stats.averageRating}/5
                </h3>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <MessageSquare className="text-green-600 dark:text-green-400" size={20} />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm">
              <TrendingUp size={14} className="text-green-500 mr-1" />
              <span className="text-gray-600 dark:text-gray-400">{stats.positiveFeedback} positive reviews</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#FFF8E1] to-[#FFFBEA] dark:from-[#1B1B1B] dark:to-[#222] rounded-2xl p-4 border border-white/40 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">New Users</p>
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  +{stats.userGrowth}
                </h3>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <UserCheck className="text-yellow-600 dark:text-yellow-400" size={20} />
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Last 30 days
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#FCE4EC] to-[#FFF0F5] dark:from-[#1B1B1B] dark:to-[#222] rounded-2xl p-4 border border-white/40 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Registered Pets</p>
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  +{stats.petGrowth}
                </h3>
              </div>
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                <PawPrint className="text-pink-600 dark:text-pink-400" size={20} />
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Last 30 days
            </div>
          </div>
        </div>

        {/* report tabs */}
        <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-4">
          <div className="flex overflow-x-auto pb-2 space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#5EE6FE] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* report content */}
        <div className="bg-white dark:bg-[#181818] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#5EE6FE] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading report data...</p>
              </div>
            </div>
          ) : reports[activeTab.replace('-', '')]?.length > 0 ? (
            renderReportContent()
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FilePieChart size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                No data available
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                No {activeTab.replace('-', ' ')} records found for the selected date range.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;