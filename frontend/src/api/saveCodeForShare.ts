import api from './api';

export async function saveCodeForShare(roomId: number) {
  await api.get(`/rooms/multi/${roomId}/save`);
}
