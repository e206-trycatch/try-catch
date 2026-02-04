import type { GameSessionResponse } from '@/pages/game/types/apiTypes';

import api from './api';

export async function getGameSession(
  roomId: number,
): Promise<GameSessionResponse> {
  const { data } = await api.get(`/rooms/multi/${roomId}`);
  return data.result;
}
