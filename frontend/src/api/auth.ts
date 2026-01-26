// auth.ts
// 인증 관련 API 함수

// import api from './api';

// ===== 타입 정의 =====

// 로그인 요청
interface LoginRequest {
  loginId: string;
  password: string;
}

// 로그인 응답
interface LoginResponse {
  status: number;
  message: string;
  result: {
    accessToken: string;
    nickname: string;
    profileUrl: string | null;
  } | null;
}

// ===== API 함수 =====

// 로그인
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  // ===== 목 데이터 (백엔드 완료 전) =====
  await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션

  if (data.loginId === 'test' && data.password === '1234') {
    return {
      status: 200,
      message: '로그인 성공',
      result: {
        accessToken: 'mock-access-token-xyz',
        nickname: '테스트',
        profileUrl: null,
      },
    };
  }

  // 실패 응답
  const error = {
    response: {
      status: 401,
      data: {
        status: 401,
        message: '아이디 또는 비밀번호가 일치하지 않습니다.',
        result: null,
      },
    },
  };
  throw error;

  // ===== 실제 API (백엔드 완료 후 주석 해제) =====
  // const response = await api.post<LoginResponse>('/auth/login', data);
  // return response.data;
};
