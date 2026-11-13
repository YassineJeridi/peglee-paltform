import axiosInstance from './axiosInstance';

export async function listUsers(params) {
  const { data } = await axiosInstance.get('/users', { params });
  return data; // { items, total, page, pageSize }
}

export async function getUserDetail(id) {
  const { data } = await axiosInstance.get(`/users/${id}`);
  return data;
}

export async function createUser(payload) {
  const { data } = await axiosInstance.post('/users', payload);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await axiosInstance.put(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id) {
  await axiosInstance.delete(`/users/${id}`);
}

export async function resetPassword(id) {
  const { data } = await axiosInstance.post(`/users/${id}/reset-password`);
  return data; // { temporaryPassword }
}
