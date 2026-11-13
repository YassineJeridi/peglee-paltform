import axiosInstance from './axiosInstance';

export async function getTasks() {
  const { data } = await axiosInstance.get('/tasks');
  return data;
}

export async function createTask(payload) {
  const { data } = await axiosInstance.post('/tasks', payload);
  return data;
}

export async function updateTask(id, payload) {
  const { data } = await axiosInstance.put(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id) {
  await axiosInstance.delete(`/tasks/${id}`);
}
