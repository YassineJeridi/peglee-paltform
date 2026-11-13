import axiosInstance from './axiosInstance';

export async function getNotes() {
  const { data } = await axiosInstance.get('/notes');
  return data;
}

export async function createNote(payload) {
  const { data } = await axiosInstance.post('/notes', payload);
  return data;
}

export async function updateNote(id, payload) {
  const { data } = await axiosInstance.put(`/notes/${id}`, payload);
  return data;
}

export async function deleteNote(id) {
  await axiosInstance.delete(`/notes/${id}`);
}
