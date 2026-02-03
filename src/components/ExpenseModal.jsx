import React, { useState, useEffect } from "react";
import { expenseService } from "../services";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import api from "../services/api";

const ExpenseModal = ({ expense, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: expense?.amount || "",
    description: expense?.description || "",
    category: expense?.category || "",
    transactionDate: expense?.transactionDate
      ? new Date(expense.transactionDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    bankName: expense?.bankName || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data);
      if (!expense && response.data.data.length > 0 && !formData.category) {
        setFormData({ ...formData, category: response.data.data[0].name });
      }
    } catch (error) {
      toast.error("Không thể tải danh mục");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (expense) {
        await expenseService.updateExpense(expense._id, formData);
        toast.success("Đã cập nhật giao dịch");
      } else {
        await expenseService.createExpense(formData);
        toast.success("Đã tạo giao dịch mới");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-semibold">
            {expense ? "Sửa Giao Dịch" : "Thêm Giao Dịch"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-3 sm:space-y-4"
        >
          <div>
            <label className="label">Số Tiền</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="input"
              placeholder="0"
              step="1"
              required
            />
          </div>

          <div>
            <label className="label">Mô Tả</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              placeholder="Mô tả giao dịch..."
              required
            />
          </div>

          <div>
            <label className="label">Danh Mục</label>
            {categories.length === 0 ? (
              <div className="text-sm text-gray-500 italic">
                Chưa có danh mục. Vui lòng tạo danh mục trước.
              </div>
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="label">Ngày Giao Dịch</label>
            <input
              type="date"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Tên Ngân Hàng (Tùy chọn)</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="input"
              placeholder="Vietcombank, Techcombank..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || categories.length === 0}
              className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
