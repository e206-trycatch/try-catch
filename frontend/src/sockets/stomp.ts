import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { useSocketStore } from '../stores/useSocketStore';
import type { ClientToServerMessage, ServerToClientMessage } from './types';

export const connectStomp = (token: string | null): Promise<void> => {
  const { client, setClient, setConnected } = useSocketStore.getState();

  if (client?.active) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const stomp = new Client({
      webSocketFactory: () =>
        new SockJS(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('STOMP 연결 성공');
        setClient(stomp);
        setConnected(true);
        resolve();
      },

      onDisconnect: () => {
        console.warn('STOMP 연결 해제');
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error('STOMP 에러:', frame.headers['message']);
        reject(frame);
      },
    });

    stomp.activate();
  });
};

export const disconnectStomp = () => {
  const { client, clearSubscriptions, setClient, setConnected } =
    useSocketStore.getState();
  clearSubscriptions();
  client?.deactivate();
  setClient(null);
  setConnected(false);
};

export const subscribeRoom = (
  roomId: number,
  handler: (msg: ServerToClientMessage) => void,
) => {
  const { client, addSubscription, removeSubscription, connected } =
    useSocketStore.getState();

  if (!client || !connected) return;

  const key = `room-${roomId}`;

  removeSubscription(key);

  const sub = client.subscribe(`/topic/room/${roomId}`, (message: IMessage) => {
    const response: ServerToClientMessage = JSON.parse(message.body);
    handler(response);
  });

  addSubscription(key, sub);
};

export const sendSocketMessage = (
  destination: string,
  body: ClientToServerMessage,
) => {
  const { client, connected } = useSocketStore.getState();

  if (!client || !connected) {
    console.warn('STOMP 연결 안됐는데, 전송 시도 중');
    return;
  }

  client.publish({
    destination,
    body: JSON.stringify(body),
  });
};
