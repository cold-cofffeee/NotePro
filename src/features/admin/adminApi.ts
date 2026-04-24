import api from "../../lib/api";

export const fetchDashboardMetrics = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data;
};

export const fetchAnalytics = async (timeRange: "7d" | "30d" = "30d") => {
  const { data } = await api.get("/admin/analytics", { params: { range: timeRange } });
  return data;
};

export const fetchUsers = async (page = 1, limit = 50) => {
  const { data } = await api.get("/admin/users", { params: { page, limit } });
  return data;
};

export const toggleUserSuspension = async (id: string, isSuspended: boolean) => {
  const { data } = await api.post(`/admin/users/${id}/suspend`, { isSuspended });
  return data;
};

export const deleteUser = async (id: string) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const fetchAllNotes = async (page = 1, limit = 50) => {
  const { data } = await api.get("/admin/notes", { params: { page, limit } });
  return data;
};

export const fetchDeletedNotes = async (page = 1, limit = 50) => {
  const { data } = await api.get("/admin/notes/deleted", { params: { page, limit } });
  return data;
};

export const restoreNoteAdmin = async (noteId: string) => {
  const { data } = await api.post(`/admin/notes/${noteId}/restore`);
  return data;
};

export const deleteNotePermanently = async (noteId: string) => {
  const { data } = await api.delete(`/admin/notes/${noteId}`);
  return data;
};

export const fetchAuditLogs = async (page = 1, limit = 100) => {
  const { data } = await api.get("/admin/audit", { params: { page, limit } });
  return data;
};

export const fetchAllTags = async () => {
  const { data } = await api.get("/admin/tags");
  return data;
};

export const deleteTag = async (tagId: string) => {
  const { data } = await api.delete(`/admin/tags/${tagId}`);
  return data;
};

export const renameTag = async (tagId: string, newName: string) => {
  const { data } = await api.patch(`/admin/tags/${tagId}`, { name: newName });
  return data;
};
