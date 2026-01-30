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
