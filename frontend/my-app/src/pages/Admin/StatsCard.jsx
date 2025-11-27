function StatsCard({ title, value, icon: Icon, bgColor, textColor }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${textColor}`}>{value}</p>
        </div>
        <div className={`${bgColor} p-4 rounded-full text-white`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

export default StatsCard;