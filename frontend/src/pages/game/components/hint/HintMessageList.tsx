import { useEffect, useRef } from 'react';

import { useHintStore } from '../../../../stores/useHintStore';
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
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">AI 힌트</p>
          <p className="text-sm">질문을 입력하면 AI가 힌트를 제공합니다.</p>
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
