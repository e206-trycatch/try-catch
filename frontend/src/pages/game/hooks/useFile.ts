import { useEffect, useState } from 'react';

import { getQuestFile } from '../../../api/questFile';
import type { FileNode } from '../types/ideTypes';
import type { QuestFile } from '../types/ideTypes';
import { buildFileTree } from '../utils/buildFileTree';

export function useFile() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: 나중에 선택한 문제의 questId를 store에서 가져오도록 수정 필요
        const data = await getQuestFile(1); // 서버 요청
        const files = data.files as QuestFile[]; // 타입 단언 (assertion) -> 우리가 Frontend, Backend, null 이렇게 지정했기 때문에
        const tree = buildFileTree(files); // 트리 변환
        setFiles(tree.children ?? []); // 상태 저장
      } catch {
        setError('파일을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadFiles();
  }, []);

  return { files, loading, error };
}
