// 결과 로딩 페이지
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { codeSubmission } from '../../api/codeSubmission';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useGameStore } from '../../stores/useGameStore';
import { useResultStore } from '../../stores/useResultStore';
import { useStore } from '../../stores/useStore';
import { useSubmissionStore } from '../../stores/useSubmissionStore';
import ErrorDisplay from './components/ErrorDisplay';

const ResultLoadingPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const roomId = useSubmissionStore((state) => state.roomId);
  const codeResult = useSubmissionStore((state) => state.result);
  const { accessToken } = useStore();
  const setSubmissionResult = useResultStore(
    (state) => state.setSubmissionResult,
  );
  const setSubmissionId = useGameStore((state) => state.setSubmissionId);

  const setGameState = useGameStore((state) => state.setGameState);

  const submitCode = () => {
    if (!roomId || !codeResult) return;

    setError(false);
    codeSubmission(roomId, codeResult, accessToken)
      .then((res) => {
        console.log(res);
        setSubmissionResult(res.result);
        setGameState(
          res.result.roomState.remainingLife,
          res.result.roomState.remainingHintCount,
        );
        setSubmissionId(res.result.submissionId);
        navigate('/result', { replace: true });
      })
      .catch(() => {
        setError(true);
      });
  };

  // React 18 StrictMode는 개발 환경에서 useEffect를 2번 실행함
  // (마운트 → 언마운트 → 재마운트)
  // ignore flag로 첫 번째 호출의 응답을 무시하여 중복 처리 방지
  // 단, API 호출 자체는 2번 발생하므로 서버에 중복 제출이 저장될 수 있음
  // 프로덕션에서는 1회만 실행되므로 실제 사용자에게는 영향 없음
  useEffect(() => {
    let ignore = false;

    if (!roomId || !codeResult) return;

    codeSubmission(roomId, codeResult, accessToken)
      .then((res) => {
        if (ignore) return;
        console.log(res);
        setSubmissionResult(res.result);
        setGameState(
          res.result.roomState.remainingLife,
          res.result.roomState.remainingHintCount,
        );
        navigate('/result', { replace: true });
      })
      .catch(() => {
        if (ignore) return;
        setError(true);
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (error) {
    return (
      <ErrorDisplay
        title="결과 제출에 실패했습니다"
        message="네트워크 연결을 확인하고 다시 시도해주세요"
        buttonText="다시 시도"
        onClick={submitCode}
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
