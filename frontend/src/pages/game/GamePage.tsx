import { Resizable } from 're-resizable';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { codeSubmission } from '../../api/codeSubmission';
import { buildFilesRequestData } from '../../api/codeSubmissionMapper';
import { getQuest } from '../../api/questFile';
import { useGameStore } from '../../stores/useGameStore';
import { useRoomStore } from '../../stores/useRoomStore';
import { useStore } from '../../stores/useStore';
import { useSubmissionStore } from '../../stores/useSubmissionStore';
import CodeEditor from './components/CodeEditor';
import Explorer from './components/Explorer';
import FileTabs from './components/FileTabs';
import GameInfoBar from './components/GameInfoBar';
import MenuBar from './components/MenuBar';
import SubmitBtn from './components/SubmitBtn';
import Terminal from './components/Terminal';
import { useFile } from './hooks/useFile';
import { useIde } from './hooks/useIde';
import useTerminal from './hooks/useTerminal';
import type { SubmissionRequest } from './types/apiTypes';
import type { QuestInfo } from './types/ideTypes';
import type { FileNode } from './types/ideTypes';

type SideMenu = 'explorer' | 'chat' | 'hint' | 'alarm';

export default function GamePage() {
  const navigate = useNavigate();
  const { roomId, questId } = useParams<{ roomId: string; questId: string }>();
  const [questInfo, setQuestInfo] = useState<QuestInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<SideMenu>('explorer');
  const [frontId, setFrontId] = useState<number | null>(null);
  const [backId, setBackId] = useState<number | null>(null);

  // 초기 게임 상태 설정
  const { accessToken } = useStore();
  useEffect(() => {
    const { draft } = useRoomStore.getState(); // 방 생성 시점의 초기 데이터
    if (!draft) {
      setError('유효하지 않은 접근입니다. 처음부터 시작해주세요.');
      return;
    }

    if (draft) {
      useGameStore.getState().setGameState(draft.life, draft.hints); // 초기 목숨과 힌트 수 설정
      setFrontId(draft.frontendId);
      setBackId(draft.backendId);
    }
  }, [roomId]);

  // 제출 버튼을 눌렀을 때 실행되는 함수
  const submitCode = async () => {
    const setRoomId = Number(roomId);
    const frontFrameworkId = frontId;
    const backFrameworkId = backId;

    console.log('=== 제출 전 데이터 ===');
    console.log('frontId:', frontFrameworkId);
    console.log('backId:', backFrameworkId);
    console.log('fileCodes:', ide.fileCodes);
    console.log('rootNode:', rootNode);

    const requestBody: SubmissionRequest = {};

    if (frontFrameworkId !== null) {
      requestBody.frontend = {
        problemFrameworkId: frontFrameworkId,
        files: buildFilesRequestData({
          node: rootNode,
          fileCodes: ide.fileCodes,
          role: 'FRONTEND',
        }),
      };
    }
    if (backFrameworkId !== null) {
      requestBody.backend = {
        problemFrameworkId: backFrameworkId,
        files: buildFilesRequestData({
          node: rootNode,
          fileCodes: ide.fileCodes,
          role: 'BACKEND',
        }),
      };
    }
    console.log('최종 requestBody:', JSON.stringify(requestBody, null, 2));
    try {
      const result = await codeSubmission(setRoomId, requestBody, accessToken);
      console.log('제출 성공');
      console.log(result);
      useSubmissionStore.getState().setResult(result.data);
      navigate(`/result/loading`);
      useGameStore
        .getState()
        .setGameState(
          result.data.roomState.remainingLife,
          result.data.roomState.remainingHintCount,
        );
    } catch (e) {
      console.error('제출 실패', e);
      alert('코드 제출에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    const loadQuest = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!roomId || !questId) {
          setError('필수 정보가 없습니다.');
          return;
        }

        const data = await getQuest(questId, roomId, accessToken);
        setQuestInfo(data);
      } catch (e) {
        console.error('문제 정보 로드 실패:', e);
        setError('문제 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadQuest();
  }, [roomId, questId, accessToken]);

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
    <div className="w-full h-screen flex flex-col px-20 pt-[80px] pb-[40px]">
      <div className="flex w-full h-[45px] gap-[48px] mb-[10px] shrink-0">
        <GameInfoBar />
      </div>
      <div className=" flex flex-1 w-full h-full">
        {/* 메뉴바 */}
        <div className="w-[70px] h-full bg-stone-900 py-5 px-2 border border-gray-700">
          <MenuBar activeMenu={activeMenu} onChangeMenu={setActiveMenu} />
        </div>
        {/* 파일탐색기 + 코드 편집기 + 터미널 */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* 파일 탐색기 + 코드 편집기 */}
          <div className="flex border border-gray-700 flex-1 min-h-0">
            <Resizable
              defaultSize={{ width: 300, height: '100%' }}
              minWidth={50}
              maxWidth={400}
              enable={{ right: true }} // 드래그 설정 - 오른쪽만
              className="bg-stone-900 border-r border-gray-700"
            >
              <div className="h-full overflow-hidden p-5">
                {/* 조건 && 컴포넌트 : 조건이 true일 때만 컴포넌트를 렌더링 */}
                {activeMenu === 'explorer' && (
                  <Explorer
                    root={rootNode}
                    expanded={ide.expanded}
                    onToggleFolder={ide.toggleFolder}
                    onOpenFile={ide.openFile}
                  />
                )}
              </div>
            </Resizable>
            <div className="flex flex-col flex-1 min-w-0 min-h-0 ">
              <FileTabs
                openTabs={ide.openTabs}
                activeFileId={ide.activeFileId}
                onSelectTab={ide.selectTab}
                onCloseTab={ide.closeTab}
              />
              <div className="flex-1 min-h-0 bg-[#1E1E1E]">
                <CodeEditor
                  activeFile={ide.activeFile}
                  code={ide.currentCode}
                  onChange={ide.setCurrentCode}
                />
              </div>
            </div>
          </div>
          {/* 터미널 */}
          <Resizable
            defaultSize={{ width: '100%', height: 220 }}
            enable={{ top: true }}
            className="shrink-0 border border-gray-700 overflow-hidden"
            minHeight={50}
          >
            <Terminal
              frontendErrorLog={frontendErrorLog}
              backendErrorLog={backendErrorLog}
            />
          </Resizable>
        </div>
      </div>
      <div className="flex w-full mt-4">
        <SubmitBtn onClick={submitCode} />
      </div>
    </div>
  );
}
