// 멀티모드 재도전 STOMP 동기화 훅
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { sendSocketMessage, subscribeRoom } from '../../../sockets/stomp';
import { useResultStore } from '../../../stores/useResultStore';

interface UseRetrySocketProps {
  roomId: number;
  questId: number;
  enabled: boolean;
}

/**
 * 멀티모드에서 RETRY_STARTED 메시지를 구독하고,
 * 호스트가 재도전을 시작하면 게스트도 함께 게임 페이지로 이동하는 훅
 */
const useRetrySocket = ({ roomId, questId, enabled }: UseRetrySocketProps) => {
  const navigate = useNavigate();
  const clearStore = useResultStore((state) => state.clear);

  // RETRY_STARTED 메시지 수신 시 게임 페이지로 이동
  useEffect(() => {
    if (!enabled || !roomId) return;

    console.log('[useRetrySocket] RETRY_STARTED 구독 시작, roomId:', roomId);

    const unsub = subscribeRoom(roomId, (msg) => {
      if (msg.type === 'RETRY_STARTED') {
        console.log('[useRetrySocket] RETRY_STARTED 수신, 게임 페이지로 이동');
        clearStore();
        navigate(`/game/${roomId}/${questId}`);
      }
    });

    return () => {
      console.log('[useRetrySocket] 구독 해제');
      unsub?.();
    };
  }, [enabled, roomId, questId, navigate, clearStore]);

  // 호스트가 재도전 시작 메시지를 전송하는 함수
  const sendRetry = useCallback(() => {
    console.log('[useRetrySocket] 재도전 메시지 전송, roomId:', roomId);
    sendSocketMessage(`/app/room/${roomId}/retry`, {});
  }, [roomId]);

  return { sendRetry };
};

export default useRetrySocket;
