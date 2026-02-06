// 결과 페이지
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useGameStore } from '../../stores/useGameStore';
import { useResultStore } from '../../stores/useResultStore';
import ErrorDisplay from './components/ErrorDisplay';
import MultiFailResult from './components/MultiFailResult';
import SingleFailResult from './components/SingleFailResult';
import SuccessResult from './components/SuccessResult';
import { ERROR_CONFIGS, type ResultErrorType } from './types/errorTypes';

const ResultPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const data = useResultStore((state) => state.submissionResult);
  const mode = useGameStore((state) => state.mode);
  const [errorType, setErrorType] = useState<ResultErrorType>('none');

  // 데이터 없으면 로딩 페이지로 리다이렉트 (마운트 시에만 체크)
  useEffect(() => {
    if (!data) {
      if (roomId) {
        navigate(`/result/loading/${roomId}`, { replace: true });
      } else {
        // roomId도 없으면 에러 UI 표시
        setErrorType('invalid_room');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 에러 상태: 에러 타입에 따른 UI 표시
  if (errorType !== 'none') {
    const config = ERROR_CONFIGS[errorType];
    return (
      <ErrorDisplay
        title={config.title}
        message={config.message}
        buttonText={config.buttonText}
        onClick={() => navigate('/')}
      />
    );
  }

  if (!data) return null;

  // 실패 결과: 모드에 따라 다른 컴포넌트 렌더링
  const renderFailResult = () => {
    // data.status가 'FAIL'일 때만 호출되므로 타입 단언 사용
    if (data.status !== 'FAIL') return null;

    if (mode === 'MULTI') {
      return <MultiFailResult result={data} />;
    }
    return <SingleFailResult result={data} />;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {data.status === 'SUCCESS' ? (
        <SuccessResult result={data} />
      ) : (
        renderFailResult()
      )}
    </div>
  );
};

export default ResultPage;
