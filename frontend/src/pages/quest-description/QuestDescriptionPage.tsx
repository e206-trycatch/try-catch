import React from 'react';

import QuestDescriptionBox from '../../components/quest/QuestDescriptionBox';
import { MOCK_THEMES } from '../../mocks/mockData';
import { useRoomStore } from '../../stores/useRoomStore';

const QuestDescriptionPage: React.FC = () => {
  const themeId = useRoomStore((state) => state.draft.themeId);

  // draft.themeId 기반으로 테마 찾기
  const currentTheme = MOCK_THEMES.find((theme) => theme.themeId === themeId);

  // themeId가 없거나 테마를 찾지 못한 경우 처리
  if (!themeId || !currentTheme) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-white">테마를 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center relative">
      <div className="flex items-center justify-center z-10">
        <QuestDescriptionBox
          questId={currentTheme.themeId}
          themeName={currentTheme.name}
          questDescription={currentTheme.description}
        />
      </div>
    </div>
  );
};

export default QuestDescriptionPage;
