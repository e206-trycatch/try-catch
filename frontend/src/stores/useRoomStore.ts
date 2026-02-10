// ! src/stores/useRoomStore.ts
// * Facade pattern
// - 기존 API 유지하면서 내부는 분리된 stores 사용
import { useMemo } from 'react';

import type { QuestDetail } from '../api/roomApi';
import {
  buildCreatePayload,
  buildMultiRoomPayload,
  validateDraft,
} from './room/roomUtils';
import { useQuestCacheStore } from './room/useQuestCacheStore';
import { useRoomDraftStore } from './room/useRoomDraftStore';
import { useRoomMetaStore } from './room/useRoomMetaStore';

// Re-export types for backward compatibility
export type {
  AvailableFrameworks,
  CreateRoomRequest,
  FrameworkItem,
  GameMode,
  Position,
  RoomDraft,
} from './room/types';

export type RoomStatus = 'CREATED' | 'PLAYING' | 'ENDED';

// Facade interface - 기존 API 완전 호환
interface RoomCreationState {
  // Getters (computed)
  draft: ReturnType<typeof useRoomDraftStore.getState>['draft'];
  currentRoomId: number | null;
  currentQuestId: number | null;

  questList: QuestDetail[] | null;
  questListThemeId: number | null;

  themeName: string | null;
  themeImageUrl: string | null;
  availableFrameworks: ReturnType<
    typeof useRoomMetaStore.getState
  >['availableFrameworks'];

  // Quest actions
  setQuestList: (themeId: number, list: QuestDetail[]) => void;
  clearQuestList: () => void;

  // Meta actions
  setThemeName: (name: string) => void;
  setThemeImageUrl: (url: string | null) => void;
  setAvailableFrameworks: (
    data: NonNullable<
      ReturnType<typeof useRoomMetaStore.getState>['availableFrameworks']
    >,
  ) => void;
  clearAvailableFrameworks: () => void;
  setRoomId: (id: number | string) => void;
  setCurrentQuestId: (id: number | null) => void;

  // Draft actions
  setMode: (
    mode: ReturnType<typeof useRoomDraftStore.getState>['draft']['mode'],
  ) => void;
  setThemeId: (themeId: number) => void;
  setRoomName: (name: string) => void;

  setPosition: (
    position: NonNullable<
      ReturnType<typeof useRoomDraftStore.getState>['draft']['position']
    >,
  ) => void;
  setSelectedFrameworkId: (frameworkId: number | null) => void;

  setFullstackFrameworks: (
    frontendId: number | null,
    backendId: number | null,
  ) => void;

  setFrameworkIds: (ids: {
    frontendId?: number | null;
    backendId?: number | null;
  }) => void;

  setLife: (life: number) => void;
  setHints: (count: number) => void;

  setHostPosition: (
    position: NonNullable<
      ReturnType<typeof useRoomDraftStore.getState>['draft']['hostPosition']
    >,
  ) => void;
  setHostFrameworkId: (frameworkId: number | null) => void;
  setGuestPosition: (
    position: NonNullable<
      ReturnType<typeof useRoomDraftStore.getState>['draft']['guestPosition']
    >,
  ) => void;
  setGuestFrameworkId: (frameworkId: number | null) => void;

  // Validation & payload builders
  validateDraft: () => ReturnType<typeof validateDraft>;
  buildCreatePayload: () => ReturnType<typeof buildCreatePayload>;
  buildMultiRoomPayload: () => ReturnType<typeof buildMultiRoomPayload>;

  // Reset
  resetRoomCreation: () => void;
}

// Helper to pick first framework
const pickFirstFrameworkId = (
  list:
    | NonNullable<
        ReturnType<typeof useRoomMetaStore.getState>['availableFrameworks']
      >['FRONTEND']
    | undefined,
): number | null => {
  if (!list || list.length === 0) return null;
  return list[0].id;
};

