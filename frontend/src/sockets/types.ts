// 유저 정보
export interface GuestInfo {
  userId: number;
  nickname: string;
  frameworkId: number;
  frameworkName: string;
  isReady: boolean;
}

// ROOM-MULTI-008
export interface JoinRoomMessage {
  type: 'JOIN_ROOM';
  roomId: number;
  userId: number;
  nickname: string;
}

export interface GuestJoinedMessage {
  type: 'GUEST_JOINED';
  guest: GuestInfo;
}

// ROOM-MULTI-009
export interface ReadyMessage {
  type: 'READY';
  roomId: number;
  userId: number;
  isReady: boolean;
}

export interface ReadyStatusChangedMessage {
  type: 'READY_STATUS_CHANGED';
  userId: number;
  role: 'HOST' | 'GUEST';
  isReady: boolean;
}

export interface GameStartMessage {
  type: 'GAME_START';
  roomId: number;
  message: string;
}

export interface GameStartedData {
  roomId: number;
}

// ROOM-MULTI-010
export interface QuestReadyMessage {
  type: 'QUEST_READY';
  roomId: number;
  userId: number;
}

export interface QuestReadyStatusMessage {
  type: 'QUEST_READY_STATUS';
  host: {
    userId: number;
    isReady: boolean;
  };
  guest: {
    userId: number;
    isReady: boolean;
  };
}

export interface StartQuestMessage {
  type: 'START_QUEST';
  roomId: number;
  questId: number;
  message: string;
}

// ROOM-SINGLE-008
export interface TimeOutMessage {
  type: 'TIME_OUT';
  data: {
    roomId: number;
    message: string;
    deadlineAt: string;
  };
  timestamp: string;
}

// ROOM-SINGLE-007 (ROOM-MULTI-007)
export interface TimerStartedMessage {
  type: 'TIMER_STARTED';
  data: {
    roomId: number;
    startedAt: string;
    deadlineAt: string;
  };
  timestamp: string;
}

// 코드 공유 완료 메시지
export interface CodeSavedMessage {
  type: 'CODE_SAVED';
  data: {
    userId: number;
    nickname: string;
    position: string;
    savedAt: string;
  };
  timestamp: string;
}

// 클라이언트 -> 서버
export type ClientToServerMessage =
  | JoinRoomMessage
  | ReadyMessage
  | QuestReadyMessage;

// 서버 -> 클라이언트
export type ServerToClientMessage =
  | GuestJoinedMessage
  | ReadyStatusChangedMessage
  | GameStartMessage
  | QuestReadyStatusMessage
  | StartQuestMessage
  | TimerStartedMessage
  | TimeOutMessage
  | CodeSavedMessage
  | HintQuestionMessage
  | HintResponseMessage
  | HintErrorMessage;

// 백엔드 SocketRespDto 래퍼 형식
export interface SocketRespDto<T = unknown> {
  type: string;
  data: T;
  timestamp: string;
}

// 백엔드 로비 이벤트 데이터 타입
export interface PlayerJoinedData {
  userId: number;
  nickname: string;
  profileUrl: string | null;
  frameworkId: number;
  frameworkName: string;
  isReady: boolean;
}

export interface ReadyChangedData {
  userId: number;
  isReady: boolean;
}

export interface ReadyStatusDto {
  userId: number;
  isReady: boolean;
}

export interface GameStartData {
  roomId: number;
  message: string;
}

export interface QuestReadyBody {
  questId: number;
}

export interface QuestReadyStatusData {
  host: {
    userId: number;
    isReady: boolean;
  };
  guest: {
    userId: number;
    isReady: boolean;
  };
}

export interface StartQuestData {
  roomId: number;
  questId: number;
  message: string;
}

// ========== 힌트 관련 타입 ==========

// HINT_QUESTION 이벤트 데이터
export interface HintQuestionData {
  userId: number;
  nickname: string;
  profileUrl: string;
  question: string;
  remainingHintCount: number;
  timestamp: number;
}

// HINT_MESSAGE 이벤트 데이터
export interface HintMessageData {
  userId: number;
  success: boolean;
  hint: string;
  guardrailPassed: boolean;
  rejectionReason: string;
  remainingHintCount: number;
  timestamp: number;
}

// HINT_ERROR 이벤트 데이터
export interface HintErrorData {
  userId: number;
  message: string;
  timestamp: number;
}

// 힌트 이벤트 메시지 타입
export interface HintQuestionMessage {
  type: 'HINT_QUESTION';
  data: HintQuestionData;
  timestamp: string;
}

export interface HintResponseMessage {
  type: 'HINT_MESSAGE';
  data: HintMessageData;
  timestamp: string;
}

export interface HintErrorMessage {
  type: 'HINT_ERROR';
  data: HintErrorData;
  timestamp: string;
}
