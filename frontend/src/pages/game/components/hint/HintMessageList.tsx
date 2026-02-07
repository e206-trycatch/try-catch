import { useEffect, useRef } from 'react';

import { useHintStore } from '../../../../stores/useHintStore';
import { HINT_INFO_MESSAGES } from './hintInfoMessages';
import HintMessageItem from './HintMessageItem';
import TypingIndicator from './TypingIndicator';

export default function HintMessageList() {
  const { messages, isLoading } = useHintStore();
  const listRef = useRef<HTMLDivElement>(null);

  // 새 메시지 추가 시 하단으로 스크롤
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-lg bg-stone-800/60 border border-stone-700/50 p-5">
          <p className="text-amber-400 font-semibold text-sm mb-3">
            AI 힌트 도우미
          </p>
          <ul className="space-y-2">
            {HINT_INFO_MESSAGES.map((msg) => (
              <li
                key={msg}
                className="flex items-start gap-2 text-xs text-gray-400"
              >
                <span className="text-amber-500 shrink-0 leading-none">•</span>
                <span>{msg}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
    >
      {messages.map((message) => (
        <HintMessageItem key={message.id} message={message} />
      ))}
      {isLoading && <TypingIndicator />}
    </div>
  );
}
