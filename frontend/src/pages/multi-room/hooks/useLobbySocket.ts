import { useCallback, useEffect, useRef } from 'react';

import {
  connectStomp,
  sendSocketMessage,
  subscribeLobby,
  subscribeLobbyQuest,
} from '../../../sockets/stomp';
import type {
  GameStartedData,
  PlayerJoinedData,
  QuestReadyStatusData,
  ReadyStatusDto,
  SocketRespDto,
  StartQuestData,
} from '../../../sockets/types';
import { useLobbyStore } from '../../../stores/useLobbyStore';
import { useSocketStore } from '../../../stores/useSocketStore';
import { useStore } from '../../../stores/useStore';

export const useLobbySocket = (roomId: number | null) => {
  const connectedRef = useRef(false);

  const handleMessage = useCallback((msg: SocketRespDto) => {
    console.log('[STOMP Message]', msg.type, msg.data);

    switch (msg.type) {
      case 'PLAYER_JOINED': {
        const data = msg.data as PlayerJoinedData;
        console.log('[PLAYER_JOINED] Guest joined:', data);
        useLobbyStore.getState().updateGuestJoined({
          userId: data.userId,
          nickname: data.nickname,
          frameworkId: data.frameworkId,
          frameworkName: data.frameworkName,
          isReady: data.isReady,
        });
        break;
      }
      case 'READY_CHANGED': {
        const data = msg.data as ReadyStatusDto;
        console.log('[READY_CHANGED] User ready status changed:', data);
        const store = useLobbyStore.getState();
        const { roomInfo } = store;
        if (!roomInfo) break;

        // userId로 HOST인지 GUEST인지 판단
        const role = roomInfo.host.userId === data.userId ? 'HOST' : 'GUEST';
        console.log(
          `[READY_CHANGED] Updating ${role} to isReady=${data.isReady}`,
        );
        store.updateReadyStatus(role, data.isReady);
        break;
      }
      case 'GAME_STARTED': {
        const data = msg.data as GameStartedData;
        console.log('[GAME_STARTED] Game starting for room:', data.roomId);
        useLobbyStore.getState().setGameStarted(data.roomId);
        break;
      }
      case 'QUEST_READY_STATUS': {
        const data = msg.data as QuestReadyStatusData;
        console.log('[QUEST_READY_STATUS] Quest ready status:', data);
        const store = useLobbyStore.getState();
        store.updateReadyStatus('HOST', data.host.isReady);
        store.updateReadyStatus('GUEST', data.guest.isReady);
        break;
      }
      case 'START_QUEST': {
        const data = msg.data as StartQuestData;
        console.log('[START_QUEST] Quest starting:', data);
        useLobbyStore.getState().setStartQuestData(data);
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (!roomId || connectedRef.current) return;

    const token = useStore.getState().accessToken;
    if (!token) return;

    console.log(
      '[useLobbySocket] Initiating STOMP connection for room:',
      roomId,
    );

    const connect = async () => {
      try {
        await connectStomp(token);
        connectedRef.current = true;
        console.log(
          '[useLobbySocket] STOMP connected, subscribing to topics...',
        );

        subscribeLobby(roomId, handleMessage);
        console.log(`[useLobbySocket] Subscribed to /topic/rooms/${roomId}`);

        subscribeLobbyQuest(roomId, handleMessage);
        console.log(
          `[useLobbySocket] Subscribed to /topic/rooms/${roomId}/quest`,
        );
      } catch (err) {
        console.error('[useLobbySocket] STOMP connection failed:', err);
      }
    };

    connect();

    return () => {
      console.log('[useLobbySocket] Cleaning up');
      connectedRef.current = false;
    };
  }, [roomId, handleMessage]);

  const sendJoin = useCallback(
    (userId: number, nickname: string) => {
      if (!roomId) return;

      console.log('[sendJoin] Preparing to send join message:', {
        roomId,
        userId,
        nickname,
      });

      sendSocketMessage(`/app/rooms/${roomId}/join`, {
        type: 'JOIN_ROOM',
        roomId,
        userId,
        nickname,
      });

      console.log('[sendJoin] Join message sent successfully');
    },
    [roomId],
  );

  const sendReady = useCallback(() => {
    if (!roomId) return;

    const { client, connected } = useSocketStore.getState();

    console.log('[sendReady] Client state check:', {
      roomId,
      hasClient: !!client,
      connected,
      clientActive: client?.active,
      clientConnected: client?.connected,
    });

    if (!client) {
      console.error('[sendReady] No client available!');
      return;
    }

    if (!connected) {
      console.error('[sendReady] Not connected!');
      return;
    }

    if (!client.active) {
      console.error('[sendReady] Client not active!');
      return;
    }

    try {
      const message = {};
      const destination = `/app/rooms/${roomId}/ready`;

      console.log('[sendReady] Publishing:', { destination, message });

      client.publish({
        destination,
        body: JSON.stringify(message),
      });

      console.log('[sendReady] Publish call completed');
    } catch (err) {
      console.error('[sendReady] Publish error:', err);
    }
  }, [roomId]);

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

  return { sendJoin, sendReady, sendQuestReady };
};
