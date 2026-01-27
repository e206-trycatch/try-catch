import EmptyHeartIcon from '../../../assets/images/icons/empty_heart_icon.png';
import FullHeartIcon from '../../../assets/images/icons/full_heart_icon.png';
import { useGameStore } from '../../../stores/useGameStore';
export default function GameInfoBar() {
  const { currentLife } = useGameStore();
  const loseLife = 3 - currentLife;

  return (
    // 목숨
    <div className="flex gap-[10px] items-center justify-center">
      <div>남은 목숨</div>
      <div className="flex gap-[10px] items-center justify-center">
        {Array.from({ length: currentLife }).map((_, i) => (
          <img
            key={`full-${i}`}
            src={FullHeartIcon}
            alt="남은 목숨"
            className="w-[22px] h-[20px]"
          />
        ))}
        {Array.from({ length: loseLife }).map((_, i) => (
          <img
            key={`empty-${i}`}
            src={EmptyHeartIcon}
            alt="소진된 목숨"
            className="w-[22px] h-[20px]"
          />
        ))}
      </div>
    </div>
  );
}