// Actions (한 번만 생성, 재사용)
const actions = {
  get setQuestList() {
    return useQuestCacheStore.getState().setQuestList;
  },
  get clearQuestList() {
    return useQuestCacheStore.getState().clearQuestList;
  },
  get setThemeName() {
    return useRoomMetaStore.getState().setThemeName;
  },
  get setThemeImageUrl() {
    return useRoomMetaStore.getState().setThemeImageUrl;
  },
  setAvailableFrameworks: (
    data: NonNullable<
      ReturnType<typeof useRoomMetaStore.getState>['availableFrameworks']
    >,
  ) => {
    const draftState = useRoomDraftStore.getState();
    const currentPosition = draftState.draft.position;

    if (currentPosition) {
      const firstId =
        currentPosition === 'FRONTEND'
          ? pickFirstFrameworkId(data.FRONTEND)
          : pickFirstFrameworkId(data.BACKEND);

      const nextSelected = draftState.draft.selectedFrameworkId ?? firstId;

      if (currentPosition === 'FRONTEND') {
        useRoomDraftStore.setState((s) => ({
          draft: {
            ...s.draft,
            selectedFrameworkId: nextSelected,
            frontendId: nextSelected,
            backendId: null,
          },
        }));
      } else if (currentPosition === 'BACKEND') {
        useRoomDraftStore.setState((s) => ({
          draft: {
            ...s.draft,
            selectedFrameworkId: nextSelected,
            backendId: nextSelected,
            frontendId: null,
          },
        }));
      }
    }

    useRoomMetaStore.getState().setAvailableFrameworks(data);
  },
  get clearAvailableFrameworks() {
    return useRoomMetaStore.getState().clearAvailableFrameworks;
  },
  get setRoomId() {
    return useRoomDraftStore.getState().setRoomId;
  },
  get setCurrentQuestId() {
    return useRoomDraftStore.getState().setCurrentQuestId;
  },
  get setMode() {
    return useRoomDraftStore.getState().setMode;
  },
  get setThemeId() {
    return useRoomDraftStore.getState().setThemeId;
  },
  get setRoomName() {
    return useRoomDraftStore.getState().setRoomName;
  },
  setPosition: (
    position: NonNullable<
      ReturnType<typeof useRoomDraftStore.getState>['draft']['position']
    >,
  ) => {
    const metaState = useRoomMetaStore.getState();
    useRoomDraftStore
      .getState()
      .setPosition(position, metaState.availableFrameworks);
  },
  get setSelectedFrameworkId() {
    return useRoomDraftStore.getState().setSelectedFrameworkId;
  },
  get setFullstackFrameworks() {
    return useRoomDraftStore.getState().setFullstackFrameworks;
  },
  get setFrameworkIds() {
    return useRoomDraftStore.getState().setFrameworkIds;
  },
  get setLife() {
    return useRoomDraftStore.getState().setLife;
  },
  get setHints() {
    return useRoomDraftStore.getState().setHints;
  },
  setHostPosition: (
    position: NonNullable<
      ReturnType<typeof useRoomDraftStore.getState>['draft']['hostPosition']
    >,
  ) => {
    const metaState = useRoomMetaStore.getState();
    useRoomDraftStore
      .getState()
      .setHostPosition(position, metaState.availableFrameworks);
  },
  get setHostFrameworkId() {
    return useRoomDraftStore.getState().setHostFrameworkId;
  },
  setGuestPosition: (
    position: NonNullable<
      ReturnType<typeof useRoomDraftStore.getState>['draft']['guestPosition']
    >,
  ) => {
    const metaState = useRoomMetaStore.getState();
    useRoomDraftStore
      .getState()
      .setGuestPosition(position, metaState.availableFrameworks);
  },
  get setGuestFrameworkId() {
    return useRoomDraftStore.getState().setGuestFrameworkId;
  },
  validateDraft: () => {
    return validateDraft(useRoomDraftStore.getState().draft);
  },
  buildCreatePayload: () => {
    return buildCreatePayload(useRoomDraftStore.getState().draft);
  },
  buildMultiRoomPayload: () => {
    return buildMultiRoomPayload(useRoomDraftStore.getState().draft);
  },
  resetRoomCreation: () => {
    useRoomDraftStore.getState().resetDraft();
    useRoomMetaStore.getState().resetMeta();
    useQuestCacheStore.getState().clearQuestList();
  },
};

/**
 * Facade Store - 기존 useRoomStore API 완전 유지
 * 내부적으로는 분리된 stores 사용
 */
const getState = (): RoomCreationState => {
  const draftStore = useRoomDraftStore.getState();
  const metaStore = useRoomMetaStore.getState();
  const questStore = useQuestCacheStore.getState();

  return {
    // Getters
    draft: draftStore.draft,
    currentRoomId: draftStore.currentRoomId,
    currentQuestId: draftStore.currentQuestId,

    questList: questStore.questList,
    questListThemeId: questStore.questListThemeId,

    themeName: metaStore.themeName,
    themeImageUrl: metaStore.themeImageUrl,
    availableFrameworks: metaStore.availableFrameworks,

    // Actions (재사용)
    ...actions,
  };
};

// Hook wrapper (selector pattern) - selector를 통한 부분 구독만 지원
function useRoomStoreHook<T>(selector: (state: RoomCreationState) => T): T;
function useRoomStoreHook(): RoomCreationState;
function useRoomStoreHook<T = RoomCreationState>(
  selector?: (state: RoomCreationState) => T,
): T {
  // Subscribe to individual stores for reactivity (state만)
  const draft = useRoomDraftStore((s) => s.draft);
  const currentRoomId = useRoomDraftStore((s) => s.currentRoomId);
  const currentQuestId = useRoomDraftStore((s) => s.currentQuestId);

  const questList = useQuestCacheStore((s) => s.questList);
  const questListThemeId = useQuestCacheStore((s) => s.questListThemeId);

  const themeName = useRoomMetaStore((s) => s.themeName);
  const themeImageUrl = useRoomMetaStore((s) => s.themeImageUrl);
  const availableFrameworks = useRoomMetaStore((s) => s.availableFrameworks);

  // Construct state with memoization (actions는 동일한 참조 유지)
  const state: RoomCreationState = useMemo(
    () => ({
      draft,
      currentRoomId,
      currentQuestId,
      questList,
      questListThemeId,
      themeName,
      themeImageUrl,
      availableFrameworks,
      // Actions는 동일한 참조 유지
      ...actions,
    }),
    [
      draft,
      currentRoomId,
      currentQuestId,
      questList,
      questListThemeId,
      themeName,
      themeImageUrl,
      availableFrameworks,
    ],
  );

  return selector ? selector(state) : (state as T);
}

// Attach static methods
useRoomStoreHook.getState = getState;
useRoomStoreHook.subscribe = useRoomDraftStore.subscribe;

export const useRoomStore = useRoomStoreHook;
