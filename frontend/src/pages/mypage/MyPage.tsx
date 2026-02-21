// 마이페이지 메인 컨테이너

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getProfile, getSubmissions } from '../../api/user';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useStore } from '../../stores/useStore';
import EscapeRecordSection from './EscapeRecordSection';
import ProfileSection from './ProfileSection';
import type { EscapeRecord, Profile } from './types/user';

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
          getSubmissions({ page: 1, size: 999 }),
        ]);

        // 성공: 결과가 없으면 에러 처리
        if (!profileRes.result) {
          setError('프로필 정보를 찾을 수 없습니다.');
          setIsLoading(false);
          return;
        }

        if (!submissionsRes.result) {
          setError('제출 기록을 찾을 수 없습니다.');
          setIsLoading(false);
          return;
        }

        setProfile(profileRes.result);
        setRecords(submissionsRes.result.submissions);
        setIsLoading(false);
      } catch (err) {
        // 401은 interceptor에서 처리 (alert + 로그아웃)
        // 그 외 에러만 여기서 처리
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError('정보를 찾을 수 없습니다.');
        } else {
          setError('서버에 연결할 수 없습니다.');
        }
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
        <h1 className="text-3xl font-bold text-center pt-24 pb-8">
          마이페이지
        </h1>

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
      </section>
    </div>
  );
};

export default MyPage;
