// src/stores/useRoomStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameMode = 'SINGLE' | 'MULTI';
export type RoomStatus = 'CREATED' | 'PLAYING' | 'ENDED';

export type Position = 'FRONTEND' | 'BACKEND';

export interface FrameworkItem {
  id: number;
  name: string;
}

export interface AvailableFrameworks {
  FRONTEND: FrameworkItem[];
  BACKEND: FrameworkItem[];
}

export interface RoomDraft {
  // 아직 선택 전이면 null 가능
  mode: GameMode | null;
  themeId: number | null;

  // 상세 추가 설정
  roomName: string;

  // 싱글 설정용
  position: Position | null;
  selectedFrameworkId: number | null;

  // 서버 요청용 (ERD 반영: FE/BE 분리)
  frontendId: number | null;
  backendId: number | null;

  // 게임 룰(목숨 3개, 힌트 3개)
  life: number; // default 3
  hints: number; // default 3
}

export interface CreateRoomRequest {
  themeId: number;
  position: string;
  frontId: number | null;
  backId: number | null;
}

interface RoomCreationState {
  draft: RoomDraft;
  currentRoomId: number | null;
  currentQuestId: number | null;

  // 서버에서 받아오는 프레임워크 목록 저장
  availableFrameworks: AvailableFrameworks | null;
  setAvailableFrameworks: (data: AvailableFrameworks) => void;
  clearAvailableFrameworks: () => void;
  setRoomId: (id: number | string) => void;
  setCurrentQuestId: (id: number | null) => void;

  // 동작
  setMode: (mode: GameMode) => void;
  setThemeId: (themeId: number) => void;

  setRoomName: (name: string) => void;

  // 싱글 설정용 액션
  setPosition: (position: Position) => void;
  setSelectedFrameworkId: (frameworkId: number | null) => void;

  // (직접 id 세팅이 필요한 경우 대비 - 유지)
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

  position: null,
  selectedFrameworkId: null,

  frontendId: null,
  backendId: null,

  life: 3,
  hints: 3,
};

const pickFirstFrameworkId = (
  list: FrameworkItem[] | undefined,
): number | null => {
  if (!list || list.length === 0) return null;
  return list[0].id;
};

