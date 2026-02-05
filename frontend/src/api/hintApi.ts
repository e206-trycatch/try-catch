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

// 힌트 이력 아이템 (백엔드 응답 - WebSocket 형식과 동일)
interface HintQuestionHistoryItem {
  type: 'HINT_QUESTION';
  data: {
    userId: number;
    nickname: string;
    profileUrl: string;
    question: string;
    timestamp: number;
  };
}

interface HintMessageHistoryItem {
  type: 'HINT_MESSAGE';
  data: {
    userId: number;
    success: boolean;
    hint: string;
    guardrailPassed: boolean;
    rejectionReason: string;
    timestamp: number;
  };
}

type HintHistoryItem = HintQuestionHistoryItem | HintMessageHistoryItem;

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
  return historyItems.map((item, index) => {
    if (item.type === 'HINT_QUESTION') {
      return {
        id: `history-${item.data.timestamp}-${index}`,
        type: 'QUESTION' as const,
        userId: item.data.userId,
        nickname: item.data.nickname || 'Unknown',
        profileUrl: item.data.profileUrl || '',
        content: item.data.question || '',
        timestamp: item.data.timestamp,
      };
    } else {
      return {
        id: `history-${item.data.timestamp}-${index}`,
        type: 'RESPONSE' as const,
        userId: item.data.userId,
        nickname: 'AI',
        profileUrl: '',
        content: item.data.hint || '',
        timestamp: item.data.timestamp,
        success: item.data.success,
        guardrailPassed: item.data.guardrailPassed,
        rejectionReason: item.data.rejectionReason,
      };
    }
  });
};
