import { useCallback, useEffect, useRef } from 'react';

import {
  type StompTopic,
  useStompSubscription,
} from '../../../hooks/useStompSubscription';
import { subscribeLobbyQuest } from '../../../sockets/stomp';
import type {
  QuestReadyStatusData,
  QuestSocketEvent,
  StartQuestData,
} from '../../../sockets/types';
import { useSocketStore } from '../../../stores/useSocketStore';
import { createLogger } from '../../../utils/logger';

const log = createLogger('[useQuestSocket]');

const QUEST_TOPICS: StompTopic<QuestSocketEvent>[] = [
  { key: 'lobby-quest', subscribeFn: subscribeLobbyQuest },
];

interface UseQuestSocketCallbacks {
  onQuestReadyStatus: (data: QuestReadyStatusData) => void;
  onStartQuest: (data: StartQuestData) => void;
}

export const useQuestSocket = (
  roomId: number | null,
  callbacks: UseQuestSocketCallbacks,
) => {
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

  useStompSubscription(roomId, QUEST_TOPICS, handleMessage);

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