export const useRoomStore = create<RoomCreationState>()(
  persist(
    (set, get) => ({
      draft: DEFAULT_DRAFT,
      currentRoomId: null,
      currentQuestId: null,

      availableFrameworks: null,

      setAvailableFrameworks: (data) =>
        set((s) => {
          // 이미 포지션이 선택돼 있으면, 그 포지션의 첫 framework로 기본 선택해줄 수도 있음(UX)
          const currentPosition = s.draft.position;

          if (!currentPosition) {
            return { availableFrameworks: data };
          }

          const firstId =
            currentPosition === 'FRONTEND'
              ? pickFirstFrameworkId(data.FRONTEND)
              : pickFirstFrameworkId(data.BACKEND);

          // 선택값이 없을 때만 자동 세팅(사용자가 이미 고른 경우 존중)
          const nextSelected = s.draft.selectedFrameworkId ?? firstId;

          // position에 따라 frontendId/backendId 반영
          const nextDraft =
            currentPosition === 'FRONTEND'
              ? {
                  ...s.draft,
                  selectedFrameworkId: nextSelected,
                  frontendId: nextSelected,
                  backendId: null,
                }
              : {
                  ...s.draft,
                  selectedFrameworkId: nextSelected,
                  backendId: nextSelected,
                  frontendId: null,
                };

          return {
            availableFrameworks: data,
            draft: nextDraft,
          };
        }),

      clearAvailableFrameworks: () => set({ availableFrameworks: null }),

      setRoomId: (id) =>
        set({ currentRoomId: typeof id === 'string' ? parseInt(id, 10) : id }),

      setCurrentQuestId: (id) => set({ currentQuestId: id }),

      setMode: (mode) =>
        set((s) => ({
          draft: { ...s.draft, mode },
        })),

      setThemeId: (themeId) =>
        set((s) => ({
          draft: { ...s.draft, themeId },
        })),

      setRoomName: (roomName) =>
        set((s) => ({
          draft: { ...s.draft, roomName },
        })),

      setPosition: (position) =>
        set((s) => {
          const af = get().availableFrameworks;

          // 포지션 바뀌면 selectedFrameworkId를 "해당 포지션의 첫 옵션"으로 초기화(있다면)
          const firstId =
            position === 'FRONTEND'
              ? pickFirstFrameworkId(af?.FRONTEND)
              : pickFirstFrameworkId(af?.BACKEND);

          const nextSelectedFrameworkId = firstId;

          // position에 따라 FE/BE id 채우기 (반대쪽은 null)
          const nextDraft =
            position === 'FRONTEND'
              ? {
                  ...s.draft,
                  position,
                  selectedFrameworkId: nextSelectedFrameworkId,
                  frontendId: nextSelectedFrameworkId,
                  backendId: null,
                }
              : {
                  ...s.draft,
                  position,
                  selectedFrameworkId: nextSelectedFrameworkId,
                  backendId: nextSelectedFrameworkId,
                  frontendId: null,
                };

          return { draft: nextDraft };
        }),

      setSelectedFrameworkId: (selectedFrameworkId) =>
        set((s) => {
          const { position } = s.draft;

          // position이 없으면 selected만 저장(나중에 position 선택 시 재정리)
          if (!position) {
            return { draft: { ...s.draft, selectedFrameworkId } };
          }

          const nextDraft =
            position === 'FRONTEND'
              ? {
                  ...s.draft,
                  selectedFrameworkId,
                  frontendId: selectedFrameworkId,
                  backendId: null,
                }
              : {
                  ...s.draft,
                  selectedFrameworkId,
                  backendId: selectedFrameworkId,
                  frontendId: null,
                };

          return { draft: nextDraft };
        }),

      setFrameworkIds: ({ frontendId, backendId }) =>
        set((s) => ({
          draft: {
            ...s.draft,
            ...(frontendId !== undefined ? { frontendId } : {}),
            ...(backendId !== undefined ? { backendId } : {}),
          },
        })),

      setLife: (life) =>
        set((s) => ({
          draft: { ...s.draft, life: Math.max(1, life) },
        })),

      setHints: (hints) =>
        set((s) => ({
          draft: { ...s.draft, hints: Math.max(0, hints) },
        })),

      validateDraft: () => {
        const { mode, themeId, life, hints, position, selectedFrameworkId } =
          get().draft;

        const errors: string[] = [];

        if (!mode) errors.push('플레이 모드를 선택해주세요.');
        if (!themeId) errors.push('플레이할 테마를 선택해주세요.');
        if (life < 1) errors.push('목숨은 최소 1개 이상이어야 합니다.');
        if (hints < 0) errors.push('힌트 개수는 0개 이상이어야 합니다.');

        // 싱글모드라면 포지션/프레임워크 선택 필수로
        if (mode === 'SINGLE') {
          if (!position) errors.push('포지션을 선택해주세요.');
          if (!selectedFrameworkId) errors.push('프레임워크를 선택해주세요.');
        }

        return errors.length ? { ok: false, errors } : { ok: true };
      },

      buildCreatePayload: () => {
        const v = get().validateDraft();
        if (!v.ok) return null;

        const { themeId, position, selectedFrameworkId } = get().draft;

        const payload: CreateRoomRequest = {
          themeId: themeId!,
          position: position!,
          frontId: position === 'FRONTEND' ? selectedFrameworkId : null,
          backId: position === 'BACKEND' ? selectedFrameworkId : null,
        };

        return payload;
      },

      resetRoomCreation: () =>
        set({
          draft: DEFAULT_DRAFT,
          availableFrameworks: null,
          currentRoomId: null,
          currentQuestId: null,
        }),
    }),
    {
      name: 'room-creation-draft',
      partialize: (s) => ({
        draft: s.draft,
        availableFrameworks: s.availableFrameworks,
      }),
    },
  ),
);
