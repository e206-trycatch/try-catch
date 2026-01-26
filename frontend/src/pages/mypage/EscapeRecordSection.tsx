// 테마별 탈출 기록 섹션

import { useState } from 'react';
import type { EscapeRecord } from './types/user';
import EmptyState from '../../components/common/EmptyState';

interface EscapeRecordSectionProps {
  records: EscapeRecord[];
}

// 소요시간 포맷팅 (초 → "29분 01초")
const formatTime = (seconds: number | null | undefined): string => {
  if (seconds == null) return '-';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}분 ${secs.toString().padStart(2, '0')}초`;
};

// 날짜 포맷팅 ("2025-01-20 14:32:15" → "2026.01.28")
const formatDate = (dateString: string | null | undefined): string => {
  if (dateString == null) return '-';
  return dateString.split(/[T ]/)[0].replace(/-/g, '.');
};

const EscapeRecordSection = ({ records }: EscapeRecordSectionProps) => {
  // 탭 상태 (내부에서 관리)
  const [activeTab, setActiveTab] = useState<'SINGLE' | 'MULTI'>('SINGLE');

  // 현재 탭에 해당하는 기록만 필터링
  const filteredRecords = records.filter((r) => r.mode === activeTab);

  return (
    <div className="border border-purple-900/50 rounded-lg p-8 bg-[#12121f]">
      {/* 섹션 제목 */}
      <h2 className="text-center text-lg mb-8 text-gray-300">
        {'{'} 테마별 탈출 기록 {'}'}
      </h2>

      {/* 탭 버튼 */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('SINGLE')}
          className={`px-8 py-2 rounded font-medium transition-colors border ${
            activeTab === 'SINGLE'
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-white border-gray-600 hover:border-gray-400'
          }`}
        >
          싱글 모드
        </button>
        <button
          onClick={() => setActiveTab('MULTI')}
          className={`px-8 py-2 rounded font-medium transition-colors border ${
            activeTab === 'MULTI'
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-white border-gray-600 hover:border-gray-400'
          }`}
        >
          멀티 모드
        </button>
      </div>

      {/* 전체 기록이 없는 경우 */}
      {records.length === 0 ? (
        <EmptyState message="제출 기록이 없습니다." />
      ) : filteredRecords.length === 0 ? (
        /* 현재 탭에 해당하는 기록이 없는 경우 */
        <EmptyState
          message={`${activeTab === 'SINGLE' ? '싱글' : '멀티'} 모드 기록이 없습니다.`}
        />
      ) : (
        /* 테이블 */
        <div className="space-y-3">
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-4 gap-4 text-center text-gray-400 font-medium pb-2">
            <span>테마</span>
            <span>프레임워크</span>
            <span>소요 시간</span>
            <span>날짜</span>
          </div>

          {/* 테이블 바디 */}
          {filteredRecords.map((record) => (
            <div
              key={record.submissionId}
              className="grid grid-cols-4 gap-4 text-center"
            >
              <div className="bg-[#2a2a3d] rounded-lg py-3 px-4">
                {record.themeName}
              </div>
              <div className="bg-[#2a2a3d] rounded-lg py-3 px-4">
                {record.framework}
              </div>
              <div className="bg-[#2a2a3d] rounded-lg py-3 px-4">
                {formatTime(record.executionTime)}
              </div>
              <div className="bg-[#2a2a3d] rounded-lg py-3 px-4">
                {formatDate(record.submittedAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EscapeRecordSection;
