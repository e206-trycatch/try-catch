import { useState } from 'react';

import type { HintCreateRequest } from '../../../../api/hintApi';
import { requestHint } from '../../../../api/hintApi';
import { useGameStore } from '../../../../stores/useGameStore';
import { useHintStore } from '../../../../stores/useHintStore';

const MAX_LENGTH = 50;

interface Props {
  roomId: number;
  problemFrameworkId: number;
  framework: string;
  getSubmissionData: () => HintCreateRequest['submission'];
}

export default function HintInputForm({
  roomId,
  problemFrameworkId,
  framework,
  getSubmissionData,
}: Props) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { isLoading } = useHintStore();
  const { currentHints } = useGameStore();

  const isDisconnected = currentHints === 0;
  const isOverLimit = input.length > MAX_LENGTH;
  const canSubmit =
    input.trim().length > 0 &&
    !isOverLimit &&
    !isLoading &&
    !isSending &&
    !isDisconnected;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const question = input.trim();
    setInput('');
    setIsSending(true);

    try {
      const submission = getSubmissionData();

      await requestHint(roomId, {
        problemFrameworkId,
        framework,
        userQuestion: question,
        submission,
      });
    } catch (error) {
      console.error('힌트 요청 실패:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-700 p-3">
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            value={isDisconnected ? '' : input}
            onChange={(e) => !isDisconnected && setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isDisconnected
                ? '통신이 두절된 것 같다...'
                : '질문을 입력하세요...'
            }
            disabled={isDisconnected || isLoading || isSending}
            className={`w-full bg-stone-800 rounded-lg px-3 py-2 text-sm focus:outline-none ${
              isDisconnected
                ? 'border border-red-900/50 text-gray-500 italic placeholder-gray-500 opacity-70 cursor-not-allowed'
                : 'border border-gray-600 text-gray-200 placeholder-gray-500 focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            maxLength={MAX_LENGTH + 10}
          />
        </div>

        {/* 전송 버튼: 힌트 있을 때만 표시 */}
        {!isDisconnected && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            {isSending ? '...' : '전송'}
          </button>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="flex justify-between mt-1 px-1">
        {isDisconnected ? (
          <span className="text-xs text-red-400">연결 끊김</span>
        ) : (
          <>
            <span className="text-xs text-gray-500">
              남은 힌트: {currentHints}개
            </span>
            <span
              className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}
            >
              {input.length}/{MAX_LENGTH}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
