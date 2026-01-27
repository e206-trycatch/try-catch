export type FilePayload = {
  filePath: string;
  fileType: string;
  code: string;
};

export type RolePayload = {
  problemFrameworkId: number;
  files: FilePayload[];
};

export type SubmissionRequest = {
  frontend: RolePayload;
  backend: RolePayload;
};

export type SubmissionResponse = {
  data: {
    submissionId: number;
    roomId: number;
    questId: number;
    questOrder: number;
    status: 'SUCCESS' | 'FAIL' | null;
    score: number;
    executionTimeMs: number;
    roomState: {
      life: number;
      remainingHintCount: number;
    };
    roles: {
      role: 'FRONTEND' | 'BACKEND' | 'FULLSTACK';
      frameworkId: number;
    }[];
    next: {
      hasNextQuest: boolean;
      nextQuestId: number;
    };
  };
};
