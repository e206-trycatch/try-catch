import { Resizable } from 're-resizable';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { getGameSession } from '@/api/gameSession';
import { getSingleTimer } from '@/api/getSingleTimer';
import { getMultiQuest } from '@/api/multiQuestFile';
import { getQuestFile } from '@/api/questFile';
import { getQuestStoriesInfo } from '@/api/questStories';
import { getRetryQuestFile } from '@/api/retryQuestFile';
import { saveCodeForShare } from '@/api/saveCodeForShare';
import { getShareCode } from '@/api/shareCode';
import { startMultiGameTimer } from '@/api/startMultiGameTimer';
import { startSingleGameTimer } from '@/api/startSingleGameTimer';
import {
  connectStomp,
  sendSocketMessage,
  subscribeLobby,
  subscribeRoom,
} from '@/sockets/stomp';
import type { CodeSavedMessage } from '@/sockets/types';
import type {
  HintErrorData,
  HintMessageData,
  HintQuestionData,
} from '@/sockets/types';
import { useGameStore } from '@/stores/useGameStore';
import { useHintStore } from '@/stores/useHintStore';
import { useRoomStore } from '@/stores/useRoomStore';
import { useStore } from '@/stores/useStore';
import { useSubmissionStore } from '@/stores/useSubmissionStore';

