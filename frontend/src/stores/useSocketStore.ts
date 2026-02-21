import type { Client, StompSubscription } from '@stomp/stompjs';
import { create } from 'zustand';

interface SocketState {
  client: Client | null;
  connected: boolean;
  subscriptions: Map<string, StompSubscription>;

  setClient: (client: Client | null) => void;
  setConnected: (value: boolean) => void;
  addSubscription: (key: string, sub: StompSubscription) => void;
  removeSubscription: (key: string) => void;
  clearSubscriptions: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  client: null,
  connected: false,
  subscriptions: new Map(),

  setClient: (client) => set({ client }),

  setConnected: (value) => set({ connected: value }),

  addSubscription: (key, sub) => {
    const map = new Map(get().subscriptions);
    map.set(key, sub);
    set({ subscriptions: map });
  },

  removeSubscription: (key) => {
    const map = new Map(get().subscriptions);
    map.get(key)?.unsubscribe();
    map.delete(key);
    set({ subscriptions: map });
  },

  clearSubscriptions: () => {
    get().subscriptions.forEach((sub) => sub.unsubscribe());
    set({ subscriptions: new Map() });
  },
}));
