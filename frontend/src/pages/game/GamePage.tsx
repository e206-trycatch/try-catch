import { useEffect, useMemo, useState } from 'react';

import { getQuest } from '../../api/questFile';
import CodeEditor from './components/CodeEditor';
import Explorer from './components/Explorer';
import Terminal from './components/Terminal';
import { useFile } from './hooks/useFile';
import { useIde } from './hooks/useIde';
import useTerminal from './hooks/useTerminal';
import type { QuestInfo } from './types/ideTypes';
import type { FileNode } from './types/ideTypes';

export default function GamePage() {
  const [questInfo, setQuestInfo] = useState<QuestInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuest = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: 나중에 선택한 문제의 questId를 store에서 가져오도록 수정 필요
        const data = await getQuest(1);
        setQuestInfo(data);
      } catch {
        setError('문제 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadQuest();
  }, []);

  const { files } = useFile(questInfo);
  const { frontendErrorLog, backendErrorLog } = useTerminal(questInfo);

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
    return <div>불러오는 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className=" w-full px-20">
      <div className="flex border border-gray-700 ">
        <div className="w-1/4 min-w-0 bg-stone-900 border-r border-gray-700">
          <Explorer
            root={rootNode}
            expanded={ide.expanded}
            onToggleFolder={ide.toggleFolder}
            onOpenFile={ide.openFile}
          />
        </div>
        <div className="flex flex-col w-3/4 min-w-0 min-h-0">
          <div className="h-[580px] bg-[#1E1E1E] ">
            <CodeEditor
              activeFile={ide.activeFile}
              code={ide.currentCode}
              onChange={ide.setCurrentCode}
            />
          </div>
        </div>
      </div>
      <div className="border border-gray-700">
        <Terminal
          frontendErrorLog={frontendErrorLog}
          backendErrorLog={backendErrorLog}
        />
      </div>
    </div>
  );
}
