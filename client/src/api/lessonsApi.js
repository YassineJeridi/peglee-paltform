import axiosInstance from './axiosInstance';

export async function getLesson(subModuleId) {
  const { data } = await axiosInstance.get(`/lessons/${subModuleId}`);
  return data; // { title, content, videoUrl, attachments }
}
