import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  fetchMultiQuestDetail,
  type MultiQuestParticipant,
} from '../../api/roomApi';
import { fetchThemeImageUrl } from '../../api/themeApi';
import QuestDescriptionBox from '../../components/quest/QuestDescriptionBox';
import type { QuestReadyStatusData, StartQuestData } from '../../sockets/types';
import { useRoomStore } from '../../stores/useRoomStore';
import { useStore } from '../../stores/useStore';
import { createLogger } from '../../utils/logger';
import { useQuestSocket } from './hooks/useQuestSocket';

const log = createLogger('[MultiQuestDescriptionPage');

const MultiQuestDescriptionPage: React.FC = () => {
  const navigate = useNavigate();

  // useRoomStore 상태
  const themeId = useRoomStore((state) => state.draft.themeId);
  const currentRoomId = useRoomStore((state) => state.currentRoomId);
  const currentQuestId = useRoomStore((state) => state.currentQuestId);
  const storeThemeImageUrl = useRoomStore((state) => state.themeImageUrl);
  const setThemeImageUrl = useRoomStore((state) => state.setThemeImageUrl);

  // 유저 정보(닉네임)
  const userNickname = useStore((state) => state.user?.nickname ?? null);

  // state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  interface MultiQuestState {
    questId: number;
    questOrder: number;
    title: string;
    description: string;
    participants: MultiQuestParticipant[];
  }
  const [questData, setQuestData] = useState<MultiQuestState | null>(null);
  const [themeImageUrl, setLocalThemeImageUrl] = useState<string | null>(
    storeThemeImageUrl,
  );
  const navigatingRef = useRef(false);

  const myReady = useMemo(
    () =>
      questData?.participants.find((p) => p.nickname === userNickname)?.isReady ?? false,
    [questData?.participants, userNickname],
  );

  // 테마 아이디 없거나 currentRoomId 없으면 테마 페이지로
  useEffect(() => {
    if (!themeId) {
      toast.warn('테마를 선택해주세요.', { containerId: 'global' });
      navigate('/selection/theme');
      return;
    }
    if (!currentRoomId) {
      toast.warn('방 정보를 찾을 수 없습니다.', {
        containerId: 'global',
      });
      navigate('/selection/theme');
    }
  }, [themeId, currentRoomId, navigate]);

  useEffect(() => {
    if (themeImageUrl || !themeId) return;

    (async () => {
      const imageUrl = await fetchThemeImageUrl(themeId);
      if (imageUrl) {
        setLocalThemeImageUrl(imageUrl);
        setThemeImageUrl(imageUrl);
      }
    })();
  }, [themeId, themeImageUrl, setThemeImageUrl]);

  // 멀티 모드 API 받아오기
  useEffect(() => {
    if (!currentRoomId || !currentQuestId) return;

    const loadMultiQuest = async () => {
      try {
        setLoading(true);
        const detail = await fetchMultiQuestDetail(
          currentRoomId,
          currentQuestId,
        );
        setQuestData({
          questId: detail.quest.questId,
          questOrder: detail.quest.questOrder,
          title: detail.quest.title,
          description: detail.quest.description,
          participants: detail.participants,
        })
      } catch (err) {
        log.error('멀티 퀘스트 정보 로드 실패:', err);
        setError('퀘스트 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadMultiQuest();
  }, [currentRoomId, currentQuestId, userNickname]);

  const onQuestReadyStatus = useCallback((data: QuestReadyStatusData) => {
    setQuestData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        participants: prev.participants.map((p) => {
          if (p.role === 'HOST') return { ...p, isReady: data.host.isReady };
          if (p.role === 'GUEST') return { ...p, isReady: data.guest.isReady };
          return p;
        }),
      };
    });
  }, []);

  // 웹소켓 callback: START QUEST
  const onStartQuest = useCallback(
    (data: StartQuestData) => {
      if (navigatingRef.current) return;
      navigatingRef.current = true;

      log.log('START_QUEST received, navigating to game...');
      navigate(`/game/${data.roomId}/${data.questId}`);
    },
    [navigate],
  );

  // 웹소켓 연결
  const { sendQuestReady } = useQuestSocket(currentRoomId, {
    onQuestReadyStatus,
    onStartQuest,
  });

  // 준비 핸들러 (서버 응답(onQuestReadyStatus)으로만 상태 반영)
  const handleReady = () => {
    // 이미 ready면 다시 클릭 못하기 막기 (토글 방지)
    if (myReady) return;
    if (questData) {
      sendQuestReady(questData.questId);
    }
  };

  // 로딩 처리
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-white">퀘스트 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 처리
  // - 에러 가드(!questData)를 통과한 이후이므로 questData는 non-null이 보장
  if (error || !questData) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">
            {error || '퀘스트 정보를 찾을 수 없습니다.'}
          </p>
          <button
            onClick={() => navigate('/selection/theme')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
          >
            테마 선택으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 퀘스트 설명 불러오기
  return (
    <div className="w-screen h-screen flex items-center justify-center relative">
      {themeImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${themeImageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      <div className="flex items-center justify-center z-10">
        <QuestDescriptionBox
          questOrder={questData.questOrder}
          themeName={questData.title}
          questDescription={questData.description}
          onStart={() => {}}
          isMulti={true}
          participants={questData.participants}
          myReady={myReady}
          onReady={handleReady}
        />
      </div>
    </div>
  );
};

export default MultiQuestDescriptionPage;
