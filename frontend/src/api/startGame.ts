import api from './api';

export async function startGame(roomId: number | null) {
  await api.post(`/rooms/${roomId}/start`);
}
