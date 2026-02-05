import React, { useState, useEffect } from "react";
import { expenseService, gmailService } from "../services";
import Navbar from "../components/Navbar";
import GmailConnect from "../components/GmailConnect";
import ExpenseChart from "../components/ExpenseChart";
import ExpenseModal from "../components/ExpenseModal";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when month changes
    fetchData();

    // Check for Gmail OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail") === "connected") {
      toast.success("Gmail connected successfully!");
      // Clear URL parameters
      window.history.replaceState({}, "", "/dashboard");
      // Sync immediately after connecting
      handleAutoSync();
    }
    if (params.get("error")) {
      const error = params.get("error");
      toast.error(`Failed to connect Gmail: ${error}`);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const autoSyncInBackground = async () => {
    try {
      await gmailService.autoSync(selectedMonth);
      // Don't call fetchData here to avoid double loading
    } catch (error) {
      // Silent fail - don't show error to user for background sync
      console.log("Background sync skipped or failed");
    }
  };

  const handleAutoSync = async () => {
    try {
      const loadingToast = toast.loading("Đang đồng bộ email...");
      await gmailService.syncEmails(selectedMonth);
      toast.success("Đồng bộ thành công!", { id: loadingToast });
      fetchData();
    } catch (error) {
      console.error("Manual sync error:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, expensesRes] = await Promise.all([
        expenseService.getSummary({ month: selectedMonth }),
        expenseService.getExpenses({
          month: selectedMonth,
          limit: itemsPerPage,
          page: currentPage,
        }),
      ]);
      setSummary(summaryRes.data);
      setExpenses(expensesRes.data.expenses);
      setTotalPages(expensesRes.data.pagination?.pages || 1);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa giao dịch này?")) return;

    try {
      await expenseService.deleteExpense(id);
      toast.success("Đã xóa giao dịch");
      fetchData();
    } catch (error) {
      toast.error("Không thể xóa giao dịch");
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  const handleModalSuccess = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              Bảng Điều Khiển
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Quản lý chi tiêu hàng tháng
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center space-x-2 w-full sm:w-auto"
          >
            <Plus size={20} />
            <span>Thêm Giao Dịch</span>
          </button>
        </div>

        {/* Month Selector */}
        <div className="mb-6">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input max-w-xs"
          />
        </div>

        {/* Gmail Connection */}
        <div className="mb-6">
          <GmailConnect onSyncComplete={fetchData} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="card-gradient transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Tổng Chi
                </p>
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {summary?.totalExpense?.toLocaleString("vi-VN")} VNĐ
                </p>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <DollarSign className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="card-gradient transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Số Giao Dịch
                </p>
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  {summary?.totalCount || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="text-white" size={20} />
              </div>
            </div>
          </div>

          <div className="card-gradient transform hover:scale-105 transition-all duration-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Trung Bình/Ngày
                </p>
                <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  {summary?.totalExpense
                    ? (summary.totalExpense / 30).toLocaleString("vi-VN")
                    : 0}{" "}
                  VNĐ
                </p>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Calendar className="text-white" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Chart and Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ExpenseChart data={summary?.categoryBreakdown || []} />

          {/* Recent Expenses */}
          <div className="card-gradient">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              Giao Dịch Gần Đây
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {expenses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Chưa có giao dịch nào
                </p>
              ) : (
                expenses.slice(0, 10).map((expense) => (
                  <div
                    key={expense._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 gap-2 sm:gap-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {expense.description}
                      </p>
                      <div className="flex items-center flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 mt-1">
                        <span
                          className="capitalize px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: expense.categoryId?.color
                              ? `${expense.categoryId.color}20`
                              : "#f3e8ff",
                            color: expense.categoryId?.color || "#7c3aed",
                          }}
                        >
                          {expense.categoryId?.displayName ||
                            expense.categoryId?.name ||
                            "Khác"}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-xs">
                          {format(
                            new Date(expense.transactionDate),
                            "dd/MM/yyyy",
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:space-x-3">
                      <span
                        className={`font-bold text-base sm:text-lg ${
                          expense.transactionType === "credit"
                            ? "text-green-600"
                            : expense.transactionType ===
                                "credit_card_statement"
                              ? "text-orange-600"
                              : "text-red-600"
                        }`}
                      >
                        {expense.transactionType === "credit" ? "+" : "-"}
                        {expense.amount.toLocaleString("vi-VN")} VNĐ
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-1.5 sm:p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* All Expenses Table */}
        {expenses.length > 0 && (
          <div className="card-gradient">
            <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              Tất Cả Giao Dịch
            </h3>

            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3 mb-4">
              {expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {expense.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(
                          new Date(expense.transactionDate),
                          "dd/MM/yyyy",
                        )}
                      </p>
                    </div>
                    <span
                      className={`font-bold text-sm ${
                        expense.transactionType === "credit"
                          ? "text-green-600"
                          : expense.transactionType === "credit_card_statement"
                            ? "text-orange-600"
                            : "text-red-600"
                      }`}
                    >
                      {expense.transactionType === "credit" ? "+" : "-"}
                      {expense.amount.toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className="px-2 py-1 text-xs font-semibold rounded-full capitalize"
                        style={{
                          backgroundColor: expense.categoryId?.color
                            ? `${expense.categoryId.color}20`
                            : "#f3e8ff",
                          color: expense.categoryId?.color || "#7c3aed",
                        }}
                      >
                        {expense.categoryId?.displayName ||
                          expense.categoryId?.name ||
                          "Khác"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          expense.extractedFrom === "gmail"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {expense.extractedFrom === "gmail"
                          ? "Gmail"
                          : "Thủ công"}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-red-600 to-orange-500">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Nội Dung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Danh Mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Số Tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Nguồn
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr
                      key={expense._id}
                      className="hover:bg-red-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {format(
                          new Date(expense.transactionDate),
                          "dd/MM/yyyy",
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-3 py-1 inline-flex text-xs font-semibold rounded-full capitalize"
                          style={{
                            backgroundColor: expense.categoryId?.color
                              ? `${expense.categoryId.color}20`
                              : "#f3e8ff",
                            color: expense.categoryId?.color || "#7c3aed",
                          }}
                        >
                          {expense.categoryId?.displayName ||
                            expense.categoryId?.name ||
                            "Khác"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        <span
                          className={
                            expense.transactionType === "credit"
                              ? "text-green-600"
                              : expense.transactionType ===
                                  "credit_card_statement"
                                ? "text-orange-600"
                                : "text-red-600"
                          }
                        >
                          {expense.transactionType === "credit" ? "+" : "-"}
                          {expense.amount.toLocaleString("vi-VN")} VNĐ
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            expense.extractedFrom === "gmail"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {expense.extractedFrom === "gmail"
                            ? "Gmail"
                            : "Thủ công"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 rounded-b-xl gap-3">
                <div className="text-xs sm:text-sm font-medium text-gray-700">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Trước
                  </button>

                  {/* Page numbers */}
                  <div className="flex space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = idx + 1;
                      } else if (currentPage <= 3) {
                        pageNum = idx + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + idx;
                      } else {
                        pageNum = currentPage - 2 + idx;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-red-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ExpenseModal
          expense={editingExpense}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default Dashboard;
