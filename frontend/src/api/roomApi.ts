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
  room_id: string;
};

export const fetchSingleSetting = async (themeId: number) => {
  const res = await api.get<SingleSettingResponse>('/rooms/single', {
    params: { themeId },
  });
  return res.data;
};

export const createRoom = async (payload: CreateRoomRequest) => {
  const { data } = await api.post<CreateRoomResponse>('/rooms', payload);
  return data;
};
