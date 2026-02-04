import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { useSocketStore } from '../stores/useSocketStore';
import type {
  ClientToServerMessage,
  ServerToClientMessage,
  SocketRespDto,
} from './types';

// STOMP 서버에 연결
export const connectStomp = (token: string | null): Promise<void> => {
  const { client, setClient, setConnected } = useSocketStore.getState();

  // 이미 연결된 상태면 skip
  if (client?.active) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const stomp = new Client({
      webSocketFactory: () => new SockJS('/api/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // 연결 끊김 시 5초 후 자동 재연결
      reconnectDelay: 5000,

      // STOMP 디버그 활성화
      debug: (str) => {
        console.log('[STOMP Debug]', str);
      },

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

// 범용 토픽 구독 (제네릭)
const subscribe = <T = ServerToClientMessage>(
  key: string,
  topic: string,
  handler: (msg: T) => void,
) => {
  const { client, addSubscription, removeSubscription, connected } =
    useSocketStore.getState();

  console.log(`[subscribe] Attempting to subscribe to ${topic}`, {
    hasClient: !!client,
    connected,
  });

  if (!client || !connected) {
    console.error(`[subscribe] Cannot subscribe to ${topic} - not connected`);
    return;
  }

  removeSubscription(key);

  const sub = client.subscribe(topic, (message: IMessage) => {
    console.log(`[subscribe] Message received on ${topic}:`, message.body);
    const response: T = JSON.parse(message.body);
    handler(response);
  });

  addSubscription(key, sub);
  console.log(
    `[subscribe] Successfully subscribed to ${topic} with key: ${key}`,
  );
};

// 게임 topic 구독
export const subscribeRoom = (
  roomId: number,
  handler: (msg: ServerToClientMessage) => void,
) => subscribe(`room-${roomId}`, `/topic/room/${roomId}/game`, handler);

// 서버로 메시지 전송하기
// 클라이언트 : /app/... 경로로 전송
export const sendSocketMessage = (
  destination: string,
  body: ClientToServerMessage,
) => {
  const { client, connected } = useSocketStore.getState();

  console.log('[sendSocketMessage] Attempting to send:', {
    destination,
    body,
    hasClient: !!client,
    connected,
    clientActive: client?.active,
  });

  if (!client || !connected) {
    console.error('[sendSocketMessage] Cannot send - not connected');
    return;
  }

  try {
    client.publish({
      destination,
      body: JSON.stringify(body),
    });
    console.log(
      '[sendSocketMessage] Message published successfully to:',
      destination,
    );
  } catch (err) {
    console.error('[sendSocketMessage] Publish failed:', err);
  }
};

// 로비 topic 구독 (백엔드: /topic/rooms/{roomId})
export const subscribeLobby = (
  roomId: number,
  handler: (msg: SocketRespDto) => void,
) =>
  subscribe<SocketRespDto>(
    `lobby-${roomId}`,
    `/topic/rooms/${roomId}`,
    handler,
  );

// 로비 퀘스트 topic 구독 (백엔드: /topic/rooms/{roomId}/quest)
export const subscribeLobbyQuest = (
  roomId: number,
  handler: (msg: SocketRespDto) => void,
) =>
  subscribe<SocketRespDto>(
    `lobby-quest-${roomId}`,
    `/topic/rooms/${roomId}/quest`,
    handler,
  );
