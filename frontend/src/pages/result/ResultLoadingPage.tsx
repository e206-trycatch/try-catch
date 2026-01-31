// 결과 로딩 페이지
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { codeSubmission } from '../../api/codeSubmission';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useGameStore } from '../../stores/useGameStore';
import { useResultStore } from '../../stores/useResultStore';
import { useSubmissionStore } from '../../stores/useSubmissionStore';
import ErrorDisplay from './components/ErrorDisplay';

const ResultLoadingPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const roomId = useSubmissionStore((state) => state.roomId);
  const codeResult = useSubmissionStore((state) => state.result);
  const setSubmissionResult = useResultStore(
    (state) => state.setSubmissionResult,
  );
  const setSubmissionId = useGameStore((state) => state.setSubmissionId);
  const setGameState = useGameStore((state) => state.setGameState);

  // React 18 StrictMode는 개발 환경에서 useEffect를 2번 실행함
  // ignore flag로 첫 번째 호출의 응답을 무시하여 중복 처리 방지
  // 의존성 배열 참고: 실제 재실행 트리거는 retryCount뿐임
  // 나머지(roomId, codeResult 등)는 마운트 시 정해지고 변하지 않으나, ESLint 규칙 준수를 위해 포함
  useEffect(() => {
    let ignore = false;

    if (!roomId || !codeResult) return;

    codeSubmission(roomId, codeResult)
      .then((res) => {
        if (ignore) return;
        setSubmissionResult(res.result);
        setGameState(
          res.result.roomState.remainingLife,
          res.result.roomState.remainingHintCount,
        );
        setSubmissionId(res.result.submissionId);
        navigate('/result', { replace: true });
      })
      .catch(() => {
        if (ignore) return;
        setError(true);
      });

    return () => {
      ignore = true;
    };
  }, [
    retryCount,
    roomId,
    codeResult,
    navigate,
    setSubmissionResult,
    setGameState,
    setSubmissionId,
  ]);

  if (error) {
    return (
      <ErrorDisplay
        title="결과 제출에 실패했습니다"
        message="네트워크 연결을 확인하고 다시 시도해주세요"
        buttonText="다시 시도"
        onClick={() => {
          setError(false);
          setRetryCount((c) => c + 1);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <LoadingSpinner />
      <p className="text-white text-xl">결과를 불러오는 중...</p>
    </div>
  );
};

export default ResultLoadingPage;
