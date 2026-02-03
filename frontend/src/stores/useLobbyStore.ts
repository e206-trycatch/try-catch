import { create } from 'zustand';

import type { MultiRoomInfo } from '../api/roomApi';
import type { GuestInfo } from '../sockets/types';

type LobbyStatus = 'idle' | 'loading' | 'success' | 'error';

interface LobbyState {
  roomInfo: MultiRoomInfo | null;
  status: LobbyStatus;
  errorMessage: string | null;
  currentUserRole: 'HOST' | 'GUEST' | null;
  currentUserId: number | null;

  setRoomInfo: (info: MultiRoomInfo) => void;
  setCurrentUser: (nickname: string) => void;
  updateGuestJoined: (guest: GuestInfo) => void;
  updateReadyStatus: (role: 'HOST' | 'GUEST', isReady: boolean) => void;
  removeGuest: () => void;
  setStatus: (status: LobbyStatus) => void;
  setError: (message: string) => void;
  resetLobby: () => void;
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
  roomInfo: null,
  status: 'idle',
  errorMessage: null,
  currentUserRole: null,
  currentUserId: null,

  setRoomInfo: (info) =>
    set({
      roomInfo: info,
      status: 'success',
      errorMessage: null,
    }),

  setCurrentUser: (nickname) => {
    const { roomInfo } = get();
    if (!roomInfo) return;

    if (roomInfo.host.nickname === nickname) {
      set({ currentUserRole: 'HOST', currentUserId: roomInfo.host.userId });
    } else if (roomInfo.guest?.nickname === nickname) {
      set({ currentUserRole: 'GUEST', currentUserId: roomInfo.guest.userId });
    }
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

  resetLobby: () =>
    set({
      roomInfo: null,
      status: 'idle',
      errorMessage: null,
      currentUserRole: null,
      currentUserId: null,
    }),
}));
