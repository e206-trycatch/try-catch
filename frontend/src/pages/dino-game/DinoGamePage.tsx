import { useCallback, useEffect, useState } from 'react';

import GameCanvas from './components/GameCanvas';
import { GAME_CONFIG } from './constants/gameConfig';
import { useGameLoop } from './hooks/useGameLoop';
import { useKeyboard } from './hooks/useKeyboard';
import type { GameState } from './types/gameTypes';

const getInitialState = (highScore: number = 0): GameState => ({
  status: 'idle',
  score: 0,
  highScore,
  speed: GAME_CONFIG.INITIAL_SPEED,
  dino: {
    y: GAME_CONFIG.GROUND_Y - GAME_CONFIG.DINO_HEIGHT,
    velocityY: 0,
    isJumping: false,
    isDucking: false,
  },
  obstacles: [],
  groundOffset: 0,
});

const DinoGamePage = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialState());

  const { startLoop, stopLoop } = useGameLoop({ setGameState });

  const handleJump = useCallback(() => {
    setGameState((prev) => {
      if (prev.dino.isJumping || prev.dino.isDucking) return prev;

      return {
        ...prev,
        dino: {
          ...prev.dino,
          isJumping: true,
          velocityY: GAME_CONFIG.JUMP_VELOCITY,
        },
      };
    });
  }, []);

  const handleDuck = useCallback((isDucking: boolean) => {
    setGameState((prev) => {
      if (prev.dino.isJumping) return prev;

      const newY = isDucking
        ? GAME_CONFIG.GROUND_Y - GAME_CONFIG.DINO_DUCK_HEIGHT
        : GAME_CONFIG.GROUND_Y - GAME_CONFIG.DINO_HEIGHT;

      return {
        ...prev,
        dino: {
          ...prev.dino,
          isDucking,
          y: newY,
        },
      };
    });
  }, []);

  const handleStart = useCallback(() => {
    setGameState((prev) => ({
      ...getInitialState(prev.highScore),
      status: 'playing',
    }));
    startLoop();
  }, [startLoop]);

  const handleRestart = useCallback(() => {
    setGameState((prev) => ({
      ...getInitialState(prev.highScore),
      status: 'playing',
    }));
    startLoop();
  }, [startLoop]);

  useKeyboard({
    status: gameState.status,
    onJump: handleJump,
    onDuck: handleDuck,
    onStart: handleStart,
    onRestart: handleRestart,
  });

  // 게임 오버시 루프 정지
  useEffect(() => {
    if (gameState.status === 'gameover') {
      stopLoop();
    }
  }, [gameState.status, stopLoop]);

  // 컴포넌트 언마운트시 루프 정지
  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6">
      <p className="text-4xl text-gray-400">프로젝트 힘들다..</p>
      <p className="text-4xl text-gray-400">아.. 디버깅 하기 싫다..</p>
      <h1 className="text-3xl font-bold text-white">Dino Game</h1>

      {/* 점수판 */}
      <div className="flex gap-8 mb-2 font-mono text-lg text-gray-400">
        <div>HI {String(gameState.highScore).padStart(5, '0')}</div>
        <div>{String(Math.floor(gameState.score)).padStart(5, '0')}</div>
      </div>

      {/* 게임 캔버스 */}
      <div className="relative">
        <GameCanvas gameState={gameState} />

        {/* 시작 안내 */}
        {gameState.status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
            <div className="text-center text-gray-700 bg-white/90 px-6 py-4 rounded-lg">
              <p className="text-xl font-bold mb-2">Press SPACE to Start</p>
              <p className="text-sm text-gray-500">
                SPACE / ↑ : Jump | ↓ : Duck
              </p>
            </div>
          </div>
        )}

        {/* 게임 오버 */}
        {gameState.status === 'gameover' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
            <div className="text-center text-gray-700 bg-white/95 px-8 py-6 rounded-lg shadow-lg">
              <p className="text-2xl font-bold mb-2">GAME OVER</p>
              <p className="text-lg mb-4">
                Score: {Math.floor(gameState.score)}
              </p>
              <p className="text-sm text-gray-500">Press SPACE to Restart</p>
            </div>
          </div>
        )}
      </div>

      {/* 조작법 */}
      <div className="mt-2 text-gray-500 text-sm">
        <p>Space / ↑ : Jump | ↓ : Duck</p>
      </div>
    </div>
  );
};

export default DinoGamePage;
