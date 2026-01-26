import { useMemo } from 'react';

import CodeEditor from './components/CodeEditor';
import Explorer from './components/Explorer';
import Terminal from './components/Terminal';
import { useFile } from './hooks/useFile';
import { useIde } from './hooks/useIde';
import useTerminal from './hooks/useTerminal';
import type { FileNode } from './types/ideTypes';

export default function GamePage() {
  const { files, loading, error } = useFile();
  const { frontendErrorLog, backendErrorLog, logLoading, logError } =
    useTerminal();

  const rootNode = useMemo<FileNode>(
    () => ({
      id: 'root',
      name: 'root',
      type: 'folder' as const, // 값을 리터럴 타입으로 고정해서 타입이 넓어지는 걸 막는 문법
      path: '/',
      role: null,
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
    <div className=" w-full px-20">
      <div className="flex">
        <div className="w-1/4 min-w-0">
          <Explorer
            root={rootNode}
            expanded={ide.expanded}
            onToggleFolder={ide.toggleFolder}
            onOpenFile={ide.openFile}
          />
        </div>
        <div className="flex flex-col w-3/4 min-w-0 min-h-0">
          <h1>code editor</h1>
          <div className="h-[580px]">
            <CodeEditor
              activeFile={ide.activeFile}
              code={ide.currentCode}
              onChange={ide.setCurrentCode}
            />
          </div>
        </div>
      </div>
      <div>
        <Terminal
          frontendErrorLog={frontendErrorLog}
          backendErrorLog={backendErrorLog}
          logLoading={logLoading}
          logError={logError}
        />
      </div>
    </div>
  );
}
