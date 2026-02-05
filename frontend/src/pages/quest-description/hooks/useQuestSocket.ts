import { useCallback, useEffect, useRef } from 'react';

import { connectStomp, subscribeLobbyQuest } from '../../../sockets/stomp';
import type {
  QuestReadyStatusData,
  SocketRespDto,
  StartQuestData,
} from '../../../sockets/types';
import { useSocketStore } from '../../../stores/useSocketStore';
import { useStore } from '../../../stores/useStore';

interface UseQuestSocketCallbacks {
  onQuestReadyStatus: (data: QuestReadyStatusData) => void;
  onStartQuest: (data: StartQuestData) => void;
}

export const useQuestSocket = (
  roomId: number | null,
  callbacks: UseQuestSocketCallbacks,
) => {
  const connectedRef = useRef(false);
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const handleMessage = useCallback((msg: SocketRespDto) => {
    console.log('[useQuestSocket] Message received:', msg.type, msg.data);

    switch (msg.type) {
      case 'QUEST_READY_STATUS': {
        const data = msg.data as QuestReadyStatusData;
        console.log('[useQuestSocket] Quest ready status:', data);
        callbacksRef.current.onQuestReadyStatus(data);
        break;
      }
      case 'START_QUEST': {
        const data = msg.data as StartQuestData;
        console.log('[useQuestSocket] Start quest:', data);
        callbacksRef.current.onStartQuest(data);
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (!roomId || connectedRef.current) return;

    const token = useStore.getState().accessToken;
    if (!token) return;

    console.log(
      '[useQuestSocket] Initiating STOMP connection for room:',
      roomId,
    );

    const connect = async () => {
      try {
        await connectStomp(token);
        connectedRef.current = true;
        console.log(
          '[useQuestSocket] STOMP connected, subscribing to quest topic...',
        );

        subscribeLobbyQuest(roomId, handleMessage);
        console.log(
          `[useQuestSocket] Subscribed to /topic/rooms/${roomId}/quest`,
        );
      } catch (err) {
        console.error('[useQuestSocket] STOMP connection failed:', err);
      }
    };

    connect();

    return () => {
      console.log('[useQuestSocket] Cleaning up');
      connectedRef.current = false;
    };
  }, [roomId, handleMessage]);

  const sendQuestReady = useCallback(
    (questId: number) => {
      if (!roomId) return;
      const { client, connected } = useSocketStore.getState();

      console.log('[useQuestSocket] sendQuestReady:', {
        roomId,
        questId,
        hasClient: !!client,
        connected,
      });

      if (!client || !connected) {
        console.error('[useQuestSocket] Cannot send - not connected');
        return;
      }

      try {
        client.publish({
          destination: `/app/rooms/${roomId}/quest/ready`,
          body: JSON.stringify({ questId }),
        });
        console.log('[useQuestSocket] Quest ready sent for questId:', questId);
      } catch (err) {
        console.error('[useQuestSocket] Publish failed:', err);
      }
    },
    [roomId],
  );

  return { sendQuestReady };
};
