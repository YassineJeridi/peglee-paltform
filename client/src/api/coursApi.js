import axiosInstance from './axiosInstance';

export async function getModules() {
  const { data } = await axiosInstance.get('/modules');
  return data; // Module[] avec progressPercent
}

export async function getSubModules(moduleId) {
  const { data } = await axiosInstance.get(`/modules/${moduleId}/submodules`);
  return data; // SubModule[] avec status, lessonCompleted, quizPassed, ...
}
