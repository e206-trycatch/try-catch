import type { GameTimerResponse } from '../pages/game/types/apiTypes';
import api from './api';

export async function getSingleTimer(
  roomId: number,
): Promise<GameTimerResponse> {
  const { data } = await api.get(`/rooms/single/${roomId}/timer`);
  return data.result;
}
