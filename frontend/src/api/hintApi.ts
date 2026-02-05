import type { FilePayload } from '../pages/game/types/apiTypes';
import type { HintMessage } from '../stores/useHintStore';
import api from './api';

// 힌트 요청 DTO
export interface HintCreateRequest {
  problemFrameworkId: number;
  framework: string;
  userQuestion: string;
  submission: {
    frontend: { files: FilePayload[] };
    backend: { files: FilePayload[] };
  };
}

// 힌트 요청 응답
interface HintCreateResponse {
  status: string;
  message: string;
  remainingHintCount: number;
}

// 힌트 이력 아이템 (백엔드 응답)
interface HintHistoryItem {
  type: 'QUESTION' | 'RESPONSE';
  userId: number;
  nickname?: string;
  profileUrl?: string;
  content: string;
  timestamp: number;
  success?: boolean;
  guardrailPassed?: boolean;
  rejectionReason?: string;
}

// 힌트 요청 API
export const requestHint = async (
  roomId: number,
  data: HintCreateRequest,
): Promise<HintCreateResponse> => {
  const response = await api.post(`/rooms/${roomId}/hints`, data);
  return response.data.result;
};

// 힌트 이력 조회 API
export const getHintHistory = async (
  roomId: number,
): Promise<HintMessage[]> => {
  const response = await api.get(`/rooms/${roomId}/hints`);
  const historyItems: HintHistoryItem[] = response.data.result;

  // 백엔드 응답을 HintMessage 형태로 변환
  return historyItems.map((item, index) => ({
    id: `history-${item.timestamp}-${index}`,
    type: item.type === 'QUESTION' ? 'QUESTION' : 'RESPONSE',
    userId: item.userId,
    nickname: item.nickname || (item.type === 'RESPONSE' ? 'AI' : 'Unknown'),
    profileUrl: item.profileUrl || '',
    content: item.content,
    timestamp: item.timestamp,
    success: item.success,
    guardrailPassed: item.guardrailPassed,
    rejectionReason: item.rejectionReason,
  }));
};
