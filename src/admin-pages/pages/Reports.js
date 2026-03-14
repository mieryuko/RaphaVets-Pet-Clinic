import { useState, useRef, useEffect } from 'react';
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
import socket from "../../socket";

const Reports = () => {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [isExporting, setIsExporting] = useState(false);
  const [exportToast, setExportToast] = useState(null);
  const reportsRef = useRef(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const refreshReports = () => {
      // Trigger child report re-fetch by changing object reference.
      setDateRange((prev) => ({ ...prev }));
    };

    socket.on('appointments_updated', refreshReports);
    socket.on('pets_updated', refreshReports);
    socket.on('owner_created', refreshReports);
    socket.on('owner_updated', refreshReports);
    socket.on('new_forum_post', refreshReports);
    socket.on('delete_forum_post', refreshReports);

    return () => {
      socket.off('appointments_updated', refreshReports);
      socket.off('pets_updated', refreshReports);
      socket.off('owner_created', refreshReports);
      socket.off('owner_updated', refreshReports);
      socket.off('new_forum_post', refreshReports);
      socket.off('delete_forum_post', refreshReports);
    };
  }, []);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const exportToPDF = async () => {
    if (!reportsRef.current) return;
    
    setIsExporting(true);
    
    try {
      const element = reportsRef.current;
      const sections = Array.from(element.children).filter((node) => node instanceof HTMLElement);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const contentWidth = pageWidth - margin * 2;

      const drawPageHeader = () => {
        const titleY = margin;
        const subtitleY = titleY + 16;

        pdf.setFontSize(13);
        pdf.text('RaphaVets Reports and Analytics', margin, titleY);

        const rangeText = dateRange.start && dateRange.end
          ? `Date range: ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
          : 'Date range: All available data';

        pdf.setFontSize(10);
        pdf.setTextColor(90, 90, 90);
        pdf.text(rangeText, margin, subtitleY);
        pdf.setTextColor(0, 0, 0);

        return subtitleY + 10;
      };

      for (let index = 0; index < sections.length; index += 1) {
        const section = sections[index];
        if (index > 0) {
          pdf.addPage('a4', 'landscape');
        }

        const contentStartY = drawPageHeader();
        const availableSectionHeight = pageHeight - contentStartY - margin;

        const canvas = await html2canvas(section, {
          scale: 2,
          backgroundColor: '#f9fafb',
          logging: false,
          useCORS: true,
          windowWidth: section.scrollWidth,
          windowHeight: section.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');

        const renderedHeight = (canvas.height * contentWidth) / canvas.width;
        if (renderedHeight <= availableSectionHeight) {
          pdf.addImage(imgData, 'PNG', margin, contentStartY, contentWidth, renderedHeight, undefined, 'FAST');
          continue;
        }

        // For tall sections, keep width readable and split vertically across additional pages.
        let heightLeft = renderedHeight;
        let positionY = contentStartY;
        pdf.addImage(imgData, 'PNG', margin, positionY, contentWidth, renderedHeight, undefined, 'FAST');
        heightLeft -= availableSectionHeight;

        while (heightLeft > 0) {
          pdf.addPage('a4', 'landscape');
          const continuationStartY = drawPageHeader();
          const continuationAvailableHeight = pageHeight - continuationStartY - margin;
          positionY = continuationStartY - (renderedHeight - heightLeft);
          pdf.addImage(imgData, 'PNG', margin, positionY, contentWidth, renderedHeight, undefined, 'FAST');
          heightLeft -= continuationAvailableHeight;
        }
      }

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
