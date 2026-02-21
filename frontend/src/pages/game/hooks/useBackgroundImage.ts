import { useEffect, useState } from 'react';

import { getQuestStoriesInfo } from '@/api/questStories';

export function useBackgroundImage(questId: string | undefined) {
  const [backgroundImg, setBackgroundImg] = useState<string | null>(null);

  useEffect(() => {
    if (!questId) return;

    const getQuestStories = async () => {
      try {
        const data = await getQuestStoriesInfo(questId);
        const lastImage = data.at(-1)?.imageUrl;
        setBackgroundImg(lastImage ?? '');
      } catch (error) {
        console.error('퀘스트 스토리 배경 이미지 로드 실패:', error);
        setBackgroundImg('');
      }
    };

    getQuestStories();
  }, [questId]);

  return backgroundImg;
}
