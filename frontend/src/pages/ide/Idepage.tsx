import { useMemo } from 'react';

import Explorer from './components/Explorer';
import { useFile } from './hooks/useFile';
import { useIde } from './hooks/useIde';
import type { FileNode } from './types/ideTypes';

export default function Idepage() {
  const { files, loading, error } = useFile();

  const rootNode = useMemo<FileNode>(
    () => ({
      id: 'root',
      name: 'root',
      type: 'folder' as const, // 값을 리터럴 타입으로 고정해서 타입이 넓어지는 걸 막는 문법
      path: '/',
      children: files,
    }),
    [files], // files 값이 바뀔 때마다 실행하기
  );

  const ide = useIde(rootNode);

  if (loading) {
    return <div>파일 불러오는 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Explorer
        root={rootNode}
        expanded={ide.expanded}
        onToggleFolder={ide.toggleFolder}
      />
    </div>
  );
}
