import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchQuestList, type QuestDetail } from '../../api/roomApi';
import QuestDescriptionBox from '../../components/quest/QuestDescriptionBox';
import { useRoomStore } from '../../stores/useRoomStore';

const QuestDescriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const themeId = useRoomStore((state) => state.draft.themeId);
  const currentRoomId = useRoomStore((state) => state.currentRoomId);
  const currentQuestId = useRoomStore((state) => state.currentQuestId);
  const themeImageUrl = useRoomStore((state) => state.themeImageUrl);

  const [firstQuest, setFirstQuest] = useState<QuestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!themeId) {
      alert('테마를 선택해주세요.');
      navigate('/selection/theme');
      return;
    }

    if (!currentRoomId) {
      alert('방 정보를 찾을 수 없습니다.');
      navigate('/selection/theme');
      return;
    }

    const loadQuestList = async () => {
      try {
        setLoading(true);
        const response = await fetchQuestList(themeId);

        if (response.result && response.result.length > 0) {
          // currentQuestId가 있으면 해당 퀘스트를, 없으면 questOrder가 1인 첫 번째 퀘스트를 사용
          const targetQuest = currentQuestId
            ? response.result.find((q) => q.questId === currentQuestId)
            : response.result.find((q) => q.questOrder === 1);
          setFirstQuest(targetQuest || response.result[0]);
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
  }, [themeId, currentRoomId, currentQuestId, navigate]);

  const handleStartGame = () => {
    if (currentRoomId && firstQuest) {
      navigate(`/game/${currentRoomId}/${firstQuest.questId}`);
    } else {
      alert('방 ID 또는 퀘스트 정보를 찾을 수 없습니다.');
      navigate('/selection/theme');
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-white">퀘스트 정보를 불러오는 중...</p>
      </div>
    );
  }

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
};

export default QuestDescriptionPage;
