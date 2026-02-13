import { Resizable } from 're-resizable';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { getSingleTimer } from '@/api/getSingleTimer';
import { saveCodeForShare } from '@/api/saveCodeForShare';
import { getShareCode } from '@/api/shareCode';
import { startMultiGameTimer } from '@/api/startMultiGameTimer';
import {
  connectStomp,
  sendSocketMessage,
  subscribeLobby,
  subscribeRoom,
} from '@/sockets/stomp';
import type {
  CodeSavedMessage,
  HintErrorData,
  HintMessageData,
  HintQuestionData,
} from '@/sockets/types';
import { useGameStore } from '@/stores/useGameStore';
import { useHintStore } from '@/stores/useHintStore';
import { useStore } from '@/stores/useStore';
import { useSubmissionStore } from '@/stores/useSubmissionStore';

import EditorPanel from './components/EditorPanel';
import Explorer from './components/Explorer';
import GameInfoBar from './components/GameInfoBar';
import HintModal from './components/hint/HintModal';
import MenuBar from './components/MenuBar';
import SubmitBtn from './components/SubmitBtn';
import Terminal from './components/Terminal';
import TimeOverModal from './components/TimeOverModal';
import ShareCodeToast from './components/toast/ShareCodeToast';
import SubmitConfirmToast from './components/toast/SubmitConfirmToast';
import { gameToastStyle } from './components/toast/toastStyles';
import { useBackgroundImage } from './hooks/useBackgroundImage';
import { useFile } from './hooks/useFile';
import { useGameInit } from './hooks/useGameInit';
import { useIde } from './hooks/useIde';
import useTerminal from './hooks/useTerminal';
import useTimer from './hooks/useTimer';
import type { SubmissionRequest } from './types/apiTypes';
import type { FileNode } from './types/ideTypes';
import { findFileIdByPath } from './utils/fileTreeUtils';
import { resolveFramework } from './utils/frameworkUtils';
import {
  buildSubmissionPayload,
  snapshotFileCodes,
} from './utils/submissionUtils';

const TIMER_DELAY = 2000;
const SUBMIT_TOAST_CLOSE = 3000;

