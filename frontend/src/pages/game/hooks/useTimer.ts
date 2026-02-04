import { useGameStore } from '@/stores/useGameStore';

export default function useTimer() {
  const remainingSeconds = useGameStore((s) => s.remainingSeconds);
  const deadlineAt = useGameStore((s) => s.deadlineAt);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    display,
    isExpired: deadlineAt !== null && remainingSeconds <= 0,
    isWarning:
      deadlineAt !== null && remainingSeconds > 0 && remainingSeconds <= 60,
  };
}
