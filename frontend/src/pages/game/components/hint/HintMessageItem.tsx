import type { HintMessage } from '../../../../stores/useHintStore';
import { useStore } from '../../../../stores/useStore';

interface Props {
  message: HintMessage;
}

export default function HintMessageItem({ message }: Props) {
  const { user } = useStore();
  // nickname으로 본인 메시지 확인
  const isMyMessage =
    message.type === 'QUESTION' && message.nickname === user?.nickname;

  // 시간 포맷팅
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 에러 메시지
  if (message.type === 'ERROR') {
    return (
      <div className="flex justify-center px-4 py-2">
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-2 max-w-[80%]">
          <p className="text-red-400 text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  // AI 응답 - 가드레일 거절
  if (message.type === 'RESPONSE' && message.guardrailPassed === false) {
    return (
      <div className="flex items-start gap-2 px-4 py-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 shrink-0">
          <span className="text-sm">AI</span>
        </div>
        <div className="flex flex-col gap-1 max-w-[70%]">
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-3 py-2">
            <p className="text-red-400 text-sm">
              {message.rejectionReason || '해당 질문에는 답변할 수 없습니다.'}
            </p>
          </div>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // AI 응답 - 정상
  if (message.type === 'RESPONSE') {
    return (
      <div className="flex items-start gap-2 px-4 py-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 shrink-0">
          <span className="text-sm">AI</span>
        </div>
        <div className="flex flex-col gap-1 max-w-[70%]">
          <div className="bg-amber-500/20 rounded-lg px-3 py-2">
            <p className="text-gray-200 text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // 질문 - 내 메시지
  if (isMyMessage) {
    return (
      <div className="flex items-start gap-2 px-4 py-2 flex-row-reverse">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/30 shrink-0 overflow-hidden">
          {message.profileUrl ? (
            <img
              src={message.profileUrl}
              alt={message.nickname}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs">{message.nickname.charAt(0)}</span>
          )}
        </div>
        <div className="flex flex-col gap-1 items-end max-w-[70%]">
          <span className="text-xs text-gray-400">{message.nickname}</span>
          <div className="bg-blue-600/40 rounded-lg px-3 py-2">
            <p className="text-gray-200 text-sm">{message.content}</p>
          </div>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // 질문 - 다른 유저 메시지
  return (
    <div className="flex items-start gap-2 px-4 py-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500/30 shrink-0 overflow-hidden">
        {message.profileUrl ? (
          <img
            src={message.profileUrl}
            alt={message.nickname}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs">{message.nickname.charAt(0)}</span>
        )}
      </div>
      <div className="flex flex-col gap-1 max-w-[70%]">
        <span className="text-xs text-gray-400">{message.nickname}</span>
        <div className="bg-stone-700/80 rounded-lg px-3 py-2">
          <p className="text-gray-200 text-sm">{message.content}</p>
        </div>
        <span className="text-xs text-gray-500">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
