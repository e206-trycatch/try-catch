import { type ParticipantInfo } from '../api/roomApi';

// 참가자 정보에서 포지션(FE/BE) 추출
export const getPosition = (p: ParticipantInfo): string => {
  if (p.frontId != null) return 'Frontend';
  if (p.backId != null) return 'Backend';
  return 'Unknown';
};

// 참가자 정보에서 선택한 프레임워크 언어 추출
export const getFramework = (p: ParticipantInfo): string => {
  if (p.frontName) return p.frontName;
  if (p.backName) return p.backName;
  return 'Unknown';
};
