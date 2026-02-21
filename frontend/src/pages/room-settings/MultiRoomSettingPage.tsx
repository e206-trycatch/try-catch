import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { createMultiRoom, fetchMultiSetting } from '../../api/roomApi';
import MultiRoomSettingForm from '../../components/room-setting/MultiRoomSettingForm';
import RoomSettingLayout from '../../components/room-setting/RoomSettingLayout';
import { useRoomSettingInit } from '../../hooks/useRoomSettingInit';
import { useRoomStore } from '../../stores/useRoomStore';

const MultiRoomSettingPage = () => {
  const navigate = useNavigate();
  const { validateDraft, buildMultiRoomPayload, setRoomId } = useRoomStore();

  useRoomSettingInit(fetchMultiSetting, '멀티');

  const handleStartMultiMode = async () => {
    const validation = validateDraft();
    if (!validation.ok) {
      toast.warn(validation.errors.join('\n'), { containerId: 'global' });
      return;
    }

    const payload = buildMultiRoomPayload();
    if (!payload) {
      toast.error('방 생성 정보가 올바르지 않습니다.', {
        containerId: 'global',
      });
      return;
    }

    try {
      const result = await createMultiRoom(payload);
      setRoomId(result.roomId);
      navigate('/multi-room/lobby', {
        state: { roomId: result.roomId, invitationCode: result.invitationCode },
      });
    } catch (error) {
      console.error('방 생성 실패:', error);
      toast.error('방 생성에 실패했습니다. 다시 시도해주세요.', {
        containerId: 'global',
      });
    }
  };

  return (
    <RoomSettingLayout
      title="멀티모드 설정"
      buttonLabel="멀티모드로 시작하기"
      onStart={handleStartMultiMode}
    >
      <MultiRoomSettingForm />
    </RoomSettingLayout>
  );
};

export default MultiRoomSettingPage;
