import { useEffect, useState } from 'react';

import { getQuestFile } from '../../../api/questFile';
import type { FileNode } from '../types/ideTypes';
import { buildFileTree } from '../utils/buildFileTree';

export function useFile() {
  const [files, setFiles] = useState<FileNode[]>([]);

  useEffect(() => {
    const loadFiles = async () => {
      // TODO: 나중에 선택한 문제의 questId를 store에서 가져오도록 수정 필요
      const data = await getQuestFile(1); // 서버 요청
      const tree = buildFileTree(data); // 트리 변환
      setFiles(tree.children ?? []); // 상태 저장
    };
    loadFiles();
  }, []);

  return files;
}
