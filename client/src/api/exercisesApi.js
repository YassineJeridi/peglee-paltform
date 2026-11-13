import axiosInstance from './axiosInstance';

export async function getExercises(subModuleId) {
  const { data } = await axiosInstance.get(`/exercises/${subModuleId}`);
  return data;
}

export async function getExerciseSolution(exerciseId) {
  const { data } = await axiosInstance.get(`/exercises/${exerciseId}/solution`);
  return data; // { solution }
}

export async function completeExercise(exerciseId) {
  const { data } = await axiosInstance.post(`/exercises/${exerciseId}/complete`);
  return data; // { exercisesCompleted, status, leveledUp }
}

export async function runExercise(exerciseId, code) {
  const { data } = await axiosInstance.post(`/exercises/${exerciseId}/run`, { code });
  return data; // { allPassed, results: [{ input, expected, actual, passed, timedOut, error }] }
}
