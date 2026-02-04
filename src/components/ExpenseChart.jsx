import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// Expanded color palette for better visual distinction
const COLORS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#06b6d4", // cyan
  "#a855f7", // purple
  "#84cc16", // lime
  "#f43f5e", // rose
  "#0ea5e9", // sky
  "#d946ef", // fuchsia
  "#22c55e", // green
  "#eab308", // yellow
  "#6366f1", // indigo
  "#64748b", // slate
];

const getColorForIndex = (index) => {
  return COLORS[index % COLORS.length];
};

const ExpenseChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
        <p className="text-center text-gray-500 py-8">
          No expense data available
        </p>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.total,
    percentage: parseFloat(item.percentage),
    color: getColorForIndex(index),
  }));

  return (
    <div className="card">
      <h3 className="text-base sm:text-lg font-semibold mb-4">
        Expense Breakdown
      </h3>

      {/* Mobile: Hide labels on pie, show only legend below */}
      <ResponsiveContainer width="100%" height={200} className="sm:h-[280px]">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            // Disable all labels to prevent overlap
            label={false}
            outerRadius={window.innerWidth >= 640 ? 90 : 70}
            innerRadius={window.innerWidth >= 640 ? 0 : 30}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => value.toLocaleString() + " VND"}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category List with colors */}
      <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
        {data.map((item, index) => (
          <div
            key={item.category}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                style={{
                  backgroundColor: getColorForIndex(index),
                }}
              ></div>
              <span className="text-sm font-medium text-gray-700 capitalize truncate">
                {item.category}
              </span>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
              <p className="text-sm font-semibold text-gray-900">
                {parseInt(item.total).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {item.count} giao dịch • {parseFloat(item.percentage).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseChart;
