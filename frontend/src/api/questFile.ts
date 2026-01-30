import api from './api';

import type { QuestInfo } from '../pages/game/types/ideTypes';

// 로그 데이터 + 문제 파일 목록
export const getQuest = async (
  questId: string | undefined,
  roomId: string | undefined,
): Promise<QuestInfo> => {
  const response = await api.get(`/rooms/${roomId}/quest/${questId}/files`);
  return response.data.result as QuestInfo;
};
