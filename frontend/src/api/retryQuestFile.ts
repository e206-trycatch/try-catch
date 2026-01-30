import api from './api';

import type { QuestInfo } from '../pages/game/types/ideTypes';

// 로그 데이터 + 문제 파일 목록
export const getRetryQuestFile = async (
  submissionId: string | undefined,
  roomId: string | undefined,
): Promise<QuestInfo> => {
  const response = await api.get(`/rooms/${roomId}/submissions/${submissionId}`);
  return response.data.result as QuestInfo;
};
