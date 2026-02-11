import { useCallback, useEffect, useRef } from 'react';

import { connectStomp, subscribeLobbyQuest } from '../../../sockets/stomp';
import type {
  QuestReadyStatusData,
  QuestSocketEvent,
  StartQuestData,
} from '../../../sockets/types';
import { useSocketStore } from '../../../stores/useSocketStore';
import { useStore } from '../../../stores/useStore';
import { createLogger } from '../../../utils/logger';

const log = createLogger('[useQuestSocket]');

interface UseQuestSocketCallbacks {
  onQuestReadyStatus: (data: QuestReadyStatusData) => void;
  onStartQuest: (data: StartQuestData) => void;
}

export const useQuestSocket = (
  roomId: number | null,
  callbacks: UseQuestSocketCallbacks,
) => {
  const connectedRef = useRef(false);
  const tokenRef = useRef<string | null>(null);
  const callbacksRef = useRef<UseQuestSocketCallbacks>(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const handleMessage = useCallback((msg: QuestSocketEvent) => {
    log.log('[useQuestSocket] Message received:', msg.type, msg.data);

    switch (msg.type) {
      case 'QUEST_READY_STATUS': {
        log.log('[useQuestSocket] Quest ready status:', msg.data);
        callbacksRef.current.onQuestReadyStatus(msg.data);
        break;
      }
      case 'START_QUEST': {
        log.log('[useQuestSocket] Start quest:', msg.data);
        callbacksRef.current.onStartQuest(msg.data);
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const token = useStore.getState().accessToken;
    if (!token) return;

    const { client } = useSocketStore.getState();

    // 토큰이 바뀌면 기존 연결 해제 후 재연결
    const tokenChanged = tokenRef.current && tokenRef.current !== token;
    if (tokenChanged && client) {
      try {
        client.deactivate();
      } catch {
        useSocketStore.getState().removeSubscription(`lobby-quest-${roomId}`);
        connectedRef.current = false;
      }
    }

    if (connectedRef.current) return;

    tokenRef.current = token;

    log.log('[useQuestSocket] Initiating STOMP connection for room:', roomId);

    const connect = async () => {
      try {
        await connectStomp(token);
        connectedRef.current = true;
        log.log(
          '[useQuestSocket] STOMP connected, subscribing to quest topic...',
        );

        subscribeLobbyQuest<QuestSocketEvent>(roomId, handleMessage);
        log.log(`[useQuestSocket] Subscribed to /topic/rooms/${roomId}/quest`);
      } catch (err) {
        log.error('[useQuestSocket] STOMP connection failed:', err);
        connectedRef.current = false;
      }
    };

    connect();

    return () => {
      log.log('[useQuestSocket] Cleaning up, unsubscribing from quest topic');
      connectedRef.current = false;
      useSocketStore.getState().removeSubscription(`lobby-quest-${roomId}`);
    };
  }, [roomId, handleMessage]);

  const sendQuestReady = useCallback(
    (questId: number) => {
      if (!roomId) return;
      const { client, connected } = useSocketStore.getState();

      log.log('[useQuestSocket] sendQuestReady:', {
        roomId,
        questId,
        hasClient: !!client,
        connected,
      });

      if (!client || !connected) {
        log.error('[useQuestSocket] Cannot send - not connected');
        return;
      }

      try {
        client.publish({
          destination: `/app/rooms/${roomId}/quest/ready`,
          body: JSON.stringify({ questId }),
        });
        log.log('[useQuestSocket] Quest ready sent for questId:', questId);
      } catch (err) {
        log.error('[useQuestSocket] Publish failed:', err);
      }
    },
    [roomId],
  );

  return { sendQuestReady };
};
