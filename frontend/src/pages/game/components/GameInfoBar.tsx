import EmptyHeartIcon from '@/assets/images/icons/empty_heart_icon.png';
import FullHeartIcon from '@/assets/images/icons/full_heart_icon.png';
import TimerIcon from '@/assets/images/icons/timer-icon.png';
import type { GameSessionResponse } from '@/pages/game/types/apiTypes';
import { useGameStore } from '@/stores/useGameStore';

import useTimer from '../hooks/useTimer';

interface GameInfoBarProps {
  gameSession: GameSessionResponse | null;
}

const MAX_LIFE = 3;

export default function GameInfoBar({ gameSession }: GameInfoBarProps) {
  const { currentLife } = useGameStore();
  const { display, isWarning } = useTimer();
  const loseLife = MAX_LIFE - currentLife;

  return (
    <div className="flex gap-[45px] items-center justify-center">
      <div className="flex gap-3 justify-center items-center">
        <img
          src={TimerIcon}
          alt=" 남은 시간"
          width={20}
          height={20}
          className="w-[20px]"
        />
        <span>남은 시간</span>
        <div className={`text-xl ${isWarning ? 'timer-warning' : ''}`}>
          {display}
        </div>
      </div>

      <div className="flex gap-3 justify-center items-center">
        <span>남은 목숨</span>
        <div className="flex gap-2 items-center justify-center">
          {Array.from({ length: currentLife }).map((_, i) => (
            <img
              key={`full-${i}`}
              src={FullHeartIcon}
              alt="남은 목숨"
              width={22}
              height={20}
              className="w-[22px] h-[20px]"
            />
          ))}
          {Array.from({ length: loseLife }).map((_, i) => (
            <img
              key={`empty-${i}`}
              src={EmptyHeartIcon}
              alt="소진된 목숨"
              width={22}
              height={20}
              className="w-[22px] h-[20px]"
            />
          ))}
        </div>
      </div>

      {gameSession && (
        <div className="flex gap-3 justify-center items-center">
          <span>참여자</span>
          <div className="flex gap-2 items-center justify-center">
            <span>{gameSession.host.nickname}</span>
            <span>|</span>
            <span>{gameSession.guest.nickname}</span>
          </div>
        </div>
      )}
    </div>
  );
}
