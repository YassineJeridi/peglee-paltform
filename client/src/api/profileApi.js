import axiosInstance from './axiosInstance';

export async function updateProfile(payload) {
  const { data } = await axiosInstance.put('/users/me', payload);
  return data; // user complet (même forme que /auth/me)
}

export async function changePassword(payload) {
  const { data } = await axiosInstance.put('/users/me/password', payload);
  return data; // { message }
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await axiosInstance.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data; // { profilePicture }
}
