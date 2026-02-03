import { useEffect, useRef } from 'react';

import { GAME_CONFIG } from '../constants/gameConfig';
import type { GameState } from '../types/gameTypes';

interface GameCanvasProps {
  gameState: GameState;
}

const drawClouds = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = GAME_CONFIG.COLOR_CLOUD;

  // 구름 1
  ctx.beginPath();
  ctx.ellipse(100, 40, 30, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(130, 40, 25, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // 구름 2
  ctx.beginPath();
  ctx.ellipse(400, 60, 25, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(425, 55, 20, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // 구름 3
  ctx.beginPath();
  ctx.ellipse(650, 35, 28, 14, 0, 0, Math.PI * 2);
  ctx.fill();
};

const drawGround = (ctx: CanvasRenderingContext2D, offset: number) => {
  ctx.fillStyle = GAME_CONFIG.COLOR_GROUND;

  // 메인 바닥 라인
  ctx.fillRect(0, GAME_CONFIG.GROUND_Y, GAME_CONFIG.CANVAS_WIDTH, 2);

  // 바닥 텍스처 (움직이는 점들)
  for (let i = 0; i < 50; i++) {
    const baseX = i * 20 - offset;
    const x =
      ((baseX % GAME_CONFIG.CANVAS_WIDTH) + GAME_CONFIG.CANVAS_WIDTH) %
      GAME_CONFIG.CANVAS_WIDTH;
    const y = GAME_CONFIG.GROUND_Y + 5 + (i % 3) * 3;
    const width = 2 + (i % 2);
    ctx.fillRect(x, y, width, 1);
  }
};

const drawDino = (
  ctx: CanvasRenderingContext2D,
  y: number,
  isDucking: boolean,
  isRunning: boolean,
  frame: number,
) => {
  ctx.fillStyle = GAME_CONFIG.COLOR_DINO;
  const x = GAME_CONFIG.DINO_X;

  if (isDucking) {
    // 숙인 공룡 - 몸통 (납작하게)
    ctx.fillRect(x, y + 15, 55, 20);

    // 머리
    ctx.fillRect(x + 40, y + 5, 20, 15);

    // 눈
    ctx.fillStyle = GAME_CONFIG.COLOR_SKY;
    ctx.fillRect(x + 52, y + 8, 4, 4);
    ctx.fillStyle = GAME_CONFIG.COLOR_DINO;

    // 다리 (짧게)
    const legOffset = isRunning && frame % 10 < 5 ? 3 : 0;
    ctx.fillRect(x + 5, y + 35 - legOffset, 8, 10 + legOffset);
    ctx.fillRect(x + 20, y + 35 + legOffset, 8, 10 - legOffset);
  } else {
    // 서있는 공룡 - 몸통
    ctx.fillRect(x + 10, y + 15, 30, 32);

    // 머리
    ctx.fillRect(x + 15, y, 35, 20);

    // 눈
    ctx.fillStyle = GAME_CONFIG.COLOR_SKY;
    ctx.fillRect(x + 40, y + 5, 5, 5);
    ctx.fillStyle = GAME_CONFIG.COLOR_DINO;

    // 입
    ctx.fillRect(x + 45, y + 12, 8, 3);

    // 팔
    ctx.fillRect(x + 5, y + 20, 10, 5);

    // 꼬리
    ctx.fillRect(x, y + 20, 12, 8);
    ctx.fillRect(x - 5, y + 25, 8, 5);

    // 다리 애니메이션
    if (isRunning) {
      const legOffset = frame % 10 < 5 ? 5 : 0;
      ctx.fillRect(x + 15, y + 47, 8, 12 - legOffset);
      ctx.fillRect(x + 28, y + 47 - legOffset, 8, 12 + legOffset);
    } else {
      ctx.fillRect(x + 15, y + 47, 8, 12);
      ctx.fillRect(x + 28, y + 47, 8, 12);
    }
  }
};

const drawObstacle = (
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  height: number,
  frame: number,
) => {
  ctx.fillStyle = GAME_CONFIG.COLOR_OBSTACLE;

  if (type === 'bird') {
    const y = GAME_CONFIG.GROUND_Y - height - 30;
    const wingUp = frame % 20 < 10;

    // 몸통
    ctx.fillRect(x + 10, y + 12, 30, 12);

    // 머리
    ctx.fillRect(x + 35, y + 8, 15, 10);

    // 부리
    ctx.fillRect(x + 48, y + 12, 8, 4);

    // 날개
    if (wingUp) {
      ctx.fillRect(x + 15, y, 20, 12);
    } else {
      ctx.fillRect(x + 15, y + 24, 20, 10);
    }

    // 꼬리
    ctx.fillRect(x, y + 10, 12, 8);
  } else {
    // 선인장
    const y = GAME_CONFIG.GROUND_Y - height;

    if (type === 'cactus-small') {
      // 작은 선인장
      ctx.fillRect(x + 5, y, 7, height);
      ctx.fillRect(x, y + 10, 5, 15);
      ctx.fillRect(x + 12, y + 5, 5, 12);
    } else {
      // 큰 선인장
      ctx.fillRect(x + 8, y, 10, height);
      ctx.fillRect(x, y + 15, 8, 20);
      ctx.fillRect(x + 18, y + 10, 7, 25);
    }
  }
};

const GameCanvas = ({ gameState }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 배경 지우기
    ctx.fillStyle = GAME_CONFIG.COLOR_SKY;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // 구름 그리기
    drawClouds(ctx);

    // 바닥 그리기
    drawGround(ctx, gameState.groundOffset);

    // 장애물 그리기
    gameState.obstacles.forEach((obstacle) => {
      drawObstacle(
        ctx,
        obstacle.type,
        obstacle.x,
        obstacle.height,
        frameRef.current,
      );
    });

    // 공룡 그리기
    drawDino(
      ctx,
      gameState.dino.y,
      gameState.dino.isDucking,
      gameState.status === 'playing',
      frameRef.current,
    );

    frameRef.current++;
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_CONFIG.CANVAS_WIDTH}
      height={GAME_CONFIG.CANVAS_HEIGHT}
      className="border-2 border-gray-300 rounded-lg"
    />
  );
};

export default GameCanvas;
