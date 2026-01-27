import axios from 'axios';

import type { SubmissionRequest } from '../pages/game/types/apiTypes';

export async function codeSubmission(
  roomId: number,
  body: SubmissionRequest,
  accessToken?: string,
) {
  const res = await axios.post(`/api/v1/rooms/${roomId}/submissions`, body, {
    headers: {
      'Content-Type': 'application/json; charset=utf8',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res.data;
}
