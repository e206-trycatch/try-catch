// 결과 페이지 에러 타입 정의

export type ResultErrorType =
  | 'none'
  | 'invalid_room'
  | 'unauthorized'
  | 'network'
  | 'timeout';

export interface ErrorConfig {
  title: string;
  message: string;
  buttonText: string;
  action: 'retry' | 'home';
}

export const ERROR_CONFIGS: Record<
  Exclude<ResultErrorType, 'none'>,
  ErrorConfig
> = {
  invalid_room: {
    title: '잘못된 접근입니다',
    message: '게임 진행 정보를 찾을 수 없습니다',
    buttonText: '홈으로 이동',
    action: 'home',
  },
  unauthorized: {
    title: '접근 권한이 없습니다',
    message: '해당 게임에 참여하지 않았거나 세션이 만료되었습니다',
    buttonText: '홈으로 이동',
    action: 'home',
  },
  network: {
    title: '결과 제출에 실패했습니다',
    message: '네트워크 연결을 확인하고 다시 시도해주세요',
    buttonText: '다시 시도',
    action: 'retry',
  },
  timeout: {
    title: '채점 시간이 초과되었습니다',
    message: '잠시 후 다시 시도해주세요',
    buttonText: '다시 시도',
    action: 'retry',
  },
};
