import { useCallback, useEffect, useRef } from 'react';

import { fetchMultiRoomInfo } from '../../../api/roomApi';
import { useLobbyStore } from '../../../stores/useLobbyStore';

const POLL_INTERVAL = 5000;

export const useLobbyData = (roomId: number | null) => {
  const { status, setRoomInfo, setStatus, setError } = useLobbyStore();
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

  // polling
  useEffect(() => {
    if (!roomId) return;

    const intervalId = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [roomId, fetchData]);

  return { refetch: fetchData };
};
