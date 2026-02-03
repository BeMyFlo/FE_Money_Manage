import api from "./api";

export const gmailService = {
  // Check if user has connected Gmail (alias for compatibility)
  checkConnection: async () => {
    const response = await api.get("/gmail/status");
    return response.data;
  },

  // Get status (same as checkConnection)
  getStatus: async () => {
    const response = await api.get("/gmail/status");
    return response.data;
  },

  // Get Gmail OAuth URL
  getAuthUrl: async () => {
    const response = await api.get("/gmail/auth-url");
    return response.data;
  },

  // Disconnect Gmail
  disconnect: async () => {
    const response = await api.delete("/gmail/disconnect");
    return response.data;
  },

  // Sync emails for a specific month
  syncEmails: async (params) => {
    const response = await api.post("/gmail/sync", params);
    return response.data;
  },

  // Auto sync - check last sync time and sync if needed
  autoSync: async (month) => {
    try {
      // Get last sync time
      const status = await api.get("/gmail/status");
      const lastSync = status.data.data?.lastGmailSync;

      if (!lastSync) {
        // Never synced, do sync
        return await api.post("/gmail/sync", { month });
      }

      // Check if last sync was more than 5 minutes ago
      const lastSyncTime = new Date(lastSync);
      const now = new Date();
      const minutesSinceSync = (now - lastSyncTime) / (1000 * 60);

      if (minutesSinceSync > 5) {
        // Sync if > 5 minutes
        return await api.post("/gmail/sync", { month });
      }

      return { data: { message: "Recently synced, skipping" } };
    } catch (error) {
      console.error("Auto sync error:", error);
      throw error;
    }
  },
};
