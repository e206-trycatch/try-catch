import api from './api';

export async function startSingleGameTimer(roomId: number | null) {
  const { data } = await api.post(`/rooms/single/${roomId}/start`);
  return data;
}
