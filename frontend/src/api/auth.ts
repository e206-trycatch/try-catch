// auth.ts
// 인증 관련 API 함수

import api from './api';

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
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
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
  const response = await api.post<SignupResponse>('/auth/signup', data);
  return response.data;
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
  const response = await api.get<CheckDuplicateResponse>(`/auth/check-loginId?loginId=${loginId}`);
  return response.data;
};

// 닉네임 중복 확인
export const checkNickname = async (nickname: string): Promise<CheckDuplicateResponse> => {
  const response = await api.get<CheckDuplicateResponse>(`/auth/check-nickname?nickname=${nickname}`);
  return response.data;
};

// 이메일 중복 확인
export const checkEmail = async (email: string): Promise<CheckDuplicateResponse> => {
  const response = await api.get<CheckDuplicateResponse>(`/auth/check-email?email=${email}`);
  return response.data;
};

// ===== 로그아웃 =====

// 로그아웃 응답
interface LogoutResponse {
  message: string;
}

// 로그아웃
export const logout = async (): Promise<LogoutResponse> => {
  const response = await api.post<LogoutResponse>('/auth/logout');
  return response.data;
};
