import axiosInstance from './axiosInstance';

export async function getMyBadges() {
  const { data } = await axiosInstance.get('/badges/me');
  return data;
}

export async function getBadgesForAdmin() {
  const { data } = await axiosInstance.get('/badges/manage');
  return data;
}

export async function createBadge(payload) {
  const { data } = await axiosInstance.post('/badges', payload);
  return data;
}

export async function updateBadge(id, payload) {
  const { data } = await axiosInstance.put(`/badges/${id}`, payload);
  return data;
}

export async function deleteBadge(id) {
  const { data } = await axiosInstance.delete(`/badges/${id}`);
  return data;
}
