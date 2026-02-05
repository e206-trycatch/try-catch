import { useEffect } from 'react';

import type { HintCreateRequest } from '../../../../api/hintApi';
import { getHintHistory } from '../../../../api/hintApi';
import { useHintStore } from '../../../../stores/useHintStore';
import HintInputForm from './HintInputForm';
import HintMessageList from './HintMessageList';

interface Props {
  roomId: number;
  problemFrameworkId: number;
  framework: string;
  getSubmissionData: () => HintCreateRequest['submission'];
  onClose: () => void;
}

export default function HintModal({
  roomId,
  problemFrameworkId,
  framework,
  getSubmissionData,
  onClose,
}: Props) {
  const { isModalOpen, historyLoaded, setMessages, setHistoryLoaded } =
    useHintStore();

  // 최초 열림 시 이력 로드
  useEffect(() => {
    const loadHistory = async () => {
      if (isModalOpen && !historyLoaded) {
        try {
          const history = await getHintHistory(roomId);
          setMessages(history);
          setHistoryLoaded(true);
        } catch (error) {
          console.error('힌트 이력 로드 실패:', error);
          setHistoryLoaded(true);
        }
      }
    };

    loadHistory();
  }, [isModalOpen, historyLoaded, roomId, setMessages, setHistoryLoaded]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 컨텐츠 */}
      <div className="relative w-[400px] h-[500px] bg-stone-900 border border-gray-700 rounded-lg shadow-xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-lg font-medium text-gray-200">AI 힌트</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 메시지 목록 */}
        <HintMessageList />

        {/* 입력 폼 */}
        <HintInputForm
          roomId={roomId}
          problemFrameworkId={problemFrameworkId}
          framework={framework}
          getSubmissionData={getSubmissionData}
        />
      </div>
    </div>
  );
}
