import { useGameStore } from '@/stores/useGameStore';
import { useRoomStore } from '@/stores/useRoomStore';

import type { QuestInfo } from '../types/ideTypes';

export function resolveFramework(questInfo: QuestInfo | null): string {
  // 1. API 응답에 framework가 있으면 바로 사용 (멀티, 재도전)
  if (questInfo?.framework) {
    return questInfo.framework;
  }

  // 2. framework가 없으면 store에서 가져오기 (싱글)
  const { draft, availableFrameworks } = useRoomStore.getState();
  const { selectedFrameworkId, frontendId, backendId, position } = draft;
  const mode = useGameStore.getState().mode;

  // 싱글 풀스택
  if (mode === 'SINGLE' && position === 'FULLSTACK') {
    return 'fullstack';
  }

  // 싱글 첫 진입
  if (mode === 'SINGLE') {
    const frameworkId = selectedFrameworkId || frontendId || backendId;
    if (!frameworkId || !availableFrameworks || !position) return '';

    const frameworks = availableFrameworks[position] || [];
    const found = frameworks.find((f) => f.id === frameworkId);
    if (!found) return '';

    const name = found.name.toLowerCase();
    if (name.includes('spring')) return 'spring';
    if (name.includes('django')) return 'django';
    if (name.includes('vue')) return 'vue';
    if (name.includes('react')) return 'react';
    return name;
  }
  return '';
}
