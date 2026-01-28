// 결과 페이지
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useResultStore } from '../../stores/useResultStore';
import FailResult from './components/FailResult';
import SuccessResult from './components/SuccessResult';

const ResultPage = () => {
  const navigate = useNavigate();
  const data = useResultStore((state) => state.submissionResult);

  // 데이터 없으면 로딩 페이지로 리다이렉트 (마운트 시에만 체크)
  useEffect(() => {
    if (!data) {
      navigate('/result/loading', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {data.status === 'SUCCESS' ? (
        <SuccessResult result={data} />
      ) : (
        <FailResult result={data} />
      )}
    </div>
  );
};

export default ResultPage;
