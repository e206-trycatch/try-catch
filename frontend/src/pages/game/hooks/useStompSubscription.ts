import { createElement, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { getSingleTimer } from '@/api/getSingleTimer';
import { startMultiGameTimer } from '@/api/startMultiGameTimer';
import { connectStomp, subscribeLobby, subscribeRoom } from '@/sockets/stomp';
import type {
  CodeSavedMessage,
  HintErrorData,
  HintMessageData,
  HintQuestionData,
} from '@/sockets/types';
import { useGameStore } from '@/stores/useGameStore';
import { useHintStore } from '@/stores/useHintStore';
import { useStore } from '@/stores/useStore';

import ShareCodeToast from '../components/toast/ShareCodeToast';
import { gameToastStyle } from '../components/toast/toastStyles';
import { TIMER_DELAY } from '../constants';

export function useStompSubscription(
  roomId: string | undefined,
  mode: string | null,
  loadShareCodeRef: React.RefObject<(() => Promise<void>) | undefined>,
) {
  const navigate = useNavigate();
  const { startTimer, expireTimer } = useGameStore();

  const unsubscribeRoomRef = useRef<(() => void) | undefined>(undefined);
  const unsubscribeLobbyRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!roomId) return;

    const { addQuestion, addHintResponse, addError, reset } =
      useHintStore.getState();
    const { setGameState, currentLife } = useGameStore.getState();

    // 방 변경 시 힌트 상태 초기화
    reset();

    const init = async () => {
      const token = useStore.getState().accessToken;
      if (token) await connectStomp(token);

      // 게임 토픽 구독 및 해제 함수 저장
      unsubscribeRoomRef.current = subscribeRoom(Number(roomId), (msg) => {
        // 타이머 이벤트
        if (msg.type === 'TIMER_STARTED') {
          startTimer(msg.data.deadlineAt);
        }
        if (msg.type === 'TIME_OUT') {
          expireTimer();
        }

        // 힌트 이벤트
        if (msg.type === 'HINT_QUESTION') {
          const data = msg.data as HintQuestionData;
          addQuestion(data);
          setGameState(currentLife, data.remainingHintCount);
        }
        if (msg.type === 'HINT_MESSAGE') {
          const data = msg.data as HintMessageData;
          addHintResponse(data);
          setGameState(
            useGameStore.getState().currentLife,
            data.remainingHintCount,
          );
        }
        if (msg.type === 'HINT_ERROR') {
          const data = msg.data as HintErrorData;
          addError(data);
        }

        if (msg.type === 'SUBMISSION_STARTED') {
          navigate(`/result/loading/${roomId}`);
        }
      });

      // 멀티모드 처리 (STOMP 구독 완료 후 ready 신호 전송)
      if (mode === 'MULTI') {
        // 타이머가 이미 시작된 경우(새로고침) ready 신호 재전송 방지
        const timeData = await getSingleTimer(Number(roomId));
        if (!timeData.startedAt) {
          await new Promise((r) => setTimeout(r, TIMER_DELAY));
          await startMultiGameTimer(Number(roomId));
        }

        // CODE_SAVED 구독 및 해제 함수 저장
        const myNickname = useStore.getState().user?.nickname;
        unsubscribeLobbyRef.current = subscribeLobby(Number(roomId), (msg) => {
          if (msg.type === 'CODE_SAVED') {
            const { nickname } = msg.data as CodeSavedMessage['data'];
            if (nickname !== myNickname) {
              const toastId = `share-code-${Date.now()}`;
              toast.info(
                createElement(ShareCodeToast, {
                  nickname,
                  toastId,
                  onLoad: () => loadShareCodeRef.current?.(),
                }),
                {
                  toastId,
                  position: 'top-left',
                  autoClose: false,
                  hideProgressBar: true,
                  closeButton: false,
                  icon: false,
                  style: {
                    ...gameToastStyle,
                    marginTop: '100px',
                    marginLeft: '60px',
                  },
                },
              );
            }
          }
        });
      }
    };

    init();

    return () => {
      // 저장된 unsub 함수로 구독 해제
      unsubscribeRoomRef.current?.();
      unsubscribeLobbyRef.current?.();
    };
  }, [roomId, mode, startTimer, expireTimer, navigate]);
}