export default function GamePage() {
  const navigate = useNavigate();
  const { roomId, questId } = useParams<{ roomId: string; questId: string }>();
  const [openFileMenu, setOpenFileMenu] = useState(true);
  const { startTimer, expireTimer } = useGameStore();
  const { setResult } = useSubmissionStore();
  const currentNickname = useStore((state) => state.user?.nickname);

  const backgroundImage = useBackgroundImage(questId);
  const {
    questInfo,
    problemFrameworkId,
    gameSession,
    userRole,
    loading,
    error,
    mode,
  } = useGameInit(roomId, questId);

  const { isExpired } = useTimer();
  const { files } = useFile(questInfo);
  const { frontendErrorLog, backendErrorLog } = useTerminal(questInfo);

  // 힌트 모달 상태
  const { isModalOpen, openModal, closeModal } = useHintStore();

  const currentFramework = useMemo(
    () => resolveFramework(questInfo),
    [questInfo],
  );

  const rootNode = useMemo<FileNode>(
    () => ({
      id: 'root',
      name: 'root',
      type: 'folder' as const,
      path: '/',
      role: null,
      children: files,
    }),
    [files],
  );

  const ide = useIde(rootNode);

  // 멀티 모드 - 코드 덮어씌우기를 위한 함수
  const loadShareCode = async () => {
    if (!roomId || problemFrameworkId === null) return;

    try {
      const { files } = await getShareCode(Number(roomId), problemFrameworkId);

      const updates: Record<string, string> = {};
      for (const file of files) {
        const fileId = findFileIdByPath(rootNode, file.filePath);
        if (fileId) {
          updates[fileId] = file.code;
        }
      }

      ide.overwriteFileCodes(updates);
      toast.success('팀원의 코드를 불러왔습니다.');
    } catch {
      toast.error('코드 불러오기에 실패했습니다.');
    }
  };

  const loadShareCodeRef = useRef<() => Promise<void>>(undefined);
  useEffect(() => {
    loadShareCodeRef.current = loadShareCode;
  });

  // 새로고침 방지 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // STOMP 구독 해제 함수 저장용 ref
  const unsubscribeRoomRef = useRef<(() => void) | undefined>(undefined);
  const unsubscribeLobbyRef = useRef<(() => void) | undefined>(undefined);

  // STOMP 연결 및 게임 이벤트 구독 (멀티모드: 구독 후 ready 전송)
  useEffect(() => {
    if (!roomId) return;

    const { addQuestion, addHintResponse, addError, reset } =
      useHintStore.getState();
    const { setGameState, currentLife } = useGameStore.getState();

    // 방 변경 시 힌트 상태 초기화
    reset();

    const init = async () => {
      const token = useStore.getState().accessToken;
      if (token) await connectStomp(token);

      // 게임 토픽 구독 및 해제 함수 저장
      unsubscribeRoomRef.current = subscribeRoom(Number(roomId), (msg) => {
        // 타이머 이벤트
        if (msg.type === 'TIMER_STARTED') {
          startTimer(msg.data.deadlineAt);
        }
        if (msg.type === 'TIME_OUT') {
          expireTimer();
        }

        // 힌트 이벤트
        if (msg.type === 'HINT_QUESTION') {
          const data = msg.data as HintQuestionData;
          addQuestion(data);
          setGameState(currentLife, data.remainingHintCount);
        }
        if (msg.type === 'HINT_MESSAGE') {
          const data = msg.data as HintMessageData;
          addHintResponse(data);
          setGameState(
            useGameStore.getState().currentLife,
            data.remainingHintCount,
          );
        }
        if (msg.type === 'HINT_ERROR') {
          const data = msg.data as HintErrorData;
          addError(data);
        }

        if (msg.type === 'SUBMISSION_STARTED') {
          navigate(`/result/loading/${roomId}`);
        }
      });

      // 멀티모드 처리 (STOMP 구독 완료 후 ready 신호 전송)
      if (mode === 'MULTI') {
        // 타이머가 이미 시작된 경우(새로고침) ready 신호 재전송 방지
        const timeData = await getSingleTimer(Number(roomId));
        if (!timeData.startedAt) {
          await new Promise((r) => setTimeout(r, TIMER_DELAY));
          await startMultiGameTimer(Number(roomId));
        }

        // CODE_SAVED 구독 및 해제 함수 저장
        const myNickname = useStore.getState().user?.nickname;
        unsubscribeLobbyRef.current = subscribeLobby(Number(roomId), (msg) => {
          if (msg.type === 'CODE_SAVED') {
            const { nickname } = msg.data as CodeSavedMessage['data'];
            if (nickname !== myNickname) {
              const toastId = `share-code-${Date.now()}`;
              toast.info(
                <ShareCodeToast
                  nickname={nickname}
                  toastId={toastId}
                  onLoad={() => loadShareCodeRef.current?.()}
                />,
                {
                  toastId,
                  position: 'top-left',
                  autoClose: false,
                  hideProgressBar: true,
                  closeButton: false,
                  icon: false,
                  style: {
                    ...gameToastStyle,
                    marginTop: '100px',
                    marginLeft: '60px',
                  },
                },
              );
            }
          }
        });
      }
    };

    init();

    return () => {
      // 저장된 unsub 함수로 구독 해제
      unsubscribeRoomRef.current?.();
      unsubscribeLobbyRef.current?.();
    };
  }, [roomId, mode, startTimer, expireTimer, navigate]);

  // 코드 저장 버튼을 눌렀을 때 실행되는 함수
  const saveCode = async () => {
    if (!roomId) return;

    const allFileCodes = snapshotFileCodes(
      ide.fileCodes,
      ide.activeFileId,
      ide.currentCode,
    );

    const { frontend, backend } = buildSubmissionPayload(
      rootNode,
      allFileCodes,
    );

    const files = [...frontend.files, ...backend.files];

    try {
      await saveCodeForShare(Number(roomId), {
        problemFrameworkId,
        files,
      });
      toast.success('팀원에게 코드를 공유했습니다.');
    } catch {
      toast.error('코드 공유에 실패했습니다.');
    }
  };

  // 실제 제출 로직
  const submitCode = () => {
    const allFileCodes = snapshotFileCodes(
      ide.fileCodes,
      ide.activeFileId,
      ide.currentCode,
      ide.openTabs,
    );

    const { frontend, backend } = buildSubmissionPayload(
      rootNode,
      allFileCodes,
    );

    const requestBody: SubmissionRequest = {
      problemFrameworkId,
      frontend,
      backend,
    };

    setResult(requestBody);

    sendSocketMessage(`/app/room/${roomId}/submit/start`, {});
  };

  // 제출 버튼을 눌렀을 때 실행되는 함수
  const submitCodeHandler = () => {
    const toastId = `submit-confirm-${Date.now()}`;
    toast.info(
      <SubmitConfirmToast toastId={toastId} onConfirm={submitCode} />,
      {
        toastId,
        position: 'top-right',
        autoClose: SUBMIT_TOAST_CLOSE,
        hideProgressBar: true,
        closeButton: false,
        icon: false,
        style: {
          ...gameToastStyle,
          marginTop: '120px',
          marginRight: '60px',
        },
      },
    );
  };

  // 힌트 요청 시 현재 코드 스냅샷 생성
  const getSubmissionData = useCallback(() => {
    const allFileCodes = snapshotFileCodes(
      ide.fileCodes,
      ide.activeFileId,
      ide.currentCode,
      ide.openTabs,
    );

    return buildSubmissionPayload(rootNode, allFileCodes);
  }, [
    ide.fileCodes,
    ide.activeFileId,
    ide.currentCode,
    ide.openTabs,
    rootNode,
  ]);

  if (loading) {
    return <div>불러오는 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      {isExpired && <TimeOverModal />}
      {isModalOpen && problemFrameworkId && questInfo && (
        <HintModal
          roomId={Number(roomId)}
          problemFrameworkId={problemFrameworkId}
          framework={currentFramework}
          getSubmissionData={getSubmissionData}
          onClose={closeModal}
        />
      )}
      <div
        className="w-full h-screen flex flex-col px-20 pt-[80px] pb-[40px] bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="flex w-full h-[45px] gap-[48px] mb-[5px] shrink-0">
          <GameInfoBar gameSession={gameSession} />
          {/* 멀티모드에서는 호스트만 제출 가능 */}
          {(mode === 'SINGLE' ||
            gameSession?.host.nickname === currentNickname) && (
            <SubmitBtn onClick={submitCodeHandler} />
          )}
        </div>
        <div className=" flex flex-1 w-full h-full min-h-0 overflow-hidden">
          {/* 메뉴바 */}
          <div className="w-[65px] h-full bg-stone-900/90 py-5 px-2 border border-gray-700">
            <MenuBar
              fileMenu={openFileMenu}
              onToggleFileMenu={() => setOpenFileMenu((prev) => !prev)}
              onSave={saveCode}
              onOpenHintModal={openModal}
              mode={mode}
              isSplit={ide.isSplit}
              onToggleSplit={ide.toggleSplit}
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
                  className="bg-stone-900/90 border-r border-gray-700"
                  handleComponent={{
                    right: (
                      <div className="w-[4px] h-full hover:bg-amber-300/70 transition-colors cursor-col-resize"></div>
                    ),
                  }}
                >
                  <div className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500">
                    <div className="py-5 px-4 pb-10 min-w-full">
                      <Explorer
                        root={rootNode}
                        expanded={ide.expanded}
                        onToggleFolder={ide.toggleFolder}
                        onOpenFile={ide.openFile}
                        activeFileId={
                          ide.isSplit && ide.focusedPanel === 'secondary'
                            ? ide.secondaryActiveFileId
                            : ide.activeFileId
                        }
                      />
                    </div>
                  </div>
                </Resizable>
              )}
              <div className="flex flex-1 min-w-0 min-h-0">
                <EditorPanel
                  openTabs={ide.openTabs}
                  activeFileId={ide.activeFileId}
                  activeFile={ide.activeFile}
                  code={ide.currentCode}
                  isFocused={ide.isSplit && ide.focusedPanel === 'primary'}
                  userRole={userRole}
                  onSelectTab={(fileId) => ide.selectTab(fileId, 'primary')}
                  onCloseTab={(fileId) => ide.closeTab(fileId, 'primary')}
                  onChange={ide.setCurrentCode}
                  onFocus={() => ide.setFocusedPanel('primary')}
                />

                {ide.isSplit && (
                  <>
                    <div className="w-[1px] bg-gray-700" />
                    <EditorPanel
                      openTabs={ide.secondaryOpenTabs}
                      activeFileId={ide.secondaryActiveFileId}
                      activeFile={ide.secondaryActiveFile}
                      code={ide.secondaryCurrentCode}
                      isFocused={ide.focusedPanel === 'secondary'}
                      userRole={userRole}
                      onSelectTab={(fileId) =>
                        ide.selectTab(fileId, 'secondary')
                      }
                      onCloseTab={(fileId) => ide.closeTab(fileId, 'secondary')}
                      onChange={ide.setSecondaryCurrentCode}
                      onFocus={() => ide.setFocusedPanel('secondary')}
                    />
                  </>
                )}
              </div>
            </div>
            {/* 터미널 */}
            <Resizable
              defaultSize={{ width: '100%', height: 200 }}
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
