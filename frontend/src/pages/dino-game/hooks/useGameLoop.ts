import { useCallback, useEffect, useRef } from 'react';

import { GAME_CONFIG } from '../constants/gameConfig';
import type {
  GameState,
  ObstacleState,
  ObstacleType,
} from '../types/gameTypes';

interface UseGameLoopProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const generateObstacleId = () => Math.random().toString(36).substring(2, 9);

const getRandomObstacleType = (): ObstacleType => {
  const rand = Math.random();
  if (rand < 0.4) return 'cactus-small';
  if (rand < 0.8) return 'cactus-large';
  return 'bird';
};

const getObstacleSize = (type: ObstacleType) => {
  switch (type) {
    case 'cactus-small':
      return {
        width: GAME_CONFIG.CACTUS_SMALL_WIDTH,
        height: GAME_CONFIG.CACTUS_SMALL_HEIGHT,
      };
    case 'cactus-large':
      return {
        width: GAME_CONFIG.CACTUS_LARGE_WIDTH,
        height: GAME_CONFIG.CACTUS_LARGE_HEIGHT,
      };
    case 'bird':
      return {
        width: GAME_CONFIG.BIRD_WIDTH,
        height: GAME_CONFIG.BIRD_HEIGHT,
      };
  }
};

const checkCollision = (state: GameState): boolean => {
  const dinoX = GAME_CONFIG.DINO_X;
  const dinoY = state.dino.y;
  const dinoWidth = GAME_CONFIG.DINO_WIDTH - 10;
  const dinoHeight = state.dino.isDucking
    ? GAME_CONFIG.DINO_DUCK_HEIGHT
    : GAME_CONFIG.DINO_HEIGHT - 10;

  for (const obstacle of state.obstacles) {
    const obstacleY =
      obstacle.type === 'bird'
        ? GAME_CONFIG.GROUND_Y - obstacle.height - 30
        : GAME_CONFIG.GROUND_Y - obstacle.height;

    if (
      dinoX < obstacle.x + obstacle.width &&
      dinoX + dinoWidth > obstacle.x &&
      dinoY < obstacleY + obstacle.height &&
      dinoY + dinoHeight > obstacleY
    ) {
      return true;
    }
  }
  return false;
};

const createObstacle = (): ObstacleState => {
  const type = getRandomObstacleType();
  const size = getObstacleSize(type);
  return {
    id: generateObstacleId(),
    type,
    x: GAME_CONFIG.CANVAS_WIDTH,
    ...size,
  };
};

export const useGameLoop = ({ setGameState }: UseGameLoopProps) => {
  const animationFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const lastTimeRef = useRef<number>(0);
  const obstacleTimerRef = useRef<number>(0);
  const nextObstacleAtRef = useRef<number>(500);

  const startLoop = useCallback(() => {
    lastTimeRef.current = 0;
    obstacleTimerRef.current = 0;
    nextObstacleAtRef.current = 500;
    isRunningRef.current = true;

    const loop = () => {
      if (!isRunningRef.current) return;

      const now = performance.now();
      const deltaTime = lastTimeRef.current ? now - lastTimeRef.current : 16;
      lastTimeRef.current = now;

      // 장애물 타이머 업데이트 및 생성 결정 (setGameState 바깥에서)
      obstacleTimerRef.current += deltaTime;

      // 장애물 생성 여부 결정 (setGameState 바깥에서)
      let newObstacle: ObstacleState | null = null;
      if (obstacleTimerRef.current >= nextObstacleAtRef.current) {
        newObstacle = createObstacle();
        obstacleTimerRef.current = 0;
        nextObstacleAtRef.current =
          GAME_CONFIG.MIN_OBSTACLE_INTERVAL +
          Math.random() *
            (GAME_CONFIG.MAX_OBSTACLE_INTERVAL -
              GAME_CONFIG.MIN_OBSTACLE_INTERVAL);
      }

      setGameState((prev) => {
        if (prev.status !== 'playing') return prev;

        // 공룡 물리 업데이트
        let newDinoY = prev.dino.y;
        let newVelocityY = prev.dino.velocityY;
        let newIsJumping = prev.dino.isJumping;

        if (prev.dino.isJumping) {
          newVelocityY += GAME_CONFIG.GRAVITY;
          newDinoY += newVelocityY;

          const groundLevel = prev.dino.isDucking
            ? GAME_CONFIG.GROUND_Y - GAME_CONFIG.DINO_DUCK_HEIGHT
            : GAME_CONFIG.GROUND_Y - GAME_CONFIG.DINO_HEIGHT;

          if (newDinoY >= groundLevel) {
            newDinoY = groundLevel;
            newVelocityY = 0;
            newIsJumping = false;
          }
        }

        // 속도 증가
        const newSpeed = Math.min(
          prev.speed + GAME_CONFIG.SPEED_INCREMENT,
          GAME_CONFIG.MAX_SPEED,
        );

        // 장애물 이동 및 제거
        const newObstacles = prev.obstacles
          .map((obs) => ({ ...obs, x: obs.x - newSpeed }))
          .filter((obs) => obs.x > -obs.width);

        // 새 장애물 추가 (클로저로 캡처된 값 사용)
        if (newObstacle) {
          newObstacles.push(newObstacle);
        }

        // 바닥 스크롤
        const newGroundOffset =
          (prev.groundOffset + newSpeed) % GAME_CONFIG.CANVAS_WIDTH;

        // 점수 업데이트
        const newScore = prev.score + GAME_CONFIG.SCORE_PER_FRAME;

        const newState: GameState = {
          ...prev,
          score: newScore,
          speed: newSpeed,
          groundOffset: newGroundOffset,
          dino: {
            ...prev.dino,
            y: newDinoY,
            velocityY: newVelocityY,
            isJumping: newIsJumping,
          },
          obstacles: newObstacles,
        };

        // 충돌 체크
        if (checkCollision(newState)) {
          isRunningRef.current = false;
          return {
            ...newState,
            status: 'gameover',
            highScore: Math.max(prev.highScore, Math.floor(newScore)),
          };
        }

        return newState;
      });

      if (isRunningRef.current) {
        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  }, [setGameState]);

  const stopLoop = useCallback(() => {
    isRunningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  return { startLoop, stopLoop };
};
