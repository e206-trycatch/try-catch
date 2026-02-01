import type { IMessage, StompSubscription } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import type { ClientToServerMessage, ServerToClientMessage } from './types';

const BASE_URL = import.meta.env.FILE_BASE_URL;

let stompClient: Client | null = null;
let roomSubscription: StompSubscription | null = null;

export const connectStomp = (token: string): Promise<void> => {
  if (stompClient?.active) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/api/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('STOMP 연결 성공');
        resolve();
      },

      onDisconnect: () => {
        console.warn('STOMP 연결 해제');
      },

      onStompError: (frame) => {
        console.error('STOMP 에러:', frame.headers['message']);
        reject(frame);
      },
    });

    client.activate();
    stompClient = client;
  });
};

export const disconnectStomp = () => {
  unsubscribeRoom();
  stompClient?.deactivate();
  stompClient = null;
};

export const isStompConnected = () => stompClient?.connected ?? false;

export const subscribeRoom = (
  roomId: number,
  handler: (msg: ServerToClientMessage) => void,
): StompSubscription | undefined => {
  if (!stompClient) return;

  roomSubscription = stompClient.subscribe(
    `/topic/room/${roomId}`,
    (message: IMessage) => {
      const response: ServerToClientMessage = JSON.parse(message.body);
      handler(response);
    },
  );
  console.log('구독 완료');

  return roomSubscription;
};

export const unsubscribeRoom = () => {
  if (roomSubscription) {
    roomSubscription.unsubscribe();
    roomSubscription = null;
    console.log('방 구독 해제');
  }
};

export const sendSocketMessage = (
  destination: string,
  body: ClientToServerMessage,
) => {
  if (!stompClient?.connected) {
    console.warn('STOMP 연결 안됐는데, 전송 시도 중');
    return;
  }

  stompClient.publish({
    destination,
    body: JSON.stringify(body),
  });
};
