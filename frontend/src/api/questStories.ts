import type { QuestStoriesResponse } from '@/pages/game/types/apiTypes';

import api from './api';

// 로그 데이터 + 문제 파일 목록
export const getQuestStoriesInfo = async (
  questId: string | undefined,
): Promise<QuestStoriesResponse[]> => {
  const response = await api.get(`/rooms/single/quest/${questId}/story`);
  return response.data.result;
};
