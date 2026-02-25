const StatsCard = ({ title, value, change }) => {
  return (
    <div className="bg-white dark:bg-[#111] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-semibold mt-1 text-gray-800 dark:text-gray-200">
        {value}
      </h2>
      <span className="text-xs text-green-500">{change}</span>
    </div>
  );
};

export default StatsCard;