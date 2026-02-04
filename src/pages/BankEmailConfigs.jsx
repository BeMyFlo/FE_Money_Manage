import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getAllConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  testConfig,
} from "../services/bankEmailConfigService";

export default function BankEmailConfigs() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    fromPatterns: [""],
    subjectPatterns: [""],
    bodyKeywords: [""],
    bankName: "",
    isActive: true,
    amountLabels: [""],
    descriptionLabels: [""],
  });
  const [testEmail, setTestEmail] = useState({
    from: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await getAllConfigs();
      setConfigs(data);
    } catch (error) {
      console.error("Error loading configs:", error);
      alert("Không thể tải danh sách cấu hình");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty strings from arrays
    const cleanData = {
      ...formData,
      fromPatterns: formData.fromPatterns.filter((p) => p.trim()),
      subjectPatterns: formData.subjectPatterns.filter((p) => p.trim()),
      bodyKeywords: formData.bodyKeywords.filter((k) => k.trim()),
      amountLabels: formData.amountLabels?.filter((p) => p.trim()) || [],
      descriptionLabels:
        formData.descriptionLabels?.filter((p) => p.trim()) || [],
    };

    if (cleanData.fromPatterns.length === 0 || !cleanData.bankName) {
      alert("Vui lòng nhập ít nhất một pattern người gửi và tên ngân hàng");
      return;
    }

    try {
      if (editingConfig) {
        await updateConfig(editingConfig._id, cleanData);
      } else {
        await createConfig(cleanData);
      }
      setShowModal(false);
      resetForm();
      loadConfigs();
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Không thể lưu cấu hình");
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      fromPatterns: config.fromPatterns.length > 0 ? config.fromPatterns : [""],
      subjectPatterns:
        config.subjectPatterns.length > 0 ? config.subjectPatterns : [""],
      bodyKeywords: config.bodyKeywords.length > 0 ? config.bodyKeywords : [""],
      bankName: config.bankName,
      isActive: config.isActive,
      amountLabels:
        config.amountLabels?.length > 0 ? config.amountLabels : [""],
      descriptionLabels:
        config.descriptionLabels?.length > 0 ? config.descriptionLabels : [""],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa cấu hình này?")) return;

    try {
      await deleteConfig(id);
      loadConfigs();
    } catch (error) {
      console.error("Error deleting config:", error);
      alert("Không thể xóa cấu hình");
    }
  };

  const handleTest = (config) => {
    setEditingConfig(config);
    setShowTestModal(true);
    setTestResult(null);
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await testConfig({
        configId: editingConfig._id,
        testEmail,
      });
      setTestResult(result);
    } catch (error) {
      console.error("Error testing config:", error);
      alert("Không thể test cấu hình");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      fromPatterns: [""],
      subjectPatterns: [""],
      bodyKeywords: [""],
      bankName: "",
      isActive: true,
      amountLabels: [""],
      descriptionLabels: [""],
    });
    setEditingConfig(null);
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Cấu hình Email Ngân hàng
          </h1>
          <button
            onClick={openNewModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            + Thêm cấu hình
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {configs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">Chưa có cấu hình nào.</p>
              <p className="text-sm">
                Tạo cấu hình để app có thể tự động nhận diện email giao dịch từ
                ngân hàng của bạn.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngân hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người gửi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {configs.map((config) => (
                    <tr key={config._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {config.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {config.bankName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {config.fromPatterns.join(", ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            config.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {config.isActive ? "Đang hoạt động" : "Tắt"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleTest(config)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Test
                        </button>
                        <button
                          onClick={() => handleEdit(config)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(config._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingConfig ? "Sửa cấu hình" : "Thêm cấu hình mới"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên cấu hình *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="VD: VPBank - Thẻ ghi nợ"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Đặt tên để dễ nhận diện cấu hình này
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên ngân hàng *
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="VD: VPBank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email người gửi (của ngân hàng) *
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Nhập email hoặc tên người gửi xuất hiện trong email giao dịch.
                  Có thể thêm nhiều nếu ngân hàng gửi từ nhiều địa chỉ khác
                  nhau.
                </p>
                {formData.fromPatterns.map((pattern, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) =>
                        handleArrayChange("fromPatterns", index, e.target.value)
                      }
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="VD: vpbankonline@vpb.com.vn hoặc VPBank"
                    />
                    {formData.fromPatterns.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("fromPatterns", index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("fromPatterns")}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  + Thêm email người gửi
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ khóa trong tiêu đề email (không bắt buộc)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Thêm từ khóa xuất hiện trong tiêu đề email giao dịch để lọc
                  chính xác hơn
                </p>
                {formData.subjectPatterns.map((pattern, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) =>
                        handleArrayChange(
                          "subjectPatterns",
                          index,
                          e.target.value,
                        )
                      }
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="VD: Thông báo giao dịch"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem("subjectPatterns", index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("subjectPatterns")}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  + Thêm từ khóa
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ khóa trong nội dung email (không bắt buộc)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Từ khóa phải xuất hiện trong nội dung email để xác nhận đây là
                  email giao dịch
                </p>
                {formData.bodyKeywords.map((keyword, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) =>
                        handleArrayChange("bodyKeywords", index, e.target.value)
                      }
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="VD: giao dịch, trích nợ, chuyển tiền"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem("bodyKeywords", index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("bodyKeywords")}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  + Thêm từ khóa
                </button>
              </div>

              <details className="border rounded p-4">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Cấu hình nâng cao (không bắt buộc)
                </summary>
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-600">
                    Giúp hệ thống trích xuất thông tin chính xác hơn từ email
                    giao dịch
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhãn số tiền
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Text xuất hiện trước số tiền trong email. VD: "Số tiền",
                      "Amount", "Debit Amount"
                    </p>
                    {formData.amountLabels.map((pattern, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={pattern}
                          onChange={(e) =>
                            handleArrayChange(
                              "amountLabels",
                              index,
                              e.target.value,
                            )
                          }
                          className="flex-1 rounded-md border-gray-300 shadow-sm"
                          placeholder="VD: Số tiền trích nợ, Debit Amount"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem("amountLabels", index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("amountLabels")}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      + Thêm nhãn
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhãn nội dung chuyển tiền
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Text xuất hiện trước nội dung/mô tả giao dịch. VD: "Nội
                      dung chuyển tiền", "Details of Payment"
                    </p>
                    {formData.descriptionLabels.map((pattern, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={pattern}
                          onChange={(e) =>
                            handleArrayChange(
                              "descriptionLabels",
                              index,
                              e.target.value,
                            )
                          }
                          className="flex-1 rounded-md border-gray-300 shadow-sm"
                          placeholder="VD: Nội dung chuyển tiền, Details of Payment"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("descriptionLabels", index)
                          }
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("descriptionLabels")}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      + Thêm nhãn
                    </button>
                  </div>
                </div>
              </details>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Kích hoạt cấu hình này
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {editingConfig ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Test cấu hình: {editingConfig?.name}
              </h3>
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                  setTestEmail({ from: "", subject: "", body: "" });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  From (email người gửi)
                </label>
                <input
                  type="text"
                  value={testEmail.from}
                  onChange={(e) =>
                    setTestEmail({ ...testEmail, from: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="VD: vpbankonline@vpb.com.vn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  value={testEmail.subject}
                  onChange={(e) =>
                    setTestEmail({ ...testEmail, subject: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="VD: Thông báo giao dịch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Body
                </label>
                <textarea
                  value={testEmail.body}
                  onChange={(e) =>
                    setTestEmail({ ...testEmail, body: e.target.value })
                  }
                  rows={6}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Nội dung email..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Test
              </button>
            </form>

            {testResult && (
              <div className="mt-4 p-4 border rounded">
                <h4 className="font-medium mb-2">Kết quả:</h4>
                <div
                  className={`p-3 rounded ${testResult.matches ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
                >
                  <p className="font-medium">{testResult.message}</p>
                  {testResult.transaction && (
                    <div className="mt-2 text-sm space-y-1">
                      <p>
                        <strong>Amount:</strong>{" "}
                        {testResult.transaction.amount?.toLocaleString()} VND
                      </p>
                      <p>
                        <strong>Description:</strong>{" "}
                        {testResult.transaction.description}
                      </p>
                      <p>
                        <strong>Bank:</strong> {testResult.transaction.bankName}
                      </p>
                      <p>
                        <strong>Type:</strong>{" "}
                        {testResult.transaction.transactionType}
                      </p>
                      <p>
                        <strong>Category:</strong>{" "}
                        {testResult.transaction.category}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
