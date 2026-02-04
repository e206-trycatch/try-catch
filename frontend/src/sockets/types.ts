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
  | TimeOutMessage;

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
