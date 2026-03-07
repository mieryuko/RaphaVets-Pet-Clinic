import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import Header from "../template/Header";
import DateRangePicker from "../components/reports/DateRangePicker";
import ChartConfig from "../components/reports/ChartConfig";
import AppointmentsReport from "../components/reports/AppointmentsReport";
import UsersReport from "../components/reports/UsersReport";
import PetsReport from "../components/reports/PetsReport";
import VisitsReport from "../components/reports/VisitsReport";
import FeedbacksReport from "../components/reports/FeedbacksReport";
import LostPetsReport from "../components/reports/LostPetsReport";
import SuccessToast from "../../template/SuccessToast";
import ErrorToast from "../../template/ErrorToast";

const Reports = () => {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [isExporting, setIsExporting] = useState(false);
  const [exportToast, setExportToast] = useState(null);
  const reportsRef = useRef(null);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    console.log('Date range changed:', range);
  };

  const exportToPDF = async () => {
    if (!reportsRef.current) return;
    
    setIsExporting(true);
    
    try {
      const element = reportsRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#f9fafb',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('reports-container');
          if (clonedElement) {
            clonedElement.style.width = `${element.scrollWidth}px`;
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width * 0.75, canvas.height * 0.75]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width * 0.75, canvas.height * 0.75);
      pdf.save(`reports-${new Date().toISOString().split('T')[0]}.pdf`);
      setExportToast({ type: 'success', message: 'PDF exported successfully!' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setExportToast({ type: 'error', message: 'Failed to generate PDF. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#0B0B0B] p-6">
      {exportToast?.type === 'success' && <SuccessToast message={exportToast.message} onClose={() => setExportToast(null)} />}
      {exportToast?.type === 'error' && <ErrorToast message={exportToast.message} onClose={() => setExportToast(null)} />}
      <ChartConfig />
      
      {/* Header */}
      <Header title="Reports & Analytics" />
      
      <div className="flex justify-end items-center gap-3 mt-4">
        {dateRange.start && dateRange.end && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing data from: {dateRange.start.toLocaleDateString()} to {dateRange.end.toLocaleDateString()}
          </span>
        )}
        <DateRangePicker onRangeChange={handleDateRangeChange} />
        <button
          onClick={exportToPDF}
          disabled={isExporting}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download size={16} />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      {/* Reports container */}
      <div id="reports-container" ref={reportsRef} className="space-y-6">
        <AppointmentsReport dateRange={dateRange} />
        <UsersReport dateRange={dateRange} />
        <PetsReport dateRange={dateRange} />
        <VisitsReport dateRange={dateRange} />
        <FeedbacksReport dateRange={dateRange} />
        <LostPetsReport dateRange={dateRange} />
      </div>
    </div>
  );
};

export default Reports;