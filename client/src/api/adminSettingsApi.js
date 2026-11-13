import axiosInstance from './axiosInstance';

export async function getSettings() {
  const { data } = await axiosInstance.get('/admin/settings');
  return data;
}

export async function updateSettings(payload) {
  const { data } = await axiosInstance.put('/admin/settings', payload);
  return data;
}
