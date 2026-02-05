import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import api from "../services/api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    color: "#667eea",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data);
    } catch (error) {
      toast.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        toast.success("Đã cập nhật danh mục");
      } else {
        await api.post("/categories", formData);
        toast.success("Đã tạo danh mục mới");
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success("Đã xóa danh mục");
      fetchCategories();
    } catch (error) {
      toast.error("Không thể xóa danh mục");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      displayName: category.displayName,
      color: category.color,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "", displayName: "", color: "#667eea" });
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              Quản Lý Danh Mục
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Tạo và quản lý danh mục cho giao dịch
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center space-x-2 w-full sm:w-auto"
          >
            <Plus size={20} />
            <span>Thêm Danh Mục</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className="card-gradient hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}dd 100%)`,
                    }}
                  >
                    <Tag className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {category.displayName}
                    </h3>
                    <p className="text-xs text-gray-500">{category.name}</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 py-2 px-2 sm:px-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center justify-center space-x-1"
                >
                  <Edit size={14} className="sm:w-4 sm:h-4" />
                  <span className="text-sm">Sửa</span>
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="flex-1 py-2 px-2 sm:px-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-1"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  <span className="text-sm">Xóa</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <Tag className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-500 text-lg">Chưa có danh mục nào</p>
            <p className="text-gray-400 text-sm mt-2">
              Nhấn "Thêm Danh Mục" để tạo danh mục đầu tiên
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-semibold">
                {editingCategory ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Mã Danh Mục (name)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input"
                  placeholder="Ví dụ: tien an, giai tri, xang xe..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mã định danh dùng để nhận diện giao dịch
                </p>
              </div>

              <div>
                <label className="label">Tên Hiển Thị</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  className="input"
                  placeholder="Ví dụ: Tiền ăn, Giải trí, Xăng xe..."
                  required
                />
              </div>

              <div>
                <label className="label">Màu Sắc</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-20 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="input"
                    placeholder="#667eea"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn btn-secondary"
                >
                  Hủy
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  {editingCategory ? "Cập Nhật" : "Tạo Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
