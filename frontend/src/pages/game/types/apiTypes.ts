export type FilePayload = {
  filePath: string;
  fileType: string;
  code: string;
};

export type RolePayload = {
  problemFrameworkId: number | null;
  files: FilePayload[];
};

export type SubmissionRequest = {
  frontend: RolePayload;
  backend: RolePayload;
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

export type SubmissionResponse = {
  message: string;
  result: {
    submissionId: number;
    roomId: number;
    questId: number;
    questOrder: number;
    status: 'SUCCESS' | 'FAIL' | null;
    score: number;
    executionTimeMs: number;
    roomState: RoomState;
    roles: Roles[];
    next: Next;
  };
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
