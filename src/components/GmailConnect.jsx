import React, { useState, useEffect } from "react";
import { gmailService } from "../services";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Mail, RefreshCw, Link as LinkIcon, Unlink } from "lucide-react";
import { format } from "date-fns";

const GmailConnect = ({ onSyncComplete }) => {
  const [status, setStatus] = useState({ connected: false, lastSync: null });
  const [syncing, setSyncing] = useState(false);
  const [syncMonth, setSyncMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const { refreshUser } = useAuth();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await gmailService.getStatus();
      setStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await gmailService.getAuthUrl();
      window.location.href = response.data.authUrl;
    } catch (error) {
      toast.error("Failed to get authorization URL");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await gmailService.syncEmails({ month: syncMonth });
      toast.success(
        `Synced successfully! Found ${response.data.emailsChecked} emails, added ${response.data.newExpensesAdded} new expenses.`,
      );
      await fetchStatus();
      await refreshUser();

      // Callback to refresh parent component data
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Gmail?")) return;

    try {
      await gmailService.disconnect();
      toast.success("Gmail disconnected");
      setStatus({ connected: false, lastSync: null });
      await refreshUser();
    } catch (error) {
      toast.error("Failed to disconnect");
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center space-x-3">
          <Mail className="text-primary-600" size={24} />
          <div>
            <h3 className="text-base sm:text-lg font-semibold">
              Gmail Integration
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {status.connected ? "Connected" : "Not connected"}
            </p>
          </div>
        </div>

        {status.connected ? (
          <button
            onClick={handleDisconnect}
            className="btn btn-secondary flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Unlink size={16} />
            <span>Disconnect</span>
          </button>
        ) : (
          <button
            onClick={handleConnect}
            className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <LinkIcon size={16} />
            <span>Connect Gmail</span>
          </button>
        )}
      </div>

      {status.connected && (
        <>
          {status.lastSync && (
            <p className="text-sm text-gray-600 mb-4">
              Last synced: {format(new Date(status.lastSync), "PPpp")}
            </p>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sync Month
              </label>
              <input
                type="month"
                value={syncMonth}
                onChange={(e) => setSyncMonth(e.target.value)}
                className="input"
                disabled={syncing}
              />
            </div>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn btn-primary flex items-center space-x-2 w-full justify-center"
            >
              <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
              <span>{syncing ? "Syncing..." : "Sync Emails"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GmailConnect;
