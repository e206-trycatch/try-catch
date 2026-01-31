// 프로필 조회 섹션 (1차: 조회만, 2차: 수정 기능 추가 예정)

import defaultProfile from '../../assets/images/icons/default_profile.png';
import type { Profile } from './types/user';

interface ProfileSectionProps {
  profile: Profile | null;
}

const ProfileSection = ({ profile }: ProfileSectionProps) => {
  if (!profile) return null;

  return (
    <div className="border border-purple-900/50 rounded-lg p-8 bg-[#12121f]">
      {/* 섹션 제목 */}
      <h2 className="text-center text-lg mb-8 text-gray-300">
        {'{'} 회원정보 수정 {'}'}
      </h2>

      <div className="flex gap-12">
        {/* 프로필 이미지 영역 */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-40 h-48 bg-[#2a2a3d] rounded overflow-hidden">
            <img
              src={profile.profileUrl || defaultProfile}
              alt="프로필 이미지"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = defaultProfile;
              }}
            />
          </div>
          <button className="px-6 py-1 bg-white text-black text-sm rounded hover:bg-gray-200 transition-colors">
            수정
          </button>
        </div>

        {/* 폼 필드 영역 */}
        <div className="flex-1 space-y-4">
          {/* 닉네임 */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">닉네임</label>
            <div className="flex gap-2">
              <input
                type="text"
                defaultValue={profile.nickname}
                className="flex-1 px-4 py-2 bg-[#2a2a3d] border border-gray-700 rounded text-white"
                readOnly
              />
              <button className="px-4 py-2 bg-white text-black text-sm rounded hover:bg-gray-200 transition-colors">
                중복확인
              </button>
              <button className="px-4 py-2 bg-white text-black text-sm rounded hover:bg-gray-200 transition-colors">
                수정
              </button>
            </div>
          </div>

          {/* 아이디 */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">아이디</label>
            <div className="flex gap-2">
              <input
                type="text"
                defaultValue={profile.loginId}
                className="flex-1 px-4 py-2 bg-[#2a2a3d] border border-gray-700 rounded text-white"
                readOnly
              />
              <button className="px-4 py-2 bg-white text-black text-sm rounded hover:bg-gray-200 transition-colors">
                확인
              </button>
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">비밀번호</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="비밀번호"
                className="flex-1 px-4 py-2 bg-[#2a2a3d] border border-gray-700 rounded text-white placeholder-gray-600"
                readOnly
              />
              <button className="px-4 py-2 bg-white text-black text-sm rounded hover:bg-gray-200 transition-colors">
                수정
              </button>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              비밀번호 확인
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="비밀번호 확인"
                className="flex-1 px-4 py-2 bg-[#2a2a3d] border border-gray-700 rounded text-white placeholder-gray-600"
                readOnly
              />
              <button className="px-4 py-2 bg-white text-black text-sm rounded hover:bg-gray-200 transition-colors">
                확인
              </button>
            </div>
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">이메일</label>
            <div className="flex gap-2">
              <input
                type="email"
                defaultValue={profile.email}
                className="flex-1 px-4 py-2 bg-[#2a2a3d] border border-gray-700 rounded text-white"
                readOnly
              />
              <button className="px-4 py-2 bg-white text-black text-sm rounded hover:bg-gray-200 transition-colors">
                확인
              </button>
            </div>
          </div>

          {/* 프로필 저장 링크 */}
          <div className="text-right pt-4">
            <button className="text-gray-400 hover:text-white transition-colors underline">
              {'>'} 프로필 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
