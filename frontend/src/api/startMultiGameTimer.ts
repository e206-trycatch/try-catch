import api from './api';

export async function startMultiGameTimer(roomId: number): Promise<void> {
  await api.post(`/rooms/multi/${roomId}/start`);
}
