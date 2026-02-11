// SingleRoomSettingForm.tsx
import { useMemo } from 'react';

import { type Position, useRoomStore } from '../../stores/useRoomStore';
import ThemeDisplay from '../theme-selection/ThemeDisplay';
import SelectField from './SelectField';
import SettingRow from './SettingRow';

const SingleRoomSettingForm = () => {
  const {
    draft,
    themeName,
    availableFrameworks,
    setPosition,
    setSelectedFrameworkId,
    setFullstackFrameworks, // FULLSTACK용 액션 추가
  } = useRoomStore();

  // position은 사용자가 직접 선택하도록 함 (기본값 강제 설정 제거)

  // 포지션 옵션에 FULLSTACK 추가
  const positionSelectOptions = useMemo<
    { label: string; value: Position }[]
  >(
    () => [
      { label: 'Frontend', value: 'FRONTEND' },
      { label: 'Backend', value: 'BACKEND' },
      { label: 'Full-stack', value: 'FULLSTACK' },
    ],
    [],
  );

  // FULLSTACK이 아닌 경우의 프레임워크 옵션 (기존 로직 유지)
  const frameworkSelectOptions = useMemo(() => {
    if (!availableFrameworks || !draft.position) return [];
    if (draft.position === 'FULLSTACK') return []; // FULLSTACK은 별도 처리

    const frameworks =
      draft.position === 'FRONTEND'
        ? availableFrameworks.FRONTEND
        : availableFrameworks.BACKEND;

    return frameworks.map((fw) => ({
      label: fw.name,
      value: fw.id.toString(),
    }));
  }, [availableFrameworks, draft.position]);

  // FULLSTACK용 프론트엔드 프레임워크 옵션
  const frontendFrameworkOptions = useMemo(() => {
    if (!availableFrameworks?.FRONTEND) return [];
    return availableFrameworks.FRONTEND.map((fw) => ({
      label: fw.name,
      value: fw.id.toString(),
    }));
  }, [availableFrameworks]);

  // FULLSTACK용 백엔드 프레임워크 옵션
  const backendFrameworkOptions = useMemo(() => {
    if (!availableFrameworks?.BACKEND) return [];
    return availableFrameworks.BACKEND.map((fw) => ({
      label: fw.name,
      value: fw.id.toString(),
    }));
  }, [availableFrameworks]);

  const handlePositionChange = (newPosition: Position) => {
    setPosition(newPosition);
  };

  const handleFrameworkChange = (frameworkId: string) => {
    setSelectedFrameworkId(Number(frameworkId));
  };

  // FULLSTACK 프론트엔드 프레임워크 변경 핸들러
  const handleFrontendFrameworkChange = (frameworkId: string) => {
    setFullstackFrameworks(Number(frameworkId), draft.backendId);
  };

  // FULLSTACK 백엔드 프레임워크 변경 핸들러
  const handleBackendFrameworkChange = (frameworkId: string) => {
    setFullstackFrameworks(draft.frontendId, Number(frameworkId));
  };

  const displayThemeName = themeName || '테마를 선택해주세요';

  return (
    <div className="flex w-[550px] flex-col gap-[40px]">
      <SettingRow label="테마">
        <ThemeDisplay themeName={displayThemeName} />
      </SettingRow>

      <SettingRow label="포지션">
        <div className="w-[368px] flex justify-start">
          <SelectField<Position>
            value={draft.position || ''}
            onChange={handlePositionChange}
            options={positionSelectOptions}
            widthClassName="w-[140px]"
            placeholder="선택해주세요"
          />
        </div>
      </SettingRow>

      {/* 프레임워크 선택 - FULLSTACK이면 2개, 아니면 1개 */}
      {draft.position === 'FULLSTACK' ? (
        <>
          {/* FULLSTACK: 프론트엔드 프레임워크 선택 */}
          <SettingRow label="프론트엔드">
            <div className="w-[368px] flex justify-start">
              <SelectField
                value={draft.frontendId?.toString() || ''}
                onChange={handleFrontendFrameworkChange}
                options={frontendFrameworkOptions}
                widthClassName="w-[140px]"
                placeholder="선택해주세요"
              />
            </div>
          </SettingRow>

          {/* FULLSTACK: 백엔드 프레임워크 선택 */}
          <SettingRow label="백엔드">
            <div className="w-[368px] flex justify-start">
              <SelectField
                value={draft.backendId?.toString() || ''}
                onChange={handleBackendFrameworkChange}
                options={backendFrameworkOptions}
                widthClassName="w-[140px]"
                placeholder="선택해주세요"
              />
            </div>
          </SettingRow>
        </>
      ) : (
        // FRONTEND 또는 BACKEND: 기존 단일 프레임워크 선택
        <SettingRow label="프레임워크">
          <div className="w-[368px] flex justify-start">
            <SelectField
              value={draft.selectedFrameworkId?.toString() || ''}
              onChange={handleFrameworkChange}
              options={frameworkSelectOptions}
              widthClassName="w-[140px]"
              placeholder="선택해주세요"
            />
          </div>
        </SettingRow>
      )}
    </div>
  );
};

export default SingleRoomSettingForm;
