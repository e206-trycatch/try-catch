export type FilePayload = {
  filePath: string;
  fileType: string;
  code: string;
};

export type RolePayload = {
  files: FilePayload[];
};

export type GameStatus = 'PLAYING' | null;

export type SubmissionRequest = {
  problemFrameworkId: number | null;
  frontend?: RolePayload;
  backend?: RolePayload;
};

export type RoomState = {
  remainingLife: number;
  remainingHintCount: number;
};

export type Roles = {
  role: 'FRONTEND' | 'BACKEND' | 'FULLSTACK';
  frameworkId: number;
};

export type Next = {
  hasNextQuest: boolean;
  nextQuestId: number | null;
};

type BaseResponse = {
  submissionId: number;
  roomId: number;
  questId: number;
  questOrder: number;
  executionTimeMs: number;
  score: number;
  roomState: RoomState;
};

export type SuccessResponse = BaseResponse & {
  status: 'SUCCESS';
  roles: Roles[];
  next: Next;
};

export type FailResponse = BaseResponse & {
  status: 'FAIL';
  errorLog: string;
};

export type SubmissionResponse = {
  message: string;
  result: SuccessResponse | FailResponse;
};

// SubmissionResult는 SubmissionResponse의 result에서 roomState와 next를 제외한 타입에
// remainingLife, remainingHintCount, hasNextQuest, nextQuestId를 추가한 타입
// Omit<T, K> => T 타입에서 K 필드들 제거
export type SubmissionResult = Omit<
  SubmissionResponse['result'],
  'roomState' | 'next'
> & {
  remainingLife: number;
  remainingHintCount: number;
  hasNextQuest: boolean;
  nextQuestId: number | null;
};

export interface GameTimerResponse {
  roomId: number;
  status: GameStatus;
  startedAt: string;
  deadlineAt: string;

  serverNow?: string | null;
  remainingSeconds?: number | null;
  expired?: boolean | null;
}

export interface GameSessionHost {
  userId: number;
  nickname: string;
  frontId: number;
  frontName: string;
  isReady: boolean;
}

export interface GameSessionGuest {
  userId: number;
  nickname: string;
  backId: number;
  backName: string;
  isReady: boolean;
}

export interface GameSessionResponse {
  roomId: number;
  roomName: string;
  invitationCode: string;
  themeId: number;
  themeName: string;
  host: GameSessionHost;
  guest: GameSessionGuest;
  roomStatus: string;
}
