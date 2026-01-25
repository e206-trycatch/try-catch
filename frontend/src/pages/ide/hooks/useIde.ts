import { useMemo, useState } from 'react';

import type { FileNode } from '../types/ideTypes';

export function useIde(root: FileNode) {
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // 파일 탐색기에서 현재 열려 있는 폴더 id(string 타입)들을 저장하는 상태
  // Set을 사용해 중복 없이 폴더 열림 상태를 관리
  // 함수 형태 => 첫 렌더링 때만 Set을 생성하도록 함 (리렌더 시 재생성 방지)
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['root']),
  );

  // 폴더를 클릭했을 때 열고 닫는 기능
  const toggleFolder = (folderId: string) => {
    setExpanded((prev) => {
      // 이전 state를 기반으로 새로운 state 만들기
      const next = new Set(prev); // 기존 Set을 직접 수정하지 않도록 주의할 것! => 복사본 만들기

      // 1. 포함되어 있는 경우 = 열려 있는 폴더
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  return {
    expanded,
    toggleFolder,
  };
}
