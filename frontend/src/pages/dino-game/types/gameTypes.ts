export type GameStatus = 'idle' | 'playing' | 'gameover';

export type ObstacleType = 'cactus-small' | 'cactus-large' | 'bird';

export interface Position {
  x: number;
  y: number;
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DinoState {
  y: number;
  velocityY: number;
  isJumping: boolean;
  isDucking: boolean;
}

export interface ObstacleState {
  id: string;
  type: ObstacleType;
  x: number;
  width: number;
  height: number;
}

export interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  speed: number;
  dino: DinoState;
  obstacles: ObstacleState[];
  groundOffset: number;
}
