import type { CodeSaveRequest } from '../pages/game/types/apiTypes';
import api from './api';

export async function saveCodeForShare(roomId: number, body: CodeSaveRequest) {
  await api.post(`/rooms/multi/${roomId}/save`, body);
}
