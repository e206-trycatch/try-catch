// 제출 결과 API
import type { SubmissionResult } from '../pages/result/types/resultTypes';
import api from './api';

// 엔드포인트 추후 반영
export const fetchSubmissionResult = async (roomId: number) => {
  const res = await api.get<{ data: SubmissionResult }>(
    `/rooms/${roomId}/submissions`,
  );
  return res.data;
};
