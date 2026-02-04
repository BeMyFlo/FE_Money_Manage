import api from "./api";

// Get all email configs
export const getAllConfigs = async () => {
  const response = await api.get("/bank-email-configs");
  return response.data;
};

// Get single config by ID
export const getConfigById = async (id) => {
  const response = await api.get(`/bank-email-configs/${id}`);
  return response.data;
};

// Create new email config
export const createConfig = async (configData) => {
  const response = await api.post("/bank-email-configs", configData);
  return response.data;
};

// Update email config
export const updateConfig = async (id, configData) => {
  const response = await api.put(`/bank-email-configs/${id}`, configData);
  return response.data;
};

// Delete email config
export const deleteConfig = async (id) => {
  const response = await api.delete(`/bank-email-configs/${id}`);
  return response.data;
};

// Test email config
export const testConfig = async (testData) => {
  const response = await api.post("/bank-email-configs/test", testData);
  return response.data;
};
