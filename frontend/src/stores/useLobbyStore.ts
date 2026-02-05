import { create } from 'zustand';

import type { MultiRoomInfo } from '../api/roomApi';
import type { GuestInfo, StartQuestData } from '../sockets/types';

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
    // 백엔드 API 응답의 isReady 값을 신뢰하고 그대로 사용
    // 폴링과 STOMP 모두 백엔드의 실제 상태를 반영하므로 별도 병합 불필요
    set({
      roomInfo: info,
      status: 'success',
      errorMessage: null,
    });
  },

  updateGuestJoined: (guest) => {
    const { roomInfo } = get();
    if (!roomInfo) return;

    set({
      roomInfo: {
        ...roomInfo,
        guest: {
          userId: guest.userId,
          nickname: guest.nickname,
          frameworkId: guest.frameworkId,
          frameworkName: guest.frameworkName,
          isReady: guest.isReady,
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
