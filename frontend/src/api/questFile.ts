import axios from 'axios';

import type { QuestInfo } from '../pages/game/types/ideTypes';

// 로그 데이터 + 문제 파일 목록
export const getQuest = async (
  questId: number,
  roomId: number,
): Promise<QuestInfo> => {
  const response = await axios.get(
    `/api/v1/rooms/${roomId}/quest/${questId}/files`,
  );
  return response.data.result as QuestInfo;
};
