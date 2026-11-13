import axiosInstance from './axiosInstance';

export async function getLessonBySubModule(subModuleId) {
  const { data } = await axiosInstance.get(`/lessons/${subModuleId}`);
  return data;
}

export async function createLesson(payload) {
  const { data } = await axiosInstance.post('/lessons', payload);
  return data;
}

export async function updateLesson(id, payload) {
  const { data } = await axiosInstance.put(`/lessons/${id}`, payload);
  return data;
}

export async function deleteLesson(id) {
  const { data } = await axiosInstance.delete(`/lessons/${id}`);
  return data;
}
