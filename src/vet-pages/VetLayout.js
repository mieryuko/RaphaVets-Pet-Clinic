import React, { useState } from "react";
import Sidebar from "./template/Sidebar";
import Header from "./template/Header";

// Import pages
import AppointmentsPage from "./pages/Appointments";
import DiagnosticTool from "./pages/DiagnosticTools";
import RecordsPage from "./pages/Records";
import PatientsPage from "./pages/Patients";
import SettingsPage from "./pages/Settings";

const VetLayout = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case "appointments":
        return <AppointmentsPage />;
      case "diagnostic":
        return <DiagnosticTool />;
      case "records":
        return <RecordsPage />;
      case "patients":
        return <PatientsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <AppointmentsPage />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      appointments: "Appointments & Schedule",
      diagnostic: "Diagnostic Tool", 
      records: "Medical Records",
      patients: "Patient Management",
      settings: "Settings"
    };
    return titles[activeTab] || "Veterinarian Dashboard";
  };

  const getPageSubtitle = () => {
    const subtitles = {
      appointments: "Manage appointments and patient visits",
      diagnostic: "AI-powered symptom analysis and diagnosis",
      records: "Access and manage medical records", 
      patients: "View and manage patient information",
      settings: "System preferences and configuration"
    };
    return subtitles[activeTab] || "Professional veterinary management system";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VetLayout;
