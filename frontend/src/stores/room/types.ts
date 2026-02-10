// src/stores/room/types.ts
export type GameMode = 'SINGLE' | 'MULTI';
export type RoomStatus = 'CREATED' | 'PLAYING' | 'ENDED';
export type Position = 'FRONTEND' | 'BACKEND' | 'FULLSTACK';

export interface FrameworkItem {
  id: number;
  name: string;
}

export interface AvailableFrameworks {
  FRONTEND: FrameworkItem[];
  BACKEND: FrameworkItem[];
  FULLSTACK: FrameworkItem[];
}

export interface RoomDraft {
  // 아직 선택 전이면 null 가능
  mode: GameMode | null;
  themeId: number | null;

  // 상세 추가 설정
  roomName: string;

  // 싱글 설정용
  position: Position | null;
  selectedFrameworkId: number | null; // FULL-STACK에서는 사용 X

  // 서버 요청용 (ERD 반영: FE/BE 분리)
  // - FULL-STACK인 경우 둘 다 선택 가능
  frontendId: number | null;
  backendId: number | null;

  // 게임 룰(목숨 3개, 힌트 3개)
  life: number; // default 3
  hints: number; // default 3

  // 멀티 모드 설정용
  hostPosition: Position | null; // FRONTEND or BACKEND only
  hostFrameworkId: number | null;
  guestPosition: Position | null; // FRONTEND or BACKEND only
  guestFrameworkId: number | null;
}

export interface CreateRoomRequest {
  themeId: number;
  position: string;
  frontId: number | null;
  backId: number | null;
}

export const DEFAULT_DRAFT: RoomDraft = {
  mode: null,
  themeId: null,

  roomName: '',

  position: null,
  selectedFrameworkId: null,

  frontendId: null,
  backendId: null,

  life: 3,
  hints: 3,

  hostPosition: null,
  hostFrameworkId: null,
  guestPosition: null,
  guestFrameworkId: null,
};
