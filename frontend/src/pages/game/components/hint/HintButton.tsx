import AiHintIcon from '../../../../assets/images/icons/ai_hint_icon.svg';
import { useHintStore } from '../../../../stores/useHintStore';

interface Props {
  onClick: () => void;
}

export default function HintButton({ onClick }: Props) {
  const { hasNewHint } = useHintStore();

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

      {/* 아이콘 버튼 */}
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer transition-opacity opacity-100 hover:opacity-75"
      >
        <img
          src={AiHintIcon}
          alt="AI 힌트"
          width={32}
          height={32}
          className="w-[32px]"
        />
      </button>
    </div>
  );
}
