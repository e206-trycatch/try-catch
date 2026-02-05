import { create } from 'zustand';

// 힌트 메시지 타입
export interface HintMessage {
  id: string;
  type: 'QUESTION' | 'RESPONSE' | 'ERROR';
  userId: number;
  nickname: string;
  profileUrl: string;
  content: string;
  timestamp: number;
  // RESPONSE 전용
  success?: boolean;
  guardrailPassed?: boolean;
  rejectionReason?: string;
}

// WebSocket에서 받는 질문 데이터
export interface HintQuestionPayload {
  userId: number;
  nickname: string;
  profileUrl: string;
  question: string;
  remainingHintCount: number;
  timestamp: number;
}

// WebSocket에서 받는 응답 데이터
export interface HintResponsePayload {
  userId: number;
  success: boolean;
  hint: string;
  guardrailPassed: boolean;
  rejectionReason: string;
  remainingHintCount: number;
  timestamp: number;
}

// WebSocket에서 받는 에러 데이터
export interface HintErrorPayload {
  userId: number;
  message: string;
  timestamp: number;
}

interface HintState {
  // 상태
  isModalOpen: boolean;
  messages: HintMessage[];
  isLoading: boolean;
  hasNewHint: boolean;
  historyLoaded: boolean;

  // 액션
  openModal: () => void;
  closeModal: () => void;
  addQuestion: (data: HintQuestionPayload) => void;
  addHintResponse: (data: HintResponsePayload) => void;
  addError: (data: HintErrorPayload) => void;
  setMessages: (messages: HintMessage[]) => void;
  setHistoryLoaded: (loaded: boolean) => void;
  clearNewHint: () => void;
  reset: () => void;
}

export const useHintStore = create<HintState>((set, get) => ({
  // 초기 상태
  isModalOpen: false,
  messages: [],
  isLoading: false,
  hasNewHint: false,
  historyLoaded: false,

  // 모달 열기
  openModal: () =>
    set({
      isModalOpen: true,
      hasNewHint: false,
    }),

  // 모달 닫기
  closeModal: () =>
    set({
      isModalOpen: false,
    }),

  // 질문 추가 (HINT_QUESTION 이벤트)
  addQuestion: (data) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `q-${data.timestamp}`,
          type: 'QUESTION',
          userId: data.userId,
          nickname: data.nickname,
          profileUrl: data.profileUrl,
          content: data.question,
          timestamp: data.timestamp,
        },
      ],
      isLoading: true,
    })),

  // AI 응답 추가 (HINT_MESSAGE 이벤트)
  addHintResponse: (data) => {
    const { isModalOpen } = get();

    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `r-${data.timestamp}`,
          type: 'RESPONSE',
          userId: data.userId,
          nickname: 'AI',
          profileUrl: '',
          content: data.hint,
          timestamp: data.timestamp,
          success: data.success,
          guardrailPassed: data.guardrailPassed,
          rejectionReason: data.rejectionReason,
        },
      ],
      isLoading: false,
      hasNewHint: !isModalOpen,
    }));

    // 8초 후 알림 자동 소멸
    if (!isModalOpen) {
      setTimeout(() => {
        const currentState = get();
        if (!currentState.isModalOpen && currentState.hasNewHint) {
          set({ hasNewHint: false });
        }
      }, 8000);
    }
  },

  // 에러 추가 (HINT_ERROR 이벤트)
  addError: (data) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `e-${data.timestamp}`,
          type: 'ERROR',
          userId: data.userId,
          nickname: 'System',
          profileUrl: '',
          content: data.message,
          timestamp: data.timestamp,
        },
      ],
      isLoading: false,
    })),

  // 이력 로드 (GET API 응답)
  setMessages: (messages) => set({ messages }),

  // 이력 로드 완료 플래그
  setHistoryLoaded: (loaded) => set({ historyLoaded: loaded }),

  // 알림 제거
  clearNewHint: () => set({ hasNewHint: false }),

  // 방 이동 시 초기화
  reset: () =>
    set({
      isModalOpen: false,
      messages: [],
      isLoading: false,
      hasNewHint: false,
      historyLoaded: false,
    }),
}));
