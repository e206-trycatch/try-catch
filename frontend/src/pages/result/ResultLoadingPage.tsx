// 결과 로딩 페이지
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResultStore } from '../../stores/useResultStore';
import { fetchSubmissionResult } from '../../api/submissionApi';

type ErrorType = 'NO_ACCESS' | 'NETWORK_ERROR' | 'NOT_FOUND' | null;

const ResultLoadingPage = () => {
  const navigate = useNavigate();
  const storedResult = useResultStore((state) => state.submissionResult);
  const roomId = useResultStore((state) => state.roomId);
  const setSubmissionResult = useResultStore((state) => state.setSubmissionResult);
  const clearStore = useResultStore((state) => state.clear); // handleGoToMain에서 사용

  const [errorType, setErrorType] = useState<ErrorType>(null);

  const refetch = useCallback(async () => {
    if (!roomId) return;

    setErrorType(null);

    try {
      const result = await fetchSubmissionResult(roomId);
      setSubmissionResult(result.data);
      navigate('/result', { replace: true });
    } catch (e: any) {
      if (e.response?.status === 404) {
        setErrorType('NOT_FOUND');
      } else {
        setErrorType('NETWORK_ERROR');
      }
    }
  }, [roomId, setSubmissionResult, navigate]);

  useEffect(() => {
    if (storedResult) {
      navigate('/result', { replace: true });
      return;
    }

    if (!roomId) {
      setErrorType('NO_ACCESS');
      return;
    }

    refetch();
  }, [storedResult, roomId, navigate, refetch]);

  const handleGoToMain = () => {
    clearStore();
    navigate('/');
  };

  // 에러: 잘못된 접근
  if (errorType === 'NO_ACCESS') {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <p className="text-red-500">잘못된 접근입니다.</p>
        <p className="text-gray-400">문제 풀이 후 결과를 확인할 수 있습니다.</p>
        <button
          onClick={handleGoToMain}
          className="px-6 py-3 border border-white text-white"
        >
          메인 페이지로 이동
        </button>
      </div>
    );
  }

  // 에러: 결과 없음
  if (errorType === 'NOT_FOUND') {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <p className="text-red-500">결과를 찾을 수 없습니다.</p>
        <p className="text-gray-400">제출 기록이 존재하지 않습니다.</p>
        <button
          onClick={handleGoToMain}
          className="px-6 py-3 border border-white text-white"
        >
          메인 페이지로 이동
        </button>
      </div>
    );
  }

  // 에러: 네트워크
  if (errorType === 'NETWORK_ERROR') {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <p className="text-red-500">결과를 불러오는데 실패했습니다.</p>
        <p className="text-gray-400">네트워크 연결을 확인해주세요.</p>
        <button
          onClick={refetch}
          className="px-6 py-3 border border-white text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 로딩 중
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <p className="text-white text-xl">결과를 불러오는 중...</p>
    </div>
  );
};

export default ResultLoadingPage;
