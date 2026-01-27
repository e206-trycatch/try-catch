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

export type SubmissionResult = {
  submissionId: number;
  roomId: number;
  questId: number;
  questOrder: number;
  status: 'SUCCESS' | 'FAIL' | null;
  score: number;
  executionTimeMs: number;
  remainingLife: number;
  remainingHintCount: number;
  roles: Roles[];
  hasNextQuest: boolean;
  nextQuestId: number | null;
};
