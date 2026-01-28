import axios from 'axios';

export async function startGame(
  roomId: number | null,
  accessToken?: string | null,
) {
  await axios.post(
    `/api/v1/rooms/${roomId}/start`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}
