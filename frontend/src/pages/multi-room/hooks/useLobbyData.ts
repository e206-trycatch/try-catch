import { useCallback, useEffect, useRef } from 'react';

import { fetchMultiRoomInfo } from '../../../api/roomApi';
import { useLobbyStore } from '../../../stores/useLobbyStore';
import { useSocketStore } from '../../../stores/useSocketStore';

const POLL_INTERVAL = 5000;

export const useLobbyData = (roomId: number | null) => {
  const { status, roomInfo, setRoomInfo, setStatus, setError } =
    useLobbyStore();
  const connected = useSocketStore((s) => s.connected);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const fetchData = useCallback(async () => {
    if (!roomId) return;

    try {
      if (statusRef.current === 'idle') {
        setStatus('loading');
      }
      const info = await fetchMultiRoomInfo(roomId);
      setRoomInfo(info);
    } catch (err) {
      if (statusRef.current !== 'success') {
        setError(
          err instanceof Error
            ? err.message
            : '방 정보를 불러오는데 실패했습니다.',
        );
      }
    }
  }, [roomId, setRoomInfo, setStatus, setError]);

  // 마운트 시 초기 fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // polling (소켓이 없거나 게스트가 아직 없을 때만)
  useEffect(() => {
    const shouldPoll = !connected || !roomInfo?.guest;
    if (!roomId || !shouldPoll) return;

    const intervalId = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [roomId, connected, roomInfo?.guest, fetchData]);

  return { refetch: fetchData };
};
