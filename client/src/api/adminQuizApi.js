import axiosInstance from './axiosInstance';

export async function getQuizForAdmin(subModuleId) {
  const { data } = await axiosInstance.get(`/quiz/manage/${subModuleId}`);
  return data;
}

export async function createQuiz(payload) {
  const { data } = await axiosInstance.post('/quiz', payload);
  return data;
}

export async function updateQuiz(id, payload) {
  const { data } = await axiosInstance.put(`/quiz/${id}`, payload);
  return data;
}

export async function deleteQuiz(id) {
  const { data } = await axiosInstance.delete(`/quiz/${id}`);
  return data;
}
