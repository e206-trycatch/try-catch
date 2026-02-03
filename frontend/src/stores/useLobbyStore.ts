import { create } from 'zustand';

import type { MultiRoomInfo } from '../api/roomApi';

type LobbyStatus = 'idle' | 'loading' | 'success' | 'error';

interface LobbyState {
  roomInfo: MultiRoomInfo | null;
  status: LobbyStatus;
  errorMessage: string | null;

  setRoomInfo: (info: MultiRoomInfo) => void;
  setStatus: (status: LobbyStatus) => void;
  setError: (message: string) => void;
  resetLobby: () => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  roomInfo: null,
  status: 'idle',
  errorMessage: null,

  setRoomInfo: (info) =>
    set({
      roomInfo: info,
      status: 'success',
      errorMessage: null,
    }),

  setStatus: (status) => set({ status }),

  setError: (message) => set({ status: 'error', errorMessage: message }),

  resetLobby: () =>
    set({
      roomInfo: null,
      status: 'idle',
      errorMessage: null,
    }),
}));
