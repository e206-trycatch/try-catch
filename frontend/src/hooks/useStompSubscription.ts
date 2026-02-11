import { useEffect } from 'react';

import { connectStomp } from '@/sockets/stomp';
import { useSocketStore } from '@/stores/useSocketStore';
import { createLogger } from '@/utils/logger';

import { useStore } from '../stores/useStore';

const log = createLogger('[useStompSubscription]');

export interface StompTopic<T> {
  // subscription key prefix - cleanup 시 `${key}-${roomId}`로 해제
  key: string;
  subscribeFn: (roomId: number, handler: (msg: T) => void) => void;
}

// STOMP 연결 + 구독 + cleanup 공통 훅
// - topics는 모듈 레벨 상수로 정의하여 참조 안정성을 보장할 것
export const useStompSubscription = <T>(
  roomId: number | null,
  topics: StompTopic<T>[],
  handler: (msg: T) => void,
) => {
  const token = useStore((state) => state.accessToken);
  useEffect(() => {
    if (!roomId || !token) return;

    log.log('Initiating STOMP connection for room:', roomId);

    const connect = async () => {
      try {
        await connectStomp(token);
        topics.forEach(({ subscribeFn }) => subscribeFn(roomId, handler));
      } catch (err) {
        log.error('STOMP connection failed:', err);
      }
    };

    connect();

    return () => {
      log.log('Cleaning up subscriptions for room:', roomId);
      const socketStore = useSocketStore.getState();
      topics.forEach(({ key }) =>
        socketStore.removeSubscription(`${key}-${roomId}`),
      );
    };
  }, [roomId, token, handler, topics]);
};
