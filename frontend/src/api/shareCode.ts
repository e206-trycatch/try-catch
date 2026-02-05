import type { FilePayload } from '@/pages/game/types/apiTypes';

import api from './api';

interface shareCodeResponse {
  files: FilePayload[];
}

export async function getShareCode(
  roomId: number,
  problemFrameworkId: number,
): Promise<shareCodeResponse> {
  const { data } = await api.get(
    `/rooms/multi/${roomId}/${problemFrameworkId}/partner-code`,
  );
  return data;
}
