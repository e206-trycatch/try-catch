import api from './api';

export async function getTimer(roomId: number | null) {
  await api.post(`/rooms/single/${roomId}/start`);
}
