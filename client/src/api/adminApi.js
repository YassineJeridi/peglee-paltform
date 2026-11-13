import axiosInstance from './axiosInstance';

export async function getStats() {
  const { data } = await axiosInstance.get('/admin/stats');
  return data; // { totals, rates, timeSeries: { registrations, activity }, studentsByModule }
}
