// 멀티모드 재도전 STOMP 동기화 훅
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { retryMultiGame } from '../../../api/gameSession';
import { subscribeRoom } from '../../../sockets/stomp';
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
  const [isRetrying, setIsRetrying] = useState(false);

  // RETRY_STARTED 메시지 수신 시 게임 페이지로 이동
  useEffect(() => {
    if (!enabled || !roomId) return;

    console.log('[useRetrySocket] RETRY_STARTED 구독 시작, roomId:', roomId);

    const unsub = subscribeRoom(roomId, (msg) => {
      if (msg.type === 'RETRY_STARTED') {
        console.log('[useRetrySocket] RETRY_STARTED 수신, 게임 페이지로 이동');
        clearStore();
        // 주의: resetSubmissionId()를 호출하면 안 됨!
        // 이전 submissionId를 유지해야 ResultLoadingPage에서 이전 결과와 새 결과를 구분 가능
        navigate(`/game/${roomId}/${questId}`);
      }
    });

    return () => {
      console.log('[useRetrySocket] 구독 해제');
      unsub?.();
    };
  }, [enabled, roomId, questId, navigate, clearStore]);

  // 호스트가 재도전 API 호출 (게임 상태 초기화 + RETRY_STARTED 브로드캐스트)
  const sendRetry = useCallback(async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    console.log('[useRetrySocket] 재도전 API 호출, roomId:', roomId);

    try {
      await retryMultiGame(roomId);
      console.log('[useRetrySocket] 재도전 API 성공');
      // API가 RETRY_STARTED를 브로드캐스트하므로,
      // 호스트도 STOMP 메시지를 받아서 이동함
    } catch (error) {
      console.error('[useRetrySocket] 재도전 API 실패:', error);
      setIsRetrying(false);
      throw error;
    }
  }, [roomId, isRetrying]);

  return { sendRetry, isRetrying };
};

export default useRetrySocket;
