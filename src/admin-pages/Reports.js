import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Reports() {
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Appointments",
        data: [120, 150, 180, 160, 200, 230],
        fill: true,
        borderColor: "#2FA394",
        backgroundColor: "rgba(47,163,148,0.15)",
        tension: 0.3,
      },
      {
        label: "New Clients",
        data: [30, 45, 40, 55, 60, 80],
        borderColor: "#5EE6FE",
        backgroundColor: "rgba(94,230,254,0.15)",
        tension: 0.3,
      },
    ],
  };

  const exportCSV = () => {
    const data = [
      ["Month", "Appointments", "New Clients"],
      ["Jan", 120, 30],
      ["Feb", 150, 45],
      ["Mar", 180, 40],
      ["Apr", 160, 55],
      ["May", 200, 60],
      ["Jun", 230, 80],
    ];
    const csv = data.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "raphaVets_reports.csv";
    a.click();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-[#2FA394]">Reports & Statistics</h2>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl shadow p-5 border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Monthly Trends</h3>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#2FA394] text-white rounded-lg hover:bg-[#278e82] transition"
          >
            <i className="fa-solid fa-file-csv"></i>
            Export CSV
          </button>
        </div>
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: { legend: { position: "bottom" } },
            scales: { y: { beginAtZero: true } },
          }}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Appointments" value="1,040" />
        <SummaryCard label="Total Clients" value="420" />
        <SummaryCard label="Diagnoses Generated" value="362" />
        <SummaryCard label="Posts Published" value="14" />
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 text-center border border-gray-100 hover:shadow-md transition">
      <p className="text-xs text-gray-500">{label}</p>
      <h3 className="text-2xl font-bold text-[#2FA394] mt-1">{value}</h3>
    </div>
  );
}
