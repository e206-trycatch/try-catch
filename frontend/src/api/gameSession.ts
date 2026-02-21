import type { GameSessionResponse } from '@/pages/game/types/apiTypes';

import api from './api';

export async function getGameSession(
  roomId: number,
): Promise<GameSessionResponse> {
  const { data } = await api.get(`/rooms/multi/${roomId}`);
  return data.result;
}

/**
 * 멀티모드 재도전 API
 * 게임 상태를 초기화하고 RETRY_STARTED를 브로드캐스트
 */
export async function retryMultiGame(roomId: number): Promise<void> {
  await api.post(`/rooms/multi/${roomId}/retry`);
}
