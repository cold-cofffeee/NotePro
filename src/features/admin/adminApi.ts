import api from "../../lib/api";

export const fetchDashboardMetrics = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data;
};

export const fetchAnalytics = async () => {
  const { data } = await api.get("/admin/analytics");
  return data;
};

export const fetchUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data;
};

export const toggleUserSuspension = async (id: string, isSuspended: boolean) => {
  const { data } = await api.post(`/admin/users/${id}/suspend`, { isSuspended });
  return data;
};

export const fetchAllNotes = async () => {
  const { data } = await api.get("/admin/notes");
  return data;
};

export const fetchAuditLogs = async () => {
  const { data } = await api.get("/admin/audit");
  return data;
};
