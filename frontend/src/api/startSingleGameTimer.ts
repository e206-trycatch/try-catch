import type { GameTimerResponse } from '../pages/game/types/apiTypes';
import api from './api';

export async function startSingleGameTimer(
  roomId: number,
): Promise<GameTimerResponse> {
  const { data } = await api.post(`/rooms/single/${roomId}/start`);
  return data.result;
}
