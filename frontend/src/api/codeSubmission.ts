import api from './api';

import type { SubmissionRequest } from '../pages/game/types/apiTypes';

export async function codeSubmission(
  roomId: string | null,
  body: SubmissionRequest,
) {
  const res = await api.post(`/rooms/${roomId}/submissions`, body, {
    timeout: 30000,
  });

  return res.data;
}
