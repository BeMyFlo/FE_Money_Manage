import api from "./api";
import { gmailService } from "./gmailService";

export { gmailService };

export const authService = {
  register: async (data) => {
    const response = await api.post("/auth/register", data);
    if (response.data.success) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  login: async (data) => {
    const response = await api.post("/auth/login", data);
    if (response.data.success) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    if (response.data.success) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export const expenseService = {
  getExpenses: async (params) => {
    const response = await api.get("/expenses", { params });
    return response.data;
  },

  getExpenseById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (data) => {
    const response = await api.post("/expenses", data);
    return response.data;
  },

  updateExpense: async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  getSummary: async (params) => {
    const response = await api.get("/expenses/summary", { params });
    return response.data;
  },
};
