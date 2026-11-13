import axiosInstance from './axiosInstance';

export async function getEvents({ start, end } = {}) {
  const { data } = await axiosInstance.get('/events', { params: { start, end } });
  return data;
}

export async function getUpcomingEvents(limit = 5) {
  const { data } = await axiosInstance.get('/events', { params: { upcoming: true, limit } });
  return data;
}

export async function createEvent(payload) {
  const { data } = await axiosInstance.post('/events', payload);
  return data;
}

export async function updateEvent(id, payload) {
  const { data } = await axiosInstance.put(`/events/${id}`, payload);
  return data;
}

export async function deleteEvent(id) {
  await axiosInstance.delete(`/events/${id}`);
}
