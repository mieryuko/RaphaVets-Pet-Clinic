import React from "react";
import {
  Line
} from "react-chartjs-2";
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

export default function Dashboard() {
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Appointments",
        data: [8, 6, 10, 5, 12, 9, 14],
        fill: true,
        borderColor: "#2FA394",
        backgroundColor: "rgba(47,163,148,0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Appointments This Week",
        color: "#2FA394",
        font: { size: 14 },
      },
    },
    scales: {
      y: { ticks: { stepSize: 5 } },
    },
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Today's Appointments" value="12" />
        <Card title="Pending Requests" value="4" />
        <Card title="Registered Clients" value="239" />
        <Card title="Most Common Diagnosis" value="Gastroenteritis" />
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
          <h3 className="font-semibold text-[#2FA394] mb-3">Recent Activity</h3>
          <ul className="text-sm text-gray-600 space-y-3">
            <li>🐾 New client <b>Luna C.</b> registered — 2 hrs ago</li>
            <li>🩺 Appointment approved for <b>Benji</b> — 4 hrs ago</li>
            <li>📢 Posted new pet care tip — 6 hrs ago</li>
            <li>🚨 Missing pet post approved — 1 day ago</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 text-center border border-gray-100">
      <p className="text-xs text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-[#2FA394] mt-1">{value}</h3>
    </div>
  );
}
