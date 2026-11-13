import axiosInstance from './axiosInstance';

export async function getModules() {
  const { data } = await axiosInstance.get('/modules');
  return data;
}

export async function getSubModules(moduleId) {
  const { data } = await axiosInstance.get(`/modules/${moduleId}/submodules`);
  return data;
}

export async function createModule(payload) {
  const { data } = await axiosInstance.post('/modules', payload);
  return data;
}

export async function updateModule(id, payload) {
  const { data } = await axiosInstance.put(`/modules/${id}`, payload);
  return data;
}

export async function deleteModule(id) {
  const { data } = await axiosInstance.delete(`/modules/${id}`);
  return data;
}

export async function reorderModules(items) {
  const { data } = await axiosInstance.put('/modules/reorder', { items });
  return data;
}

export async function createSubModule(payload) {
  const { data } = await axiosInstance.post('/submodules', payload);
  return data;
}

export async function updateSubModule(id, payload) {
  const { data } = await axiosInstance.put(`/submodules/${id}`, payload);
  return data;
}

export async function deleteSubModule(id) {
  const { data } = await axiosInstance.delete(`/submodules/${id}`);
  return data;
}

export async function reorderSubModules(items) {
  const { data } = await axiosInstance.put('/submodules/reorder', { items });
  return data;
}
