import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchQuestList, type QuestDetail } from '../../api/roomApi';
import QuestDescriptionBox from '../../components/quest/QuestDescriptionBox';
import { useRoomStore } from '../../stores/useRoomStore';

const SingleQuestDescriptionPage: React.FC = () => {
  const navigate = useNavigate();

  // useRoomStore 상태
  const themeId = useRoomStore((state) => state.draft.themeId);
  const currentRoomId = useRoomStore((state) => state.currentRoomId);
  const currentQuestId = useRoomStore((state) => state.currentQuestId);
  const themeImageUrl = useRoomStore((state) => state.themeImageUrl);
  const questList = useRoomStore((state) => state.questList);
  const questListThemeId = useRoomStore((state) => state.questListThemeId);
  const setQuestList = useRoomStore((state) => state.setQuestList);

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstQuest, setFirstQuest] = useState<QuestDetail | null>(null);

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

  // 퀘스트 리스트
  useEffect(() => {
    if (!themeId || !currentRoomId) return;

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
    themeId,
    currentRoomId,
    currentQuestId,
    questList,
    questListThemeId,
    setQuestList,
  ]);

  // currentRoomId와 firstQuest 있으면 이동, 없으면 테마로 이동
  const handleStartGame = () => {
    if (currentRoomId && firstQuest) {
      navigate(`/game/${currentRoomId}/${firstQuest.questId}`);
    } else {
      alert('방 ID 또는 퀘스트 정보를 찾을 수 없습니다.');
      navigate('/selection/theme');
    }
  };

  // 로딩 (퀘스트 정보 불러오기)
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-white">퀘스트 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 예외처리
  if (error || !firstQuest) {
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

  // 퀘스트 설명 페이지로
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
          questId={firstQuest.questOrder}
          themeName={firstQuest.title}
          questDescription={firstQuest.description}
          onStart={handleStartGame}
        />
      </div>
    </div>
  );
};

export default SingleQuestDescriptionPage;
