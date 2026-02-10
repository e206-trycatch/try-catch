// src/stores/room/useRoomDraftStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  AvailableFrameworks,
  FrameworkItem,
  GameMode,
  Position,
  RoomDraft,
} from './types';
import { DEFAULT_DRAFT } from './types';

const pickFirstFrameworkId = (
  list: FrameworkItem[] | undefined,
): number | null => {
  if (!list || list.length === 0) return null;
  return list[0].id;
};

interface RoomDraftState {
  draft: RoomDraft;
  currentRoomId: number | null;
  currentQuestId: number | null;

  setMode: (mode: GameMode | null) => void;
  setThemeId: (themeId: number) => void;
  setRoomName: (name: string) => void;

  // 싱글 설정용 액션
  setPosition: (
    position: Position,
    availableFrameworks: AvailableFrameworks | null,
  ) => void;
  setSelectedFrameworkId: (frameworkId: number | null) => void;

  // FULLSTACK용 프레임워크 설정 액션
  setFullstackFrameworks: (
    frontendId: number | null,
    backendId: number | null,
  ) => void;

  // (직접 id 세팅이 필요한 경우 대비)
  setFrameworkIds: (ids: {
    frontendId?: number | null;
    backendId?: number | null;
  }) => void;

  setLife: (life: number) => void;
  setHints: (count: number) => void;

  // 멀티 모드 설정용 액션
  setHostPosition: (
    position: Position,
    availableFrameworks: AvailableFrameworks | null,
  ) => void;
  setHostFrameworkId: (frameworkId: number | null) => void;
  setGuestPosition: (
    position: Position,
    availableFrameworks: AvailableFrameworks | null,
  ) => void;
  setGuestFrameworkId: (frameworkId: number | null) => void;

  setRoomId: (id: number | string) => void;
  setCurrentQuestId: (id: number | null) => void;

  resetDraft: () => void;
}

export const useRoomDraftStore = create<RoomDraftState>()(
  persist(
    (set) => ({
      draft: DEFAULT_DRAFT,
      currentRoomId: null,
      currentQuestId: null,

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

      setPosition: (position, availableFrameworks) =>
        set((s) => {
          // FULLSTACK인 경우 frontendId와 backendId 둘 다 초기화
          if (position === 'FULLSTACK') {
            const firstFrontId = pickFirstFrameworkId(
              availableFrameworks?.FRONTEND,
            );
            const firstBackId = pickFirstFrameworkId(
              availableFrameworks?.BACKEND,
            );

            return {
              draft: {
                ...s.draft,
                position,
                selectedFrameworkId: null, // FULLSTACK에서는 미사용
                frontendId: firstFrontId,
                backendId: firstBackId,
              },
            };
          }

          // FRONTEND 또는 BACKEND인 경우
          const firstId =
            position === 'FRONTEND'
              ? pickFirstFrameworkId(availableFrameworks?.FRONTEND)
              : pickFirstFrameworkId(availableFrameworks?.BACKEND);

          const nextSelectedFrameworkId = firstId;

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

          // position이 없으면 selected만 저장
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

      setFullstackFrameworks: (frontendId, backendId) =>
        set((s) => ({
          draft: {
            ...s.draft,
            frontendId,
            backendId,
          },
        })),

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

      setHostPosition: (position, availableFrameworks) =>
        set((s) => {
          const firstId =
            position === 'FRONTEND'
              ? pickFirstFrameworkId(availableFrameworks?.FRONTEND)
              : pickFirstFrameworkId(availableFrameworks?.BACKEND);

          return {
            draft: {
              ...s.draft,
              hostPosition: position,
              hostFrameworkId: firstId,
            },
          };
        }),

      setHostFrameworkId: (frameworkId) =>
        set((s) => ({
          draft: { ...s.draft, hostFrameworkId: frameworkId },
        })),

      setGuestPosition: (position, availableFrameworks) =>
        set((s) => {
          const firstId =
            position === 'FRONTEND'
              ? pickFirstFrameworkId(availableFrameworks?.FRONTEND)
              : pickFirstFrameworkId(availableFrameworks?.BACKEND);

          return {
            draft: {
              ...s.draft,
              guestPosition: position,
              guestFrameworkId: firstId,
            },
          };
        }),

      setGuestFrameworkId: (frameworkId) =>
        set((s) => ({
          draft: { ...s.draft, guestFrameworkId: frameworkId },
        })),

      setRoomId: (id) =>
        set({ currentRoomId: typeof id === 'string' ? parseInt(id, 10) : id }),

      setCurrentQuestId: (id) => set({ currentQuestId: id }),

      resetDraft: () =>
        set({
          draft: DEFAULT_DRAFT,
          currentRoomId: null,
          currentQuestId: null,
        }),
    }),
    {
      name: 'room-draft',
      partialize: (s) => ({
        draft: s.draft,
      }),
    },
  ),
);