import CodeEditor from './components/CodeEditor';
import Explorer from './components/Explorer';
import FileTabs from './components/FileTabs';
import GameInfoBar from './components/GameInfoBar';
import HintModal from './components/hint/HintModal';
import MenuBar from './components/MenuBar';
import SubmitBtn from './components/SubmitBtn';
import Terminal from './components/Terminal';
import TimeOverModal from './components/TimeOverModal';
import ShareCodeToast from './components/toast/ShareCodeToast';
import SubmitConfirmToast from './components/toast/SubmitConfirmToast';
import { gameToastStyle } from './components/toast/toastStyles';
import { useFile } from './hooks/useFile';
import { useIde } from './hooks/useIde';
import useTerminal from './hooks/useTerminal';
import useTimer from './hooks/useTimer';
import type { GameSessionResponse, SubmissionRequest } from './types/apiTypes';
import type { CodeRole, QuestInfo } from './types/ideTypes';
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
  const [questInfo, setQuestInfo] = useState<QuestInfo | null>(null);
  const [problemFrameworkId, setProblemFrameworkId] = useState<number | null>(
    null,
  );

  const [gameSession, setGameSession] = useState<GameSessionResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFileMenu, setOpenFileMenu] = useState(true);
  const [backgroundImg, setBackgroundImg] = useState<string | null>(null);
  const {
    submissionId,
    startTimer,
    stopTimer,
    expireTimer,
    initializeForRoom,
  } = useGameStore();
  const { setResult } = useSubmissionStore();
  const mode = useGameStore((state) => state.mode);
  const currentNickname = useStore((state) => state.user?.nickname);
  const [userRole, setUserRole] = useState<CodeRole>(null);

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
  loadShareCodeRef.current = loadShareCode;

  // 초기 게임 상태 설정
  useEffect(() => {
    if (!roomId || !questId) return;
    const mode = useGameStore.getState().mode;

    const initSetting = async () => {
      try {
        setLoading(true);
        setError(null);

        let data = null;

        if (submissionId === null) {
          // 첫 진입 (재도전 아님)
          data =
            mode === 'MULTI'
              ? await getMultiQuest(questId, roomId)
              : await getQuestFile(questId, roomId);
        } else if (submissionId) {
          // 재도전: 이전 제출 코드 + 에러 로그 복원
          data = await getRetryQuestFile(submissionId, roomId);
        } else {
          throw new Error('submissionId가 올바르지 않습니다.');
        }

        console.log(data.myPosition);
        setUserRole(data.myPosition ?? null);
        setProblemFrameworkId(data.problemFrameworkId);
        setQuestInfo(data);
      } catch (e) {
        console.error('문제 정보 로드 실패:', e);
        setError('문제 정보를 불러오지 못했습니다.');
        return;
      } finally {
        setLoading(false);
      }

      if (mode === 'MULTI') {
        try {
          const session = await getGameSession(Number(roomId));
          setGameSession(session);
        } catch (e) {
          console.error('멀티 세션 로드 실패:', e);
        }
      }
      // 타이머 복원
      try {
        const timeData = await getSingleTimer(Number(roomId));

        if (timeData.startedAt) {
          // 기존 타이머가 있으면 복원 (새로고침 대응)
          startTimer(timeData.deadlineAt);
        } else if (mode === 'SINGLE') {
          await new Promise((r) => setTimeout(r, TIMER_DELAY));
          const newTimeData = await startSingleGameTimer(Number(roomId));
          startTimer(newTimeData.deadlineAt);
        }
      } catch (e) {
        console.error('타이머 조회 실패:', e);
      }
    };

    initSetting();
  }, [questId, roomId, submissionId, startTimer, mode]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

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

  // 배경 이미지
  useEffect(() => {
    if (!questId) return;

    const getQuestStories = async () => {
      try {
        const data = await getQuestStoriesInfo(questId);
        const lastImage = data.at(-1)?.imageUrl;
        setBackgroundImg(lastImage ?? '');
      } catch (error) {
        console.error('퀘스트 스토리 배경 이미지 로드 실패:', error);
        setBackgroundImg('');
      }
    };

    getQuestStories();
  }, [questId]);

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

  useEffect(() => {
    if (!roomId) return;

    const unsub = subscribeLobby(Number(roomId), (msg) => {
      if (msg.type === 'SUBMISSION_STARTED') {
        navigate(`/result/loading/${roomId}`);
      }
    });

    return () => unsub?.(); // 구독 정리
  }, [roomId, navigate]);

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
      type: 'folder' as const, // 값을 리터럴 타입으로 고정해서 타입이 넓어지는 걸 막는 문법
      path: '/',
      role: null,
      children: files,
    }),
    [files], // files 값이 바뀔 때마다 실행하기
  );

  const ide = useIde(rootNode);

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
        style={{ backgroundImage: `url(${backgroundImg})` }}
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
                <div
                  className={`flex flex-col flex-1 min-w-0 min-h-0 ${
                    // 스플릿 모드에서 이 패널이 포커스되면 상단 테두리 표시
                    ide.isSplit && ide.focusedPanel === 'primary'
                      ? 'border-t-2 border-amber-300'
                      : ''
                  }`}
                  // 패널 영역 클릭 시 이 패널을 포커스 상태로 변경
                  onMouseDown={() => ide.setFocusedPanel('primary')}
                >
                  {/* 탭 영역: 열린 파일들을 탭으로 표시 */}
                  <FileTabs
                    openTabs={ide.openTabs}
                    activeFileId={ide.activeFileId}
                    // 탭 클릭/닫기 시 'primary' 파라미터로 어떤 패널인지 구분
                    onSelectTab={(fileId) => ide.selectTab(fileId, 'primary')}
                    onCloseTab={(fileId) => ide.closeTab(fileId, 'primary')}
                  />
                  {/* 에디터 영역 */}
                  <div
                    className={`flex-1 min-h-0 ${
                      // 파일이 열려있으면 투명 배경, 없으면 반투명 배경
                      ide.activeFile ? 'bg-[#1E1E1E00]' : 'bg-[#1E1E1EE6]'
                    }`}
                  >
                    <CodeEditor
                      activeFile={ide.activeFile}
                      code={ide.currentCode}
                      onChange={ide.setCurrentCode}
                      userRole={userRole}
                    />
                  </div>
                </div>

                {ide.isSplit && (
                  <>
                    {/* 패널 구분선 */}
                    <div className="w-[1px] bg-gray-700" />
                    <div
                      className={`flex flex-col flex-1 min-w-0 min-h-0 ${
                        ide.focusedPanel === 'secondary'
                          ? 'border-t-2 border-amber-300'
                          : ''
                      }`}
                      onMouseDown={() => ide.setFocusedPanel('secondary')}
                    >
                      <FileTabs
                        openTabs={ide.secondaryOpenTabs}
                        activeFileId={ide.secondaryActiveFileId}
                        onSelectTab={(fileId) =>
                          ide.selectTab(fileId, 'secondary')
                        }
                        onCloseTab={(fileId) =>
                          ide.closeTab(fileId, 'secondary')
                        }
                      />
                      <div
                        className={`flex-1 min-h-0 ${
                          ide.secondaryActiveFile
                            ? 'bg-[#1E1E1E00]'
                            : 'bg-[#1E1E1EE6]'
                        }`}
                      >
                        <CodeEditor
                          activeFile={ide.secondaryActiveFile}
                          code={ide.secondaryCurrentCode}
                          onChange={ide.setSecondaryCurrentCode}
                          userRole={userRole}
                        />
                      </div>
                    </div>
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
