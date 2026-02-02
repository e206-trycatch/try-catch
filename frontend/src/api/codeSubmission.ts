import type { SubmissionRequest } from '../pages/game/types/apiTypes';
import api from './api';

export async function codeSubmission(
  roomId: string | null,
  body: SubmissionRequest,
) {
  const res = await api.post(`/rooms/${roomId}/submissions`, body, {
    timeout: 90000,
  });

  return res.data;
}
