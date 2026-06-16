import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, trendValue }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`${colors[color]} p-3 rounded-lg`}>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <span className={`ml-2 text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;