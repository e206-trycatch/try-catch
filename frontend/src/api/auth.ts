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

// ===== 회원가입 =====

// 회원가입 요청
interface SignupRequest {
  loginId: string;
  password: string;
  email: string;
  nickname: string;
}

// 회원가입 응답
interface SignupResponse {
  loginId: string;
  password: string;
  nickname: string;
}

// 회원가입
export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  // ===== 목 데이터 (백엔드 완료 전) =====
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 성공 응답
  return {
    loginId: data.loginId,
    password: data.password,
    nickname: data.nickname,
  };

  // ===== 실제 API (백엔드 완료 후 주석 해제) =====
  // const response = await api.post<SignupResponse>('/auth/signup', data);
  // return response.data;
};

// ===== 중복 확인 =====

// 중복 확인 응답 타입
interface CheckDuplicateResponse {
  status: number;
  message: string;
  result: {
    available: boolean;
  };
}

// 아이디 중복 확인
export const checkLoginId = async (loginId: string): Promise<CheckDuplicateResponse> => {
  // ===== 목 데이터 (백엔드 완료 전) =====
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 'test'는 이미 사용 중인 아이디로 시뮬레이션
  if (loginId === 'test') {
    return {
      status: 409,
      message: '이미 사용 중인 아이디입니다.',
      result: { available: false },
    };
  }

  return {
    status: 200,
    message: '사용 가능한 아이디입니다.',
    result: { available: true },
  };

  // ===== 실제 API (백엔드 완료 후 주석 해제) =====
  // const response = await api.get<CheckDuplicateResponse>(`/auth/check-loginId?loginId=${loginId}`);
  // return response.data;
};

// 닉네임 중복 확인
export const checkNickname = async (nickname: string): Promise<CheckDuplicateResponse> => {
  // ===== 목 데이터 (백엔드 완료 전) =====
  await new Promise((resolve) => setTimeout(resolve, 300));

  // '테스트'는 이미 사용 중인 닉네임으로 시뮬레이션
  if (nickname === '테스트') {
    return {
      status: 409,
      message: '이미 사용 중인 닉네임입니다.',
      result: { available: false },
    };
  }

  return {
    status: 200,
    message: '사용 가능한 닉네임입니다.',
    result: { available: true },
  };

  // ===== 실제 API (백엔드 완료 후 주석 해제) =====
  // const response = await api.get<CheckDuplicateResponse>(`/auth/check-nickname?nickname=${nickname}`);
  // return response.data;
};

// 이메일 중복 확인
export const checkEmail = async (email: string): Promise<CheckDuplicateResponse> => {
  // ===== 목 데이터 (백엔드 완료 전) =====
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 'test@example.com'은 이미 사용 중인 이메일로 시뮬레이션
  if (email === 'test@example.com') {
    return {
      status: 409,
      message: '해당 이메일로 가입된 계정이 있습니다.',
      result: { available: false },
    };
  }

  return {
    status: 200,
    message: '사용 가능한 이메일',
    result: { available: true },
  };

  // ===== 실제 API (백엔드 완료 후 주석 해제) =====
  // const response = await api.get<CheckDuplicateResponse>(`/auth/check-email?email=${email}`);
  // return response.data;
};

// ===== 로그아웃 =====

// 로그아웃 응답
interface LogoutResponse {
  message: string;
}

// 로그아웃
export const logout = async (): Promise<LogoutResponse> => {
  // ===== 목 데이터 (백엔드 완료 전) =====
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { message: '로그아웃 되었습니다.' };

  // ===== 실제 API (백엔드 완료 후 주석 해제) =====
  // const response = await api.post<LogoutResponse>('/auth/logout');
  // return response.data;
};
