import { useCallback, useEffect, useRef } from 'react';

import {
  connectStomp,
  disconnectStomp,
  sendSocketMessage,
  subscribeLobby,
  subscribeLobbyQuest,
} from '../../../sockets/stomp';
import type {
  PlayerJoinedData,
  QuestReadyStatusData,
  SocketRespDto,
  StartQuestData,
} from '../../../sockets/types';
import { useLobbyStore } from '../../../stores/useLobbyStore';
import { useSocketStore } from '../../../stores/useSocketStore';
import { useStore } from '../../../stores/useStore';

export const useLobbySocket = (roomId: number | null) => {
  const connectedRef = useRef(false);

  const handleMessage = useCallback((msg: SocketRespDto) => {
    switch (msg.type) {
      case 'PLAYER_JOINED': {
        const data = msg.data as PlayerJoinedData;
        useLobbyStore.getState().updateGuestJoined({
          userId: data.userId,
          nickname: data.nickname,
          frameworkId: data.frameworkId,
          frameworkName: data.frameworkName,
          isReady: data.isReady,
        });
        break;
      }
      case 'QUEST_READY_STATUS': {
        const data = msg.data as QuestReadyStatusData;
        const store = useLobbyStore.getState();
        store.updateReadyStatus('HOST', data.host.isReady);
        store.updateReadyStatus('GUEST', data.guest.isReady);
        break;
      }
      case 'START_QUEST': {
        const data = msg.data as StartQuestData;
        useLobbyStore.getState().setStartQuestData(data);
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (!roomId || connectedRef.current) return;

    const token = useStore.getState().accessToken;
    if (!token) return;

    const connect = async () => {
      try {
        await connectStomp(token);
        connectedRef.current = true;
        subscribeLobby(roomId, handleMessage);
        subscribeLobbyQuest(roomId, handleMessage);
      } catch (err) {
        console.error('STOMP 연결 실패:', err);
      }
    };

    connect();

    return () => {
      connectedRef.current = false;
      disconnectStomp();
    };
  }, [roomId, handleMessage]);

  const sendJoin = useCallback(
    (userId: number, nickname: string) => {
      if (!roomId) return;
      sendSocketMessage(`/app/rooms/${roomId}/join`, {
        type: 'JOIN_ROOM',
        roomId,
        userId,
        nickname,
      });
    },
    [roomId],
  );

  const sendQuestReady = useCallback(
    (questId: number) => {
      if (!roomId) return;
      const { client, connected } = useSocketStore.getState();
      if (!client || !connected) return;

      client.publish({
        destination: `/app/rooms/${roomId}/quest/ready`,
        body: JSON.stringify({ questId }),
      });
    },
    [roomId],
  );

  return { sendJoin, sendQuestReady };
};
