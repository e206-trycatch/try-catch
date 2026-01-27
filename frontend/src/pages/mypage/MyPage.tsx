// 마이페이지 메인 컨테이너

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../stores/useStore';
import { getProfile, getSubmissions } from '../../api/user';
import type { Profile, EscapeRecord } from './types/user';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ProfileSection from './ProfileSection';
import EscapeRecordSection from './EscapeRecordSection';

// API 응답 검증 헬퍼 함수
type ApiResponse = { status: number; result: unknown };
type ErrorMessages = { notFound: string; failed: string };

const validateResponse = (
  res: ApiResponse,
  errorMessages: ErrorMessages
): string | null => {
  if (res.status === 401) return 'UNAUTHORIZED';
  if (res.status === 404) return errorMessages.notFound;
  if (res.status !== 200 || !res.result) return errorMessages.failed;
  return null; // 성공
};

const MyPage = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [records, setRecords] = useState<EscapeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1차 로그인 체크 (토큰 없으면 API 호출 전에 이동)
  useEffect(() => {
    const accessToken = useStore.getState().accessToken;
    if (!accessToken) {
      navigate('/login');
    }
  }, [navigate]);

  // API 호출
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 두 API 동시 호출
        const [profileRes, submissionsRes] = await Promise.all([
          getProfile(),
          getSubmissions({ page: 0, size: 999 }),
        ]);

        // 프로필 응답 검증
        const profileError = validateResponse(profileRes, {
          notFound: '프로필 정보를 찾을 수 없습니다.',
          failed: '프로필 정보를 불러오는데 실패했습니다.',
        });

        // 제출 기록 응답 검증
        const submissionsError = validateResponse(submissionsRes, {
          notFound: '제출 기록을 찾을 수 없습니다.',
          failed: '제출 기록을 불러오는데 실패했습니다.',
        });

        // 인증 실패 → 로그인 이동
        if (profileError === 'UNAUTHORIZED' || submissionsError === 'UNAUTHORIZED') {
          navigate('/login');
          return;
        }

        // 에러 처리
        const error = profileError || submissionsError;
        if (error) {
          setError(error);
          setIsLoading(false);
          return;
        }

        // 성공
        setProfile(profileRes.result);
        setRecords(submissionsRes.result!.content);
        setIsLoading(false);
      } catch (err) {
        // 네트워크 오류 (서버 다운, 타임아웃 등)
        setError('서버에 연결할 수 없습니다.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  // 성공 시 렌더링
  return (
    <div className="bg-[#0d0d1a] text-white">
      {/* 첫 번째 화면: 프로필 섹션 (화면 전체 높이) */}
      <section className="min-h-screen flex flex-col">
        {/* 페이지 제목 */}
        <h1 className="text-3xl font-bold text-center pt-24 pb-8">마이페이지</h1>

        {/* 프로필 섹션 */}
        <div className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="w-full max-w-4xl">
            <ProfileSection profile={profile} />
          </div>
        </div>
      </section>

      {/* 두 번째 화면: 탈출 기록 섹션 (스크롤 후 표시) */}
      <section className="min-h-screen flex flex-col px-6 py-12">
        <div className="flex-1 flex items-start justify-center">
          <div className="w-full max-w-4xl">
            <EscapeRecordSection records={records} />
          </div>
        </div>

        {/* 푸터 */}
        <footer className="flex justify-between px-2 py-4 text-gray-500 text-sm mt-8">
          <span>ESCAPE<br />THE ROOM</span>
          <span className="text-right">CATCH ERROR<br />IF YOU CAN</span>
        </footer>
      </section>
    </div>
  );
};

export default MyPage;
