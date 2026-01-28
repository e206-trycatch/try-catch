// 결과 로딩 페이지
// import { use, useCallback, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import { codeSubmission } from '../../api/codeSubmission';
// import { fetchSubmissionResult } from '../../api/submissionApi';
import { useStore } from '../../stores/useStore';
import { useSubmissionStore } from '../../stores/useSubmissionStore';
// import ErrorDisplay from './components/ErrorDisplay';

// type ErrorType = 'NO_ACCESS' | 'NETWORK_ERROR' | 'NOT_FOUND' | null;

const ResultLoadingPage = () => {
  // const navigate = useNavigate();
  const roomId = useSubmissionStore((state) => state.roomId);
  const codeResult = useSubmissionStore((state) => state.result);
  const { accessToken } = useStore();
  useEffect(() => {
    codeSubmission(roomId, codeResult!, accessToken).then((res) => {
      console.log(res);
    });
  });
  // const storedResult = useResultStore((state) => state.submissionResult);
  // // const roomId = useResultStore((state) => state.roomId);
  // const setSubmissionResult = useResultStore(
  //   (state) => state.setSubmissionResult,
  // );
  // const clearStore = useResultStore((state) => state.clear);

  // const [errorType, setErrorType] = useState<ErrorType>(null);

  // const refetch = useCallback(async () => {
  //   if (!roomId) return;

  //   setErrorType(null);

  //   try {
  //     const result = await fetchSubmissionResult(roomId);
  //     setSubmissionResult(result.data);
  //     navigate('/result', { replace: true });
  //   } catch (e) {
  //     if (e.response?.status === 404) {
  //       setErrorType('NOT_FOUND');
  //     } else {
  //       setErrorType('NETWORK_ERROR');
  //     }
  //   }
  // }, [roomId, setSubmissionResult, navigate]);

  // useEffect(() => {
  //   if (storedResult) {
  //     navigate('/result', { replace: true });
  //     return;
  //   }

  //   if (!roomId) {
  //     setErrorType('NO_ACCESS');
  //     return;
  //   }

  //   refetch();
  // }, [storedResult, roomId, navigate, refetch]);

  // const handleGoToMain = () => {
  //   clearStore();
  //   navigate('/');
  // };

  // // 에러 처리
  // if (errorType === 'NO_ACCESS') {
  //   return (
  //     <ErrorDisplay
  //       title="잘못된 접근입니다."
  //       message="문제 풀이 후 결과를 확인할 수 있습니다."
  //       buttonText="메인 페이지로 이동"
  //       onClick={handleGoToMain}
  //     />
  //   );
  // }

  // if (errorType === 'NOT_FOUND') {
  //   return (
  //     <ErrorDisplay
  //       title="결과를 찾을 수 없습니다."
  //       message="제출 기록이 존재하지 않습니다."
  //       buttonText="메인 페이지로 이동"
  //       onClick={handleGoToMain}
  //     />
  //   );
  // }

  // if (errorType === 'NETWORK_ERROR') {
  //   return (
  //     <ErrorDisplay
  //       title="결과를 불러오는데 실패했습니다."
  //       message="네트워크 연결을 확인해주세요."
  //       buttonText="다시 시도"
  //       onClick={refetch}
  //     />
  //   );
  // }

  // 로딩 중
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      <p className="text-white text-xl">결과를 불러오는 중...</p>
    </div>
  );
};

export default ResultLoadingPage;
