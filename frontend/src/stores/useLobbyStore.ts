import { create } from 'zustand';

import type { MultiRoomInfo } from '../api/roomApi';
import type { GuestInfo, StartQuestData } from '../sockets/types';

type LobbyStatus = 'idle' | 'loading' | 'success' | 'error';

interface LobbyState {
  roomInfo: MultiRoomInfo | null;
  status: LobbyStatus;
  errorMessage: string | null;
  startQuestData: StartQuestData | null;

  setRoomInfo: (info: MultiRoomInfo) => void;
  updateGuestJoined: (guest: GuestInfo) => void;
  updateReadyStatus: (role: 'HOST' | 'GUEST', isReady: boolean) => void;
  removeGuest: () => void;
  setStatus: (status: LobbyStatus) => void;
  setError: (message: string) => void;
  setStartQuestData: (data: StartQuestData) => void;
  resetLobby: () => void;
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
  roomInfo: null,
  status: 'idle',
  errorMessage: null,
  startQuestData: null,

  setRoomInfo: (info) =>
    set({
      roomInfo: info,
      status: 'success',
      errorMessage: null,
    }),

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

    if (role === 'HOST') {
      set({
        roomInfo: {
          ...roomInfo,
          host: { ...roomInfo.host, isReady },
        },
      });
    } else if (role === 'GUEST' && roomInfo.guest) {
      set({
        roomInfo: {
          ...roomInfo,
          guest: { ...roomInfo.guest, isReady },
        },
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

  resetLobby: () =>
    set({
      roomInfo: null,
      status: 'idle',
      errorMessage: null,
      startQuestData: null,
    }),
}));
