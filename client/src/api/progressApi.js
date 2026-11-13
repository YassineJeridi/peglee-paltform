import axiosInstance from './axiosInstance';

export async function completeLesson(subModuleId) {
  const { data } = await axiosInstance.post(`/progress/lesson/${subModuleId}/complete`);
  return data; // { lessonCompleted, status, leveledUp }
}

export async function getMyProgress() {
  const { data } = await axiosInstance.get('/progress/me');
  return data;
}

export async function getMyActivity(period) {
  const { data } = await axiosInstance.get('/progress/me/activity', { params: { period } });
  return data; // { period, series: [{ date, attemptsCount, averageScore }] }
}
