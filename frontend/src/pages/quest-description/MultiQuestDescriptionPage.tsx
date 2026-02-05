import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const themeImageUrl = useRoomStore((state) => state.themeImageUrl);

  // 유저 정보(닉네임)
  const userNickname = useStore((state) => state.user?.nickname ?? null);

  // state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [multiQuestId, setMultiQuestId] = useState<number | null>(null);
  const [multiQuestTitle, setMultiQuestTitle] = useState('');
  const [multiQuestDescription, setMultiQuestDescription] = useState('');
  const [participants, setParticipants] = useState<MultiQuestParticipant[]>([]);
  const [myReady, setMyReady] = useState(false);
  const navigatingRef = useRef(false);

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
        setMultiQuestTitle(detail.quest.title);
        setMultiQuestDescription(detail.quest.description);
        setParticipants(detail.participants);

        // 참가자들 확인
        const me = detail.participants.find((p) => p.nickname === userNickname);
        if (me) {
          setMyReady(me.isReady);
        }
        // 퀘스트 단계에서는 모든 참가자의 isReady를 false로 초기화
        // (로비 단계의 ready 상태가 그대로 넘어오므로 프론트에서 리셋)
        const resetParticipants = detail.participants.map((p) => ({
          ...p,
          isReady: false,
        }));
        setParticipants(resetParticipants);
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
  // - participants를 먼저 업데이트한 후 그 배열에서 '나'의 정보를 찾아 myReady를 설정
  const onQuestReadyStatus = useCallback(
    (data: QuestReadyStatusData) => {
      setParticipants((prev) => {
        const updated = prev.map((p) => {
          if (p.userId === data.host.userId) {
            return { ...p, isReady: data.host.isReady };
          }
          if (p.userId === data.guest.userId) {
            return { ...p, isReady: data.guest.isReady };
          }
          return p;
        });

        // 업데이트된 participants에서 '나'의 정보를 찾아 myReady 동기화
        const me = updated.find((p) => p.nickname === userNickname);
        if (me) {
          setMyReady(me.isReady);
        }

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

  // 준비 핸들러
  const handleReady = () => {
    if (multiQuestId != null) {
      sendQuestReady(multiQuestId);
      setMyReady((prev) => !prev);
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
          questId={multiQuestId}
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
