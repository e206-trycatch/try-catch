import AiHintIcon from '../../../../assets/images/icons/ai_hint_icon.svg';
import { useGameStore } from '../../../../stores/useGameStore';
import { useHintStore } from '../../../../stores/useHintStore';

interface Props {
  onClick: () => void;
}

export default function HintButton({ onClick }: Props) {
  const { currentHints } = useGameStore();
  const { hasNewHint } = useHintStore();
  const isDisabled = currentHints === 0;

  return (
    <div className="relative">
      {/* 힌트 도착 알림 말풍선 */}
      {hasNewHint && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap animate-bounce">
          <div className="bg-amber-500 text-black text-xs font-medium px-2 py-1 rounded-lg shadow-lg">
            힌트 도착!
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-amber-500" />
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={`relative cursor-pointer transition-opacity ${
          isDisabled
            ? 'opacity-30 cursor-not-allowed'
            : 'opacity-100 hover:opacity-75'
        }`}
      >
        <img src={AiHintIcon} alt="AI 힌트" className="w-[30px]" />

        {/* 힌트 0개일 때 빨간 X 오버레이 */}
        {isDisabled && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
}
