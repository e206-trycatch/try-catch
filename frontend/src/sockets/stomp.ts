import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { useSocketStore } from '../stores/useSocketStore';
import type { ClientToServerMessage, ServerToClientMessage } from './types';

// STOMP 서버에 연결
export const connectStomp = (token: string | null): Promise<void> => {
  const { client, setClient, setConnected } = useSocketStore.getState();

  // 이미 연결된 상태면 skip
  if (client?.active) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const stomp = new Client({
      webSocketFactory: () =>
        new SockJS(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // 연결 끊김 시 5초 후 자동 재연결
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

// STOMP 연결을 해제
export const disconnectStomp = () => {
  const { client, clearSubscriptions, setClient, setConnected } =
    useSocketStore.getState();

  // 모든 구독을 unsubscribe
  clearSubscriptions();
  // 클라이언트 비활성화
  client?.deactivate();

  setClient(null);
  setConnected(false);
};

// 특정 방의 게임 topic을 구독
export const subscribeRoom = (
  roomId: number,
  handler: (msg: ServerToClientMessage) => void,
) => {
  const { client, addSubscription, removeSubscription, connected } =
    useSocketStore.getState();

  if (!client || !connected) return;

  const key = `room-${roomId}`;

  // 기존 구독이 있으면 해제 (중복 구독 방지)
  removeSubscription(key);

  const sub = client.subscribe(
    `/topic/room/${roomId}/game`,
    (message: IMessage) => {
      const response: ServerToClientMessage = JSON.parse(message.body);
      handler(response);
    },
  );

  addSubscription(key, sub);
};

// 서버로 메시지 전송하기
// 클라이언트 : /app/... 경로로 전송
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
