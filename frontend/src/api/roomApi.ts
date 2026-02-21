import type {
  AvailableFrameworks,
  CreateRoomRequest,
} from '../stores/useRoomStore';
import api from './api';

type SingleSettingResponse = {
  status: number;
  message: string;
  result: {
    themeId: number;
    themeName: string;
    availableFrameworks: AvailableFrameworks;
  };
};

type CreateRoomResponse = {
  roomId: number;
};

type MultiSettingResponse = {
  status: number;
  message: string;
  result: {
    themeId: number;
    themeName: string;
    availableFrameworks: AvailableFrameworks;
  };
};

export interface CreateMultiRoomRequest {
  themeId: number;
  roomName: string;
  host: {
    frameworkId: number;
  };
  guest: {
    frameworkId: number;
  };
}

type CreateMultiRoomResponse = {
  roomId: number;
  invitationCode: string;
};

export interface QuestDetail {
  questId: number;
  questOrder: number;
  title: string;
  description: string;
}

type QuestListResponse = {
  status: number;
  message: string;
  result: QuestDetail[];
};

export const fetchSingleSetting = async (themeId: number) => {
  const res = await api.get<SingleSettingResponse>('/rooms/single', {
    params: { themeId },
  });
  return res.data;
};

export const createRoom = async (payload: CreateRoomRequest) => {
  const { data } = await api.post<{ result: CreateRoomResponse }>(
    '/rooms/single',
    payload,
  );
  return data.result;
};

export const fetchQuestList = async (themeId: number) => {
  const res = await api.get<QuestListResponse>('/rooms/single/quest', {
    params: { themeId },
  });
  return res.data;
};

// 퀘스트 스토리 관련 타입
export interface QuestStory {
  storyId: number;
  storyOrder: number;
  imageUrl: string;
  content: string;
}

type QuestStoryResponse = {
  status: number;
  message: string;
  result: QuestStory[];
};

// 퀘스트 스토리 목록 조회
export const fetchQuestStories = async (questId: number) => {
  const res = await api.get<QuestStoryResponse>(
    `/rooms/single/quest/${questId}/story`,
  );
  return res.data;
};

// [멀티] 퀘스트 스토리 목록 조회
export const fetchMultiQuestStories = async (
  roomId: number,
  questId: number,
) => {
  const res = await api.get<QuestStoryResponse>(
    `/rooms/multi/${roomId}/story/${questId}`,
  );
  return res.data;
};

// 멀티 모드 방 정보 조회용 타입
export interface ParticipantInfo {
  userId: number;
  nickname: string;
  position?: 'FRONTEND' | 'BACKEND';
  frameworkId?: number;
  frameworkName?: string;
  isReady: boolean;
}

export interface MultiRoomInfo {
  roomId: number;
  roomName: string;
  invitationCode: string;
  themeId: number;
  themeName: string;
  roomStatus: string;
  host: ParticipantInfo;
  guest: ParticipantInfo | null;
}

type MultiRoomInfoResponse = {
  message: string;
  result: MultiRoomInfo;
};

// 멀티 모드 설정 조회
export const fetchMultiSetting = async (themeId: number) => {
  const res = await api.get<MultiSettingResponse>('/rooms/multi', {
    params: { themeId },
  });
  return res.data;
};

// 멀티 모드 방 생성
export const createMultiRoom = async (payload: CreateMultiRoomRequest) => {
  const { data } = await api.post<{ result: CreateMultiRoomResponse }>(
    '/rooms/multi',
    payload,
  );
  return data.result;
};

// 멀티 모드 방 정보 조회 (로비)
export const fetchMultiRoomInfo = async (
  roomId: number,
): Promise<MultiRoomInfo> => {
  const { data } = await api.get<MultiRoomInfoResponse>(
    `/rooms/multi/${roomId}`,
  );
  return data.result;
};

// 멀티 모드 방 나가기
export const leaveMultiRoom = async (roomId: number): Promise<void> => {
  await api.post(`/rooms/multi/${roomId}/leave`);
};

// 초대 코드로 멀티모드 방 입장
export const joinMultiRoomByCode = async (invitationCode: string) => {
  const { data } = await api.post<{ result: MultiRoomInfo }>(
    '/rooms/multi/join',
    { invitationCode },
  );
  return data.result;
};

// [멀티] 퀘스트 상세 정보 조회용 타입
export interface MultiQuestParticipant {
  userId: number;
  nickname: string;
  role: 'HOST' | 'GUEST';
  frameworkName: string;
  isReady: boolean;
}

export interface MultiQuestDetail {
  roomId: number;
  quest: {
    questId: number;
    questOrder: number;
    title: string;
    description: string;
  };
  participants: MultiQuestParticipant[];
}

type MultiQuestDetailResponse = {
  message: string;
  result: MultiQuestDetail;
};

// [멀티] 퀘스트 상세 정보 조회
export const fetchMultiQuestDetail = async (
  roomId: number,
  questId: number,
): Promise<MultiQuestDetail> => {
  const { data } = await api.get<MultiQuestDetailResponse>(
    `/rooms/multi/${roomId}/quest/${questId}`,
  );
  return data.result;
};
