import React from 'react';

import { useRoomStore } from '../../stores/useRoomStore';
import MultiQuestDescriptionPage from './MultiQuestDescriptionPage';
import SingleQuestDescriptionPage from './SingleQuestDescriptionPage';

// 역할에 따라 SingleQuestDescriptionPage와 MultiQuestDescriptionPage로 라우팅

const QuestDescriptionPage: React.FC = () => {
  const mode = useRoomStore((state) => state.draft.mode);

  if (mode === 'SINGLE') {
    return <SingleQuestDescriptionPage />;
  }

  if (mode === 'MULTI') {
    return <MultiQuestDescriptionPage />;
  }

  // Fallback (should not happen in normal flow)
  return <SingleQuestDescriptionPage />;
};

export default QuestDescriptionPage;
