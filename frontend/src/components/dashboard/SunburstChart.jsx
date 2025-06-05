
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const SunburstChart = ({ data }) => {
  const colors = {
    inner: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    outer: ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa']
  };

  const renderCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
          <p className="text-sm text-gray-600">
            {payload[0].payload.percentage ? `${payload[0].payload.percentage}%` : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Inner ring - Project Categories */}
          <Pie
            data={data.projectCategories || []}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            dataKey="value"
            stroke="#fff"
            strokeWidth={3}
          >
            {(data.projectCategories || []).map((entry, index) => (
              <Cell 
                key={`inner-${index}`} 
                fill={colors.inner[index % colors.inner.length]} 
              />
            ))}
          </Pie>
          
          {/* Outer ring - Project Status */}
          <Pie
            data={data.projectStatus || []}
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={140}
            dataKey="value"
            stroke="#fff"
            strokeWidth={3}
            label={({ name, value, percentage }) => `${name} (${value})`}
            labelLine={false}
          >
            {(data.projectStatus || []).map((entry, index) => (
              <Cell 
                key={`outer-${index}`} 
                fill={colors.outer[index % colors.outer.length]} 
              />
            ))}
          </Pie>
          
          <Tooltip content={renderCustomTooltip} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Chart Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        <div className="text-center">
          <div className="font-medium text-gray-700 mb-2">Categories (Inner Ring)</div>
          <div className="flex flex-wrap gap-2">
            {(data.projectCategories || []).map((item, index) => (
              <div key={item.name} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors.inner[index % colors.inner.length] }}
                />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <div className="font-medium text-gray-700 mb-2">Status (Outer Ring)</div>
          <div className="flex flex-wrap gap-2">
            {(data.projectStatus || []).map((item, index) => (
              <div key={item.name} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors.outer[index % colors.outer.length] }}
                />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SunburstChart;
