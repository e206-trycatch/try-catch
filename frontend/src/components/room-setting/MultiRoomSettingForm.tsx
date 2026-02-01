import { useMemo } from 'react';

import { type Position, useRoomStore } from '../../stores/useRoomStore';
import ThemeDisplay from '../theme-selection/ThemeDisplay';
import RoomNameInput from './RoomNameInput';
import SelectField from './SelectField';
import SettingRow from './SettingRow';

const MultiRoomSettingForm = () => {
  const {
    draft,
    themeName,
    availableFrameworks,
    setRoomName,
    setHostPosition,
    setHostFrameworkId,
    setGuestPosition,
    setGuestFrameworkId,
  } = useRoomStore();

  // Position options (only FRONTEND and BACKEND for multi-mode)
  const positionOptions = useMemo(
    () => [
      { label: 'Frontend', value: 'FRONTEND' },
      { label: 'Backend', value: 'BACKEND' },
    ],
    [],
  );

  // Host framework options based on host position
  const hostFrameworkOptions = useMemo(() => {
    if (!availableFrameworks || !draft.hostPosition) return [];

    const frameworks =
      draft.hostPosition === 'FRONTEND'
        ? availableFrameworks.FRONTEND
        : availableFrameworks.BACKEND;

    return frameworks.map((fw) => ({
      label: fw.name,
      value: fw.id.toString(),
    }));
  }, [availableFrameworks, draft.hostPosition]);

  // Guest framework options based on guest position
  const guestFrameworkOptions = useMemo(() => {
    if (!availableFrameworks || !draft.guestPosition) return [];

    const frameworks =
      draft.guestPosition === 'FRONTEND'
        ? availableFrameworks.FRONTEND
        : availableFrameworks.BACKEND;

    return frameworks.map((fw) => ({
      label: fw.name,
      value: fw.id.toString(),
    }));
  }, [availableFrameworks, draft.guestPosition]);

  const handleHostPositionChange = (position: string) => {
    setHostPosition(position as Position);
  };

  const handleHostFrameworkChange = (frameworkId: string) => {
    setHostFrameworkId(Number(frameworkId));
  };

  const handleGuestPositionChange = (position: string) => {
    setGuestPosition(position as Position);
  };

  const handleGuestFrameworkChange = (frameworkId: string) => {
    setGuestFrameworkId(Number(frameworkId));
  };

  const displayThemeName = themeName || '테마를 선택해주세요';

  return (
    <div className="flex w-[550px] flex-col gap-[40px]">
      {/* Row 1: Room Name */}
      <SettingRow label="방 제목">
        <RoomNameInput
          value={draft.roomName}
          onChange={setRoomName}
          placeholder="방 제목을 입력하세요"
          widthClassName="w-[368px]"
        />
      </SettingRow>

      {/* Row 2: Theme (read-only) */}
      <SettingRow label="테마">
        <ThemeDisplay themeName={displayThemeName} />
      </SettingRow>

      {/* Row 3: Host (나) Configuration */}
      <SettingRow label="나">
        <div className="w-[368px] flex gap-[12px]">
          <SelectField
            value={draft.hostPosition || ''}
            onChange={handleHostPositionChange}
            options={positionOptions}
            widthClassName="w-[140px]"
            placeholder="선택해주세요"
          />
          <SelectField
            value={draft.hostFrameworkId?.toString() || ''}
            onChange={handleHostFrameworkChange}
            options={hostFrameworkOptions}
            widthClassName="w-[140px]"
            placeholder="선택해주세요"
          />
        </div>
      </SettingRow>

      {/* Row 4: Guest (상대) Configuration */}
      <SettingRow label="상대">
        <div className="w-[368px] flex gap-[12px]">
          <SelectField
            value={draft.guestPosition || ''}
            onChange={handleGuestPositionChange}
            options={positionOptions}
            widthClassName="w-[140px]"
            placeholder="선택해주세요"
          />
          <SelectField
            value={draft.guestFrameworkId?.toString() || ''}
            onChange={handleGuestFrameworkChange}
            options={guestFrameworkOptions}
            widthClassName="w-[140px]"
            placeholder="선택해주세요"
          />
        </div>
      </SettingRow>
    </div>
  );
};

export default MultiRoomSettingForm;
