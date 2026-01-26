// src/stores/useRoomStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameMode = 'SINGLE' | 'MULTI';
export type RoomStatus = 'CREATED' | 'PLAYING' | 'ENDED';

export interface RoomDraft {
  // 아직 선택 전이면 null 가능
  mode: GameMode | null;
  themeId: number | null;

  // 상세 추가 설정
  roomName: string;
  frontendId: number | null;
  backendId: number | null;

  // 게임 룰(목숨 3개, 힌트 3개)
  life: number; // default 3
  hints: number; // default 3
}

export interface CreateRoomRequest {
  theme_id: number;
  mode: GameMode;

  room_name?: string; // 빈 값일 때 보내지 않음
  frontend_id?: number | null;
  backend_id?: number | null;

  life?: number;
  hints?: number;
}

interface RoomCreationState {
  draft: RoomDraft;

  // 동작
  setMode: (mode: GameMode) => void;
  setThemeId: (themeId: number) => void;

  setRoomName: (name: string) => void;
  setFrameworkIds: (ids: {
    frontendId?: number | null;
    backendId?: number | null;
  }) => void;

  setLife: (life: number) => void;
  setHints: (count: number) => void;

  // 유효성 검사 및 payload 생성
  validateDraft: () => { ok: true } | { ok: false; errors: string[] };
  buildCreatePayload: () => CreateRoomRequest | null;

  // 초기화
  resetRoomCreation: () => void;
}

const DEFAULT_DRAFT: RoomDraft = {
  mode: null,
  themeId: null,

  roomName: '',
  frontendId: null,
  backendId: null,

  life: 3,
  hints: 3,
};

export const useRoomStore = create<RoomCreationState>()(
  persist(
    (set, get) => ({
      draft: DEFAULT_DRAFT,

      setMode: (mode) => set((s) => ({ draft: { ...s.draft, mode } })),
      setThemeId: (themeId) => set((s) => ({ draft: { ...s.draft, themeId } })),

      setRoomName: (roomName) => set((s) => ({ draft: { ...s.draft, roomName } })),

      setFrameworkIds: ({ frontendId, backendId }) =>
        set((s) => ({
          draft: {
            ...s.draft,
            // 전달된 값만 덮어쓰기
            ...(frontendId !== undefined ? { frontendId } : null),
            ...(backendId !== undefined ? { backendId } : null),
          },
        })),

      setLife: (life) => set((s) => ({ draft: { ...s.draft, life: Math.max(1, life) } })),
      setHints: (hints) =>
        set((s) => ({ draft: { ...s.draft, hints: Math.max(0, hints) } })),

      validateDraft: () => {
        const { mode, themeId, life, hints } = get().draft;
        const errors: string[] = [];

        if (!mode) errors.push('플레이 모드를 선택해주세요.');
        if (!themeId) errors.push('플레이할 테마를 선택해주세요.');
        if (life < 1) errors.push('목숨은 최소 1개 이상이어야 합니다.');
        if (hints < 0) errors.push('힌트 개수는 0개 이상이어야 합니다.');

        return errors.length ? { ok: false, errors } : { ok: true };
      },

      buildCreatePayload: () => {
        const v = get().validateDraft();
        if (!v.ok) return null;

        const { mode, themeId, roomName, frontendId, backendId, life, hints } = get().draft;

        const payload: CreateRoomRequest = {
          mode: mode!, // validate 통과했으니 안전
          theme_id: themeId!,
        };

        if (roomName.trim()) payload.room_name = roomName.trim();

        // 선택 기능이 붙으면 사용(조건부)
        if (frontendId !== null) payload.frontend_id = frontendId;
        if (backendId !== null) payload.backend_id = backendId;

        // 서버 디폴트로 처리하고 싶으면 이 두 줄 제거 가능
        payload.life = life;
        payload.hints = hints;

        return payload;
      },

      resetRoomCreation: () => set({ draft: DEFAULT_DRAFT }),
    }),
    {
      name: 'room-creation-draft',
      partialize: (s) => ({ draft: s.draft }),
    },
  ),
);
