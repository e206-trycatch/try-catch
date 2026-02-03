import { type ParticipantInfo } from '../api/roomApi';

// 참가자 정보에서 포지션(FE/BE) 추출
export const getPosition = (p: ParticipantInfo): string => {
  if (p.position === 'FRONTEND') return 'Frontend';
  if (p.position === 'BACKEND') return 'Backend';
  return 'Unknown';
};
export const getFramework = (p: ParticipantInfo): string => {
  return p.frameworkName ?? 'Unknown';
};
