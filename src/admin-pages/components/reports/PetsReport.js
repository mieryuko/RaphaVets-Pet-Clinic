import { Doughnut, Bar } from "react-chartjs-2";
import StatsCard from "./StatsCard";

const PetsReport = () => {
  return (
    <section className="space-y-4">

      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
        Pets Analytics
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Pets" value="2,190" change="+11%" />
        <StatsCard title="Dogs" value="1,340" change="+8%" />
        <StatsCard title="Cats" value="720" change="+6%" />
        <StatsCard title="Others" value="130" change="+2%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        <div className="bg-white dark:bg-[#111] p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Pet Types</h3>
          <Doughnut
            data={{
              labels:["Dogs","Cats","Others"],
              datasets:[{ data:[61,33,6] }]
            }}
          />
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#111] p-5 rounded-xl">
          <h3 className="font-semibold mb-4">Monthly Registrations</h3>
          <div className="h-[260px]">
            <Bar
              data={{
                labels:["Jan","Feb","Mar","Apr","May","Jun"],
                datasets:[{ data:[120,140,160,180,210,230] }]
              }}
              options={{ maintainAspectRatio:false }}
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default PetsReport;