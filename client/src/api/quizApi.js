import axiosInstance from './axiosInstance';

export async function getQuiz(subModuleId) {
  const { data } = await axiosInstance.get(`/quiz/${subModuleId}`);
  return data;
}

export async function submitQuiz(quizId, answers) {
  const { data } = await axiosInstance.post(`/quiz/${quizId}/submit`, { answers });
  return data; // { score, passed, passingScore, quizBestScore, correction, leveledUp }
}
