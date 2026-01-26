// SingleRoomSettingForm.tsx
import { useEffect, useMemo } from 'react';

import { MOCK_THEMES } from '../../mocks/mockData';
import { type Position, useRoomStore } from '../../stores/useRoomStore';
import SelectField from './SelectField';
import SettingRow from './SettingRow';
import ThemeDisplay from './ThemeDisplay';

const getThemeName = (themeId: number | null) => {
  if (!themeId) return '테마를 선택해주세요';
  const theme = MOCK_THEMES.find((t) => t.themeId === themeId);
  return theme ? theme.name : '알 수 없는 테마';
};

const SingleRoomSettingForm = () => {
  const { draft, availableFrameworks, setPosition, setSelectedFrameworkId } =
    useRoomStore();

  // ! draft.position이 null이면 기본값으로 'FRONTEND' 설정
  useEffect(() => {
    if (!draft.position) {
      setPosition('FRONTEND');
    }
  }, [draft.position, setPosition]);

  const positionSelectOptions = useMemo(
    () => [
      { label: 'Frontend', value: 'FRONTEND' },
      { label: 'Backend', value: 'BACKEND' },
    ],
    [],
  );

  const frameworkSelectOptions = useMemo(() => {
    if (!availableFrameworks || !draft.position) return [];

    const frameworks =
      draft.position === 'FRONTEND'
        ? availableFrameworks.FRONTEND
        : availableFrameworks.BACKEND;

    return frameworks.map((fw) => ({
      label: fw.name,
      value: fw.id.toString(),
    }));
  }, [availableFrameworks, draft.position]);

  const handlePositionChange = (newPosition: string) => {
    setPosition(newPosition as Position);
  };

  const handleFrameworkChange = (frameworkId: string) => {
    setSelectedFrameworkId(Number(frameworkId));
  };

  const themeName = useMemo(() => getThemeName(draft.themeId), [draft.themeId]);

  return (
    <div className="flex w-[550px] flex-col gap-[40px]">
      <SettingRow label="테마">
        <ThemeDisplay themeName={themeName} />
      </SettingRow>

      <SettingRow label="포지션">
        <div className="w-[368px] flex justify-start">
          <SelectField
            value={draft.position || 'FRONTEND'}
            onChange={handlePositionChange}
            options={positionSelectOptions}
            widthClassName="w-[140px]"
          />
        </div>
      </SettingRow>

      <SettingRow label="프레임워크">
        <div className="w-[368px] flex justify-start">
          <SelectField
            value={draft.selectedFrameworkId?.toString() || ''}
            onChange={handleFrameworkChange}
            options={frameworkSelectOptions}
            widthClassName="w-[140px]"
          />
        </div>
      </SettingRow>
    </div>
  );
};

export default SingleRoomSettingForm;
