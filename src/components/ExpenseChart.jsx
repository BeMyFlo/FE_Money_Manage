import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = {
  food: "#ef4444",
  shopping: "#f59e0b",
  bills: "#10b981",
  transport: "#3b82f6",
  entertainment: "#8b5cf6",
  healthcare: "#ec4899",
  utilities: "#14b8a6",
  salary: "#22c55e",
  other: "#6b7280",
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

  const chartData = data.map((item) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.total,
    percentage: parseFloat(item.percentage),
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[data[index].category] || COLORS.other}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}`} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {data.map((item) => (
          <div
            key={item.category}
            className="flex justify-between items-center"
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{
                  backgroundColor: COLORS[item.category] || COLORS.other,
                }}
              ></div>
              <span className="text-sm text-gray-700 capitalize">
                {item.category}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{item.total}</p>
              <p className="text-xs text-gray-500">{item.count} transactions</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseChart;
