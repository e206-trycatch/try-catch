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

// 제출 기록 단일 항목
export interface EscapeRecord {
  submissionId: number;
  mode: 'SINGLE' | 'MULTI';
  themeName: string;
  framework: string;
  executionTime: number; // 초 단위 (2340 = 39분)
  submittedAt: string; // "2025-01-20 14:32:15" 형식
}

// 제출 기록 응답 (임시: 백엔드 연동 시 수정 필요)
export interface SubmissionsResponse {
  message: string;
  result: {
    content: EscapeRecord[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  } | null;
}
