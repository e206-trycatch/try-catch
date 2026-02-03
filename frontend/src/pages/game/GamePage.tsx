import { Resizable } from 're-resizable';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getSingleTimer } from '../../api/getSingleTimer';
import { getQuest } from '../../api/questFile';
import { getRetryQuestFile } from '../../api/retryQuestFile';
import { startSingleGameTimer } from '../../api/startSingleGameTimer';
import { connectStomp, subscribeRoom } from '../../sockets/stomp';
import { useGameStore } from '../../stores/useGameStore';
import { useRoomStore } from '../../stores/useRoomStore';
import { useSocketStore } from '../../stores/useSocketStore';
import { useStore } from '../../stores/useStore';
import { useSubmissionStore } from '../../stores/useSubmissionStore';
import CodeEditor from './components/CodeEditor';
import Explorer from './components/Explorer';
import FileTabs from './components/FileTabs';
import GameInfoBar from './components/GameInfoBar';
import MenuBar from './components/MenuBar';
import SubmitBtn from './components/SubmitBtn';
import Terminal from './components/Terminal';
import TimeOverModal from './components/TimeOverModal';
import { useFile } from './hooks/useFile';
import { useIde } from './hooks/useIde';
import useTerminal from './hooks/useTerminal';
import useTimer from './hooks/useTimer';
import type { SubmissionRequest } from './types/apiTypes';
import type { QuestInfo } from './types/ideTypes';
import type { FileNode } from './types/ideTypes';
import { buildFilesRequestData } from './utils/codeSubmissionMapper';

