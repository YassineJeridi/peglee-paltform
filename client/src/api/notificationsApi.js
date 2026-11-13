import axiosInstance from './axiosInstance';

export async function getNotifications() {
  const { data } = await axiosInstance.get('/notifications');
  return data; // { unreadCount, items }
}

export async function markNotificationRead(id) {
  const { data } = await axiosInstance.put(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await axiosInstance.put('/notifications/read-all');
  return data;
}
