import axios from 'axios';

import type { QuestInfo } from '../pages/game/types/ideTypes';

// 로그 데이터 + 문제 파일 목록
export const getRetryQuestFile = async (
  submissionId: string | undefined,
  roomId: string | undefined,
  accessToken?: string | null,
): Promise<QuestInfo> => {
  const response = await axios.get(
    `/api/v1/rooms/${roomId}/submissions/${submissionId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return response.data.result as QuestInfo;
};
