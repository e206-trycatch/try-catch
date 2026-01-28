// 프로필 데이터 (백엔드 UserProfileRespDto 기준)
export interface Profile {
  id: number;
  loginId: string;
  nickname: string;
  email: string;
  profileUrl: string;
}

// 프로필 응답
export interface ProfileResponse {
  message: string;
  result: Profile | null;
}

// 제출 기록 단일 항목 (백엔드 SubmissionHistoryRespDto 기준)
export interface EscapeRecord {
  submissionId: number;
  gameMode: 'SINGLE' | 'MULTI';
  themeName: string;
  frameworkName: string;
  executionTime: number; // 초 단위 (2340 = 39분)
  submittedAt: string; // "2025-01-20T14:32:15" 형식
}

// 페이지 정보
export interface PageInfo {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
}

// 제출 기록 응답 (백엔드 SubmissionHistoryRespDto 기준)
export interface SubmissionsResponse {
  message: string;
  result: {
    submissions: EscapeRecord[];
    pageInfo: PageInfo;
  } | null;
}
