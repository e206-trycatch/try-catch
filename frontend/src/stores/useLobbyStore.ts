import { create } from 'zustand';

import type { MultiRoomInfo } from '../api/roomApi';
import type { GuestInfo, StartQuestData } from '../sockets/types';
import { useRoomStore } from './useRoomStore';

type LobbyStatus = 'idle' | 'loading' | 'success' | 'error';

interface LobbyState {
  roomInfo: MultiRoomInfo | null;
  status: LobbyStatus;
  errorMessage: string | null;
  startQuestData: StartQuestData | null;
  gameStarted: boolean;

  setRoomInfo: (info: MultiRoomInfo) => void;
  updateGuestJoined: (guest: GuestInfo) => void;
  updateReadyStatus: (role: 'HOST' | 'GUEST', isReady: boolean) => void;
  removeGuest: () => void;
  setStatus: (status: LobbyStatus) => void;
  setError: (message: string) => void;
  setStartQuestData: (data: StartQuestData) => void;
  setGameStarted: (roomId: number) => void;
  resetLobby: () => void;
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
  roomInfo: null,
  status: 'idle',
  errorMessage: null,
  startQuestData: null,
  gameStarted: false,

  setRoomInfo: (info) => {
    const prev = get().roomInfo;
    // guest가 null로 오면 기존 guest 유지 (타이밍 이슈 방지)
    set({
      roomInfo: {
        ...info,
        guest: info.guest ?? prev?.guest ?? null,
      },
      status: 'success',
      errorMessage: null,
    });
  },

  updateGuestJoined: (guest) => {
    const { roomInfo } = get();
    if (!roomInfo) return;

    // 방 생성 시 호스트가 설정한 게스트 포지션 사용
    // (소켓 PLAYER_JOINED 이벤트에 position 필드가 포함되지 않음)
    const draftGuestPosition = useRoomStore.getState().draft.guestPosition;

    const validPosition =
      roomInfo.guest?.position ??
      (draftGuestPosition === 'FULLSTACK' ? undefined : draftGuestPosition) ??
      undefined;

    set({
      roomInfo: {
        ...roomInfo,
        guest: {
          userId: guest.userId,
          nickname: guest.nickname,
          frameworkId: guest.frameworkId,
          frameworkName: guest.frameworkName,
          isReady: guest.isReady,
          position: validPosition,
        },
      },
    });
  },

  updateReadyStatus: (role, isReady) => {
    const { roomInfo } = get();
    if (!roomInfo) return;

    console.log(`[useLobbyStore] updateReadyStatus - ${role}: ${isReady}`);

    if (role === 'HOST') {
      set({
        roomInfo: {
          ...roomInfo,
          host: { ...roomInfo.host, isReady },
        },
      });
      console.log('[useLobbyStore] Host ready status updated:', isReady);
    } else if (role === 'GUEST' && roomInfo.guest) {
      set({
        roomInfo: {
          ...roomInfo,
          guest: { ...roomInfo.guest, isReady },
        },
      });
      console.log('[useLobbyStore] Guest ready status updated:', isReady);
    }

    // 양쪽 모두 준비 완료 확인
    const updatedStore = get();
    if (updatedStore.roomInfo) {
      const bothReady =
        updatedStore.roomInfo.host.isReady &&
        updatedStore.roomInfo.guest?.isReady;
      console.log('[useLobbyStore] Both ready check:', {
        hostReady: updatedStore.roomInfo.host.isReady,
        guestReady: updatedStore.roomInfo.guest?.isReady,
        bothReady,
      });
    }
  },

  removeGuest: () => {
    const { roomInfo } = get();
    if (!roomInfo) return;

    set({ roomInfo: { ...roomInfo, guest: null } });
  },

  setStatus: (status) => set({ status }),

  setError: (message) => set({ status: 'error', errorMessage: message }),

  setStartQuestData: (data) => set({ startQuestData: data }),

  setGameStarted: () => set({ gameStarted: true }),

  resetLobby: () =>
    set({
      roomInfo: null,
      status: 'idle',
      errorMessage: null,
      startQuestData: null,
      gameStarted: false,
    }),
}));