export default function GamePage() {
  const navigate = useNavigate();
  const { roomId, questId } = useParams<{ roomId: string; questId: string }>();
  const [questInfo, setQuestInfo] = useState<QuestInfo | null>(null);
  const [problemFrameworkId, setProblemFrameworkId] = useState<number | null>(
    null,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFileMenu, setOpenFileMenu] = useState(true);
  const {
    submissionId,
    startTimer,
    stopTimer,
    forceExpire,
    initializeForRoom,
  } = useGameStore();
  const { removeSubscription } = useSocketStore();
  const { setResult } = useSubmissionStore();

  // 초기 게임 상태 설정
  useEffect(() => {
    if (!roomId) return;

    const initSetting = async () => {
      try {
        setLoading(true);
        setError(null);
        let data = null;

        if (submissionId === null) {
          data = await getQuest(questId, roomId);
        } else if (submissionId) {
          data = await getRetryQuestFile(submissionId, roomId);
        } else {
          throw new Error('submissionId가 올바르지 않습니다.');
        }

        setProblemFrameworkId(data.problemFrameworkId);
        setQuestInfo(data);
      } catch (e) {
        console.error('문제 정보 로드 실패:', e);
        setError('문제 정보를 불러오지 못했습니다.');
        return;
      } finally {
        setLoading(false);
      }

      try {
        const timeData = await getSingleTimer(Number(roomId));

        if (timeData.deadlineAt) {
          startTimer(timeData.deadlineAt);
        } else {
          const newTimeData = await startSingleGameTimer(Number(roomId));
          startTimer(newTimeData.deadlineAt);
        }
      } catch (e) {
        console.error('타이머 시작 실패:', e);
      }
    };

    initSetting();
  }, [questId, roomId, submissionId, startTimer]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  // STOMP 연결 및 TIME_OUT 구독
  useEffect(() => {
    if (!roomId) return;

    const init = async () => {
      const token = useStore.getState().accessToken;
      if (token) await connectStomp(token);

      subscribeRoom(Number(roomId), (msg) => {
        if (msg.type === 'TIME_OUT') {
          forceExpire();
        }
      });
    };

    init();

    return () => {
      removeSubscription(`room-${roomId}`);
    };
  }, [roomId, forceExpire, removeSubscription]);

  // 초기 게임 상태 설정 - 목숨/힌트 수
  useEffect(() => {
    const { draft } = useRoomStore.getState();
    const { currentRoomId } = useGameStore.getState();

    if (!draft) {
      setError('유효하지 않은 접근입니다. 처음부터 시작해주세요.');
      return;
    }

    // 새 방 진입 시에만 draft에서 초기화 (실패 후 재도전 시에는 현재 값 유지)
    if (currentRoomId !== Number(roomId)) {
      initializeForRoom(Number(roomId), draft.life, draft.hints);
    }
  }, [roomId, initializeForRoom]);

  // 제출 버튼을 눌렀을 때 실행되는 함수
  const submitCode = async () => {
    // 현재 활성 파일과 openTabs의 코드를 모두 모으기
    const allFileCodes: Record<string, string> = { ...ide.fileCodes };

    if (ide.activeFileId) {
      allFileCodes[ide.activeFileId] = ide.currentCode;
    }

    ide.openTabs.forEach((f) => {
      allFileCodes[f.id] = allFileCodes[f.id] ?? f.code ?? '';
    });

    const requestBody: SubmissionRequest = {
      problemFrameworkId: problemFrameworkId,
      frontend: {
        files: buildFilesRequestData({
          node: rootNode,
          fileCodes: allFileCodes,
          role: 'FRONTEND',
        }),
      },
      backend: {
        files: buildFilesRequestData({
          node: rootNode,
          fileCodes: allFileCodes,
          role: 'BACKEND',
        }),
      },
    };

    console.log('requestBody', requestBody);

    setResult(requestBody);
    navigate(`/result/loading/${roomId}`);
  };

  const { isExpired } = useTimer();
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
    <>
      {isExpired && <TimeOverModal />}
      <div className="w-full h-screen flex flex-col px-20 pt-[80px] pb-[40px]">
        <div className="flex w-full h-[45px] gap-[48px] mb-[5px] shrink-0">
          <GameInfoBar />
          <SubmitBtn onClick={submitCode} />
        </div>
        <div className=" flex flex-1 w-full h-full min-h-0 overflow-hidden">
          {/* 메뉴바 */}
          <div className="w-[70px] h-full bg-stone-900 py-5 px-2 border border-gray-700">
            <MenuBar
              fileMenu={openFileMenu}
              onToggleFileMenu={() => setOpenFileMenu((prev) => !prev)}
            />
          </div>
          {/* 파일탐색기 + 코드 편집기 + 터미널 */}
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* 파일 탐색기 + 코드 편집기 */}
            <div className="flex border border-gray-700 flex-1 min-h-0">
              {openFileMenu && (
                <Resizable
                  defaultSize={{ width: 250, height: '100%' }}
                  minWidth={50}
                  maxWidth={400}
                  enable={{ right: true }}
                  className="bg-stone-900 border-r border-gray-700"
                  handleComponent={{
                    right: (
                      <div className="w-[4px] h-full hover:bg-amber-300/70 transition-colors cursor-col-resize"></div>
                    ),
                  }}
                >
                  <div className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500">
                    <div className="p-3 pb-10 min-w-full">
                      <Explorer
                        root={rootNode}
                        expanded={ide.expanded}
                        onToggleFolder={ide.toggleFolder}
                        onOpenFile={ide.openFile}
                      />
                    </div>
                  </div>
                </Resizable>
              )}
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
              defaultSize={{ width: '100%', height: 230 }}
              enable={{ top: true }}
              className="shrink-0 border border-gray-700"
              minHeight={50}
              maxHeight={500}
              handleComponent={{
                top: (
                  <div className="w-full h-[4px] hover:bg-amber-300/70 cursor-row-resize transition-colors" />
                ),
              }}
            >
              <Terminal
                frontendErrorLog={frontendErrorLog}
                backendErrorLog={backendErrorLog}
              />
            </Resizable>
          </div>
        </div>
      </div>
    </>
  );
}
