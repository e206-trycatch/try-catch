// ! src/stores/useRoomStore.ts
// * Facade pattern
// - 기존 API 유지하면서 내부는 분리된 stores 사용
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

/**
 * Facade Store - 기존 useRoomStore API 완전 유지
 * 내부적으로는 분리된 stores 사용
 */
const createFacadeStore = () => {
  // getState implementation
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

      // Quest actions
      setQuestList: questStore.setQuestList,
      clearQuestList: questStore.clearQuestList,

      // Meta actions
      setThemeName: metaStore.setThemeName,
      setThemeImageUrl: metaStore.setThemeImageUrl,
      setAvailableFrameworks: (data) => {
        const draftState = useRoomDraftStore.getState();
        const currentPosition = draftState.draft.position;

        // 기존 로직: position이 이미 선택되어 있으면 첫 framework 자동 선택
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

        metaStore.setAvailableFrameworks(data);
      },
      clearAvailableFrameworks: metaStore.clearAvailableFrameworks,
      setRoomId: draftStore.setRoomId,
      setCurrentQuestId: draftStore.setCurrentQuestId,

      // Draft actions
      setMode: draftStore.setMode,
      setThemeId: draftStore.setThemeId,
      setRoomName: draftStore.setRoomName,

      setPosition: (position) => {
        const metaState = useRoomMetaStore.getState();
        draftStore.setPosition(position, metaState.availableFrameworks);
      },
      setSelectedFrameworkId: draftStore.setSelectedFrameworkId,

      setFullstackFrameworks: draftStore.setFullstackFrameworks,
      setFrameworkIds: draftStore.setFrameworkIds,

      setLife: draftStore.setLife,
      setHints: draftStore.setHints,

      setHostPosition: (position) => {
        const metaState = useRoomMetaStore.getState();
        draftStore.setHostPosition(position, metaState.availableFrameworks);
      },
      setHostFrameworkId: draftStore.setHostFrameworkId,
      setGuestPosition: (position) => {
        const metaState = useRoomMetaStore.getState();
        draftStore.setGuestPosition(position, metaState.availableFrameworks);
      },
      setGuestFrameworkId: draftStore.setGuestFrameworkId,

      // Validation & payload builders
      validateDraft: () => validateDraft(draftStore.draft),
      buildCreatePayload: () => buildCreatePayload(draftStore.draft),
      buildMultiRoomPayload: () => buildMultiRoomPayload(draftStore.draft),

      // Reset
      resetRoomCreation: () => {
        draftStore.resetDraft();
        metaStore.resetMeta();
        questStore.clearQuestList();
      },
    };
  };

  // Hook implementation (selector 방식) - 'use'로 시작해야 React Hook 규칙 준수
  const useHook = <T = RoomCreationState>(
    selector?: (state: RoomCreationState) => T,
  ): T => {
    const draftState = useRoomDraftStore((s) => s);
    const metaState = useRoomMetaStore((s) => s);
    const questState = useQuestCacheStore((s) => s);

    const fullState = getState();

    // Apply reactivity by using individual store states
    const reactiveState: RoomCreationState = {
      ...fullState,
      draft: draftState.draft,
      currentRoomId: draftState.currentRoomId,
      currentQuestId: draftState.currentQuestId,
      questList: questState.questList,
      questListThemeId: questState.questListThemeId,
      themeName: metaState.themeName,
      themeImageUrl: metaState.themeImageUrl,
      availableFrameworks: metaState.availableFrameworks,
    };

    if (selector) {
      return selector(reactiveState);
    }

    return reactiveState as T;
  };

  // Attach getState and other methods to the hook
  useHook.getState = getState;
  useHook.subscribe = useRoomDraftStore.subscribe;

  return useHook;
};

export const useRoomStore = createFacadeStore();
