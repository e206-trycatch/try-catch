import { useCallback, useEffect, useRef } from 'react';

import type { GameStatus } from '../types/gameTypes';

interface UseKeyboardProps {
  status: GameStatus;
  onJump: () => void;
  onDuck: (isDucking: boolean) => void;
  onStart: () => void;
  onRestart: () => void;
  disabled?: boolean;
}

export const useKeyboard = ({
  status,
  onJump,
  onDuck,
  onStart,
  onRestart,
  disabled = false,
}: UseKeyboardProps) => {
  const keysPressed = useRef<Set<string>>(new Set());

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // disabled 상태면 키 입력 무시
      if (disabled) return;

      if (keysPressed.current.has(e.code)) return;
      keysPressed.current.add(e.code);

      // 점프: Space 또는 ArrowUp
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();

        if (status === 'idle') {
          onStart();
        } else if (status === 'playing') {
          onJump();
        } else if (status === 'gameover') {
          onRestart();
        }
      }

      // 숙이기: ArrowDown
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (status === 'playing') {
          onDuck(true);
        }
      }
    },
    [status, onJump, onDuck, onStart, onRestart, disabled],
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);

      if (e.code === 'ArrowDown') {
        onDuck(false);
      }
    },
    [onDuck],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
};
