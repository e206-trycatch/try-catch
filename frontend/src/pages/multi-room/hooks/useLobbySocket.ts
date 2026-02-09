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

export const useLobbySocket = (
  roomId: number | null,
  me?: { userId: number; nickname: string } | null,
) => {
  const joinedRef = useRef(false);

  const handleMessage = useCallback((msg: SocketRespDto) => {
    console.log('[STOMP Message]', msg.type, msg.data);

    switch (msg.type) {
      case 'PLAYER_JOINED': {
        const data = msg.data as PlayerJoinedData;
        const store = useLobbyStore.getState();
        const roomInfo = store.roomInfo;
        if (!roomInfo) break;

        console.log('[PLAYER_JOINED] Guest joined:', data);
        // host가 보낸 or host인 PLAYER_JOINED는 guest 업데이트에 사용하지 않게
        if (data.userId === roomInfo.host.userId) {
          console.log('[PLAYED_JOINED] ignored (host join echo):', data);
          break;
        }

        store.updateGuestJoined({
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

  // 구독 설정 (roomId가 변경될 때만 재실행 - me 변경 시 구독 해제 방지)
  useEffect(() => {
    if (!roomId) return;
    const token = useStore.getState().accessToken;
    if (!token) return;

    console.log(
      '[useLobbySocket] Initiating STOMP connection for room:',
      roomId,
    );

    const connect = async () => {
      await connectStomp(token);
      subscribeLobby(roomId, handleMessage);
      subscribeLobbyQuest(roomId, handleMessage);
    };

    connect();

    return () => {
      console.log('[useLobbySocket] Cleaning up, unsubscribing from topics');
      useSocketStore.getState().removeSubscription(`lobby-${roomId}`);
      useSocketStore.getState().removeSubscription(`lobby-quest-${roomId}`);
    };
  }, [roomId, handleMessage]);

  // JOIN_ROOM 메시지 전송 (me가 로드된 후 한 번만 실행)
  useEffect(() => {
    if (!roomId || !me || joinedRef.current) return;

    const { connected } = useSocketStore.getState();
    if (!connected) {
      // 연결이 아직 안됐으면 잠시 후 재시도
      const timer = setTimeout(() => {
        const { connected: isConnected } = useSocketStore.getState();
        if (isConnected && !joinedRef.current) {
          console.log(
            '[useLobbySocket] Sending JOIN_ROOM for user:',
            me.nickname,
          );
          sendSocketMessage(`/app/rooms/${roomId}/join`, {
            type: 'JOIN_ROOM',
            roomId,
            userId: me.userId,
            nickname: me.nickname,
          });
          joinedRef.current = true;
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    console.log('[useLobbySocket] Sending JOIN_ROOM for user:', me.nickname);
    sendSocketMessage(`/app/rooms/${roomId}/join`, {
      type: 'JOIN_ROOM',
      roomId,
      userId: me.userId,
      nickname: me.nickname,
    });
    joinedRef.current = true;
  }, [roomId, me]);

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
