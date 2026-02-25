import Header from "../template/Header";
import AppointmentsReport from "../components/reports/AppointmentsReport";
import UsersReport from "../components/reports/UsersReport";
import PetsReport from "../components/reports/PetsReport";
import VisitsReport from "../components/reports/VisitsReport";
import FeedbacksReport from "../components/reports/FeedbacksReport";
import LostPetsReport from "../components/reports/LostPetsReport";

const Reports = () => {
  return (
    <div className="bg-gray-50 dark:bg-[#0B0B0B] p-6 space-y-6">
      <Header title="Reports & Analytics" />

      <AppointmentsReport />
      <UsersReport />
      <PetsReport />
      <VisitsReport />
      <FeedbacksReport />
      <LostPetsReport />
    </div>
  );
};

export default Reports;