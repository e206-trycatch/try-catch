import { useMemo } from 'react';

import type { QuestInfo } from '../types/ideTypes';
import { buildFileTree } from '../utils/fileTreeUtils';

export function useFile(questInfo: QuestInfo | null) {
  const files = useMemo(() => {
    if (!questInfo) return [];

    const tree = buildFileTree(questInfo.files);
    return tree.children ?? [];
  }, [questInfo]);

  return { files };
}
