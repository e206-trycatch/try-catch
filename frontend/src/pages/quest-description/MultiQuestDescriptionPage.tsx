import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../api/api';
import {
  fetchMultiQuestDetail,
  type MultiQuestParticipant,
} from '../../api/roomApi';
import QuestDescriptionBox from '../../components/quest/QuestDescriptionBox';
import type { QuestReadyStatusData, StartQuestData } from '../../sockets/types';
import { useRoomStore } from '../../stores/useRoomStore';
import { useStore } from '../../stores/useStore';
import { useQuestSocket } from './hooks/useQuestSocket';

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
  const [multiQuestId, setMultiQuestId] = useState<number | null>(null);
  const [multiQuestOrder, setMultiQuestOrder] = useState<number>(1);
  const [multiQuestTitle, setMultiQuestTitle] = useState('');
  const [multiQuestDescription, setMultiQuestDescription] = useState('');
  const [participants, setParticipants] = useState<MultiQuestParticipant[]>([]);
  const [themeImageUrl, setLocalThemeImageUrl] = useState<string | null>(
    storeThemeImageUrl,
  );
  const navigatingRef = useRef(false);

  // myReady는 participants에서 계산 (단일 출처 원칙)
  const myReady = useMemo(
    () => participants.find((p) => p.nickname === userNickname)?.isReady ?? false,
    [participants, userNickname],
  );

  // 테마 아이디 없거나 currentRoomId 없으면 테마 페이지로
  useEffect(() => {
    if (!themeId) {
      alert('테마를 선택해주세요.');
      navigate('/selection/theme');
      return;
    }
    if (!currentRoomId) {
      alert('방 정보를 찾을 수 없습니다.');
      navigate('/selection/theme');
    }
  }, [themeId, currentRoomId, navigate]);

  // themeImageUrl이 없으면 테마 목록에서 가져오기 (guest용 fallback)
  useEffect(() => {
    if (themeImageUrl || !themeId) return;

    const fetchThemeImage = async () => {
      try {
        const { data } = await api.get('/themes');
        const themes = data.result?.result;
        if (Array.isArray(themes)) {
          const theme = themes.find(
            (t: { themeId: number; themeImageUrl?: string }) =>
              t.themeId === themeId,
          );
          if (theme?.themeImageUrl) {
            setLocalThemeImageUrl(theme.themeImageUrl);
            setThemeImageUrl(theme.themeImageUrl);
          }
        }
      } catch (err) {
        console.error('테마 이미지 URL 로드 실패:', err);
      }
    };

    fetchThemeImage();
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
        setMultiQuestId(detail.quest.questId);
        setMultiQuestOrder(detail.quest.questOrder);
        setMultiQuestTitle(detail.quest.title);
        setMultiQuestDescription(detail.quest.description);
        // 서버에서 2명이 아니면 isReady를 false로 보내주므로 그대로 사용
        setParticipants(detail.participants);
      } catch (err) {
        console.error('멀티 퀘스트 정보 로드 실패:', err);
        setError('퀘스트 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadMultiQuest();
  }, [currentRoomId, currentQuestId, userNickname]);

  // 웹소켓 callback : QUEST READY STATUS
  // - participants를 role 기준으로 업데이트 (myReady는 useMemo로 자동 계산됨)
  const onQuestReadyStatus = useCallback(
    (data: QuestReadyStatusData) => {
      console.log('[DEBUG] onQuestReadyStatus 호출됨');
      console.log('[DEBUG] 서버 데이터:', JSON.stringify(data, null, 2));
      console.log('[DEBUG] 현재 userNickname:', userNickname);

      setParticipants((prev) => {
        console.log(
          '[DEBUG] 기존 participants:',
          JSON.stringify(prev, null, 2),
        );

        const updated = prev.map((p) => {
          // userId 대신 role로 비교하여 host/guest ready 상태 매핑
          if (p.role === 'HOST') {
            console.log(
              `[DEBUG] HOST(${p.nickname}) isReady: ${data.host.isReady}`,
            );
            return { ...p, isReady: data.host.isReady };
          }
          if (p.role === 'GUEST') {
            console.log(
              `[DEBUG] GUEST(${p.nickname}) isReady: ${data.guest.isReady}`,
            );
            return { ...p, isReady: data.guest.isReady };
          }
          return p;
        });

        console.log(
          '[DEBUG] 업데이트된 participants:',
          JSON.stringify(updated, null, 2),
        );

        return updated;
      });
    },
    [userNickname],
  );

  // 웹소켓 callback: START QUEST
  const onStartQuest = useCallback(
    (data: StartQuestData) => {
      if (navigatingRef.current) return;
      navigatingRef.current = true;

      console.log(
        '[MultiQuestDescriptionPage] START_QUEST received, navigating to game...',
      );
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
    if (multiQuestId != null) {
      sendQuestReady(multiQuestId);
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
  if (error || !multiQuestId) {
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
          questOrder={multiQuestOrder}
          themeName={multiQuestTitle}
          questDescription={multiQuestDescription}
          onStart={() => {}}
          isMulti={true}
          participants={participants}
          myReady={myReady}
          onReady={handleReady}
        />
      </div>
    </div>
  );
};

export default MultiQuestDescriptionPage;
