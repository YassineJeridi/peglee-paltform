import axiosInstance from './axiosInstance';

export async function getExercisesForAdmin(subModuleId) {
  const { data } = await axiosInstance.get(`/exercises/manage/${subModuleId}`);
  return data;
}

export async function createExercise(payload) {
  const { data } = await axiosInstance.post('/exercises', payload);
  return data;
}

export async function updateExercise(id, payload) {
  const { data } = await axiosInstance.put(`/exercises/${id}`, payload);
  return data;
}

export async function deleteExercise(id) {
  const { data } = await axiosInstance.delete(`/exercises/${id}`);
  return data;
}

export async function runExerciseSolution(id) {
  const { data } = await axiosInstance.post(`/exercises/${id}/run-solution`);
  return data;
}
