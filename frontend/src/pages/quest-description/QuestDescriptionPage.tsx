import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  fetchMultiQuestDetail,
  fetchQuestList,
  type MultiQuestParticipant,
  type QuestDetail,
} from '../../api/roomApi';
import QuestDescriptionBox from '../../components/quest/QuestDescriptionBox';
import type { QuestReadyStatusData, StartQuestData } from '../../sockets/types';
import { useRoomStore } from '../../stores/useRoomStore';
import { useStore } from '../../stores/useStore';
import { useQuestSocket } from './hooks/useQuestSocket';

const QuestDescriptionPage: React.FC = () => {
  const navigate = useNavigate();

  // Room store state
  const mode = useRoomStore((state) => state.draft.mode);
  const themeId = useRoomStore((state) => state.draft.themeId);
  const currentRoomId = useRoomStore((state) => state.currentRoomId);
  const currentQuestId = useRoomStore((state) => state.currentQuestId);
  const themeImageUrl = useRoomStore((state) => state.themeImageUrl);
  const questList = useRoomStore((state) => state.questList);
  const questListThemeId = useRoomStore((state) => state.questListThemeId);
  const setQuestList = useRoomStore((state) => state.setQuestList);

  // User info (for identifying current user in multi mode)
  const userNickname = useStore((state) => state.user?.nickname ?? null);

  // Shared state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Single-player state
  const [firstQuest, setFirstQuest] = useState<QuestDetail | null>(null);

  // Multi-player state
  const [multiQuestId, setMultiQuestId] = useState<number | null>(null);
  const [multiQuestTitle, setMultiQuestTitle] = useState('');
  const [multiQuestDescription, setMultiQuestDescription] = useState('');
  const [participants, setParticipants] = useState<MultiQuestParticipant[]>([]);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [myReady, setMyReady] = useState(false);
  const navigatingRef = useRef(false);

  // ─── Guard: redirect if required store values are missing ───
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

  // ─── SINGLE MODE: Load quest list (existing behavior) ───
  useEffect(() => {
    if (mode !== 'SINGLE' || !themeId || !currentRoomId) return;

    const loadQuestList = async () => {
      try {
        setLoading(true);

        let quests: QuestDetail[];
        if (questListThemeId === themeId && questList && questList.length > 0) {
          quests = questList;
        } else {
          const response = await fetchQuestList(themeId);
          quests = response.result ?? [];
          if (quests.length > 0) {
            setQuestList(themeId, quests);
          }
        }

        if (quests.length > 0) {
          const targetQuest = currentQuestId
            ? quests.find((q) => q.questId === currentQuestId)
            : quests.find((q) => q.questOrder === 1);
          setFirstQuest(targetQuest || quests[0]);
        } else {
          setError('퀘스트 정보가 없습니다.');
        }
      } catch (err) {
        console.error('퀘스트 정보 로드 실패:', err);
        setError('퀘스트 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestList();
  }, [
    mode,
    themeId,
    currentRoomId,
    currentQuestId,
    questList,
    questListThemeId,
    setQuestList,
  ]);

  // ─── MULTI MODE: Fetch quest detail from multi API ───
  useEffect(() => {
    if (mode !== 'MULTI' || !currentRoomId || !currentQuestId) return;

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

        // Identify current user from participants
        const me = detail.participants.find((p) => p.nickname === userNickname);
        if (me) {
          setMyUserId(me.userId);
          setMyReady(me.isReady);
        }
      } catch (err) {
        console.error('멀티 퀘스트 정보 로드 실패:', err);
        setError('퀘스트 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadMultiQuest();
  }, [mode, currentRoomId, currentQuestId, userNickname]);

  // ─── MULTI MODE: WebSocket callbacks ───
  const onQuestReadyStatus = useCallback(
    (data: QuestReadyStatusData) => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.userId === data.host.userId) {
            return { ...p, isReady: data.host.isReady };
          }
          if (p.userId === data.guest.userId) {
            return { ...p, isReady: data.guest.isReady };
          }
          return p;
        }),
      );

      // Update myReady using stored userId (avoids stale closure)
      if (myUserId === data.host.userId) {
        setMyReady(data.host.isReady);
      } else if (myUserId === data.guest.userId) {
        setMyReady(data.guest.isReady);
      }
    },
    [myUserId],
  );

  const onStartQuest = useCallback(
    (data: StartQuestData) => {
      if (navigatingRef.current) return;
      navigatingRef.current = true;

      console.log(
        '[QuestDescriptionPage] START_QUEST received, navigating to game...',
      );
      navigate(`/game/${data.roomId}/${data.questId}`);
    },
    [navigate],
  );

  // ─── MULTI MODE: Connect WebSocket (pass null for SINGLE to skip) ───
  const { sendQuestReady } = useQuestSocket(
    mode === 'MULTI' ? currentRoomId : null,
    { onQuestReadyStatus, onStartQuest },
  );

  // ─── SINGLE MODE: Start handler ───
  const handleStartGame = () => {
    if (currentRoomId && firstQuest) {
      navigate(`/game/${currentRoomId}/${firstQuest.questId}`);
    } else {
      alert('방 ID 또는 퀘스트 정보를 찾을 수 없습니다.');
      navigate('/selection/theme');
    }
  };

  // ─── MULTI MODE: Ready handler ───
  const handleReady = () => {
    if (multiQuestId != null) {
      sendQuestReady(multiQuestId);
      // Optimistic toggle - server will confirm via QUEST_READY_STATUS
      setMyReady((prev) => !prev);
    }
  };

  // ─── Render: Loading ───
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-white">퀘스트 정보를 불러오는 중...</p>
      </div>
    );
  }

  // ─── Render: Error ───
  if (
    error ||
    (mode === 'SINGLE' && !firstQuest) ||
    (mode === 'MULTI' && !multiQuestId)
  ) {
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

  // ─── Render: Single Mode ───
  if (mode === 'SINGLE' && firstQuest) {
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
            questId={firstQuest.questId}
            themeName={firstQuest.title}
            questDescription={firstQuest.description}
            onStart={handleStartGame}
          />
        </div>
      </div>
    );
  }

  // ─── Render: Multi Mode ───
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
          questId={multiQuestId!}
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

export default QuestDescriptionPage;
