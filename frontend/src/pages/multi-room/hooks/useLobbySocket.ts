import { useCallback, useEffect, useRef } from 'react';

import {
  connectStomp,
  disconnectStomp,
  sendSocketMessage,
  subscribeLobby,
} from '../../../sockets/stomp';
import type {
  PlayerJoinedData,
  ReadyChangedData,
  SocketRespDto,
} from '../../../sockets/types';
import { useLobbyStore } from '../../../stores/useLobbyStore';
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
      case 'READY_CHANGED': {
        const data = msg.data as ReadyChangedData;
        const roomInfo = useLobbyStore.getState().roomInfo;
        if (!roomInfo) break;
        const role = data.userId === roomInfo.host.userId ? 'HOST' : 'GUEST';
        useLobbyStore.getState().updateReadyStatus(role, data.isReady);
        break;
      }
      case 'GAME_START': {
        useLobbyStore.getState().setGameStarted(true);
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

  const sendReady = useCallback(
    (userId: number, isReady: boolean) => {
      if (!roomId) return;
      sendSocketMessage(`/app/rooms/${roomId}/ready`, {
        type: 'READY',
        roomId,
        userId,
        isReady,
      });
    },
    [roomId],
  );

  return { sendJoin, sendReady };
};
