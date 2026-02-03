import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  connectStomp,
  disconnectStomp,
  sendSocketMessage,
  subscribeRoom,
} from '../../../sockets/stomp';
import type { ServerToClientMessage } from '../../../sockets/types';
import { useLobbyStore } from '../../../stores/useLobbyStore';
import { useStore } from '../../../stores/useStore';

export const useLobbySocket = (roomId: number | null) => {
  const navigate = useNavigate();
  const connectedRef = useRef(false);

  const handleMessage = useCallback(
    (msg: ServerToClientMessage) => {
      switch (msg.type) {
        case 'GUEST_JOINED':
          useLobbyStore.getState().updateGuestJoined(msg.guest);
          break;
        case 'READY_STATUS_CHANGED':
          useLobbyStore
            .getState()
            .updateReadyStatus(msg.userId, msg.role, msg.isReady);
          break;
        case 'GAME_START':
          navigate('/story');
          break;
      }
    },
    [navigate],
  );

  useEffect(() => {
    if (!roomId || connectedRef.current) return;

    const token = useStore.getState().accessToken;
    if (!token) return;

    const connect = async () => {
      try {
        await connectStomp(token);
        connectedRef.current = true;
        subscribeRoom(roomId, handleMessage);
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
