import React from 'react';

import QuestDescriptionBox from '../../components/quest/QuestDescriptionBox';
import { MOCK_THEMES } from '../../mocks/mockData';

const QuestDescriptionPage: React.FC = () => {
  // mockData의 Theme 데이터를 직접 사용
  const currentTheme = MOCK_THEMES[0];

  // Todo: 실제 데이터 연결 후 수정 사항 (배경 이미지, 앞 페이지 데이터 제대로 가져왔는지 등)
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
