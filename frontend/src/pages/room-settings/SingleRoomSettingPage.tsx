import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { fetchSingleSetting } from '../../api/roomApi';
import RoomSettingLayout from '../../components/room-setting/RoomSettingLayout';
import SingleRoomSettingForm from '../../components/room-setting/SingleRoomSettingForm';
import { useRoomSettingInit } from '../../hooks/useRoomSettingInit';
import { createRoomAndStartQuest } from '../../services/roomService';
import { useRoomStore } from '../../stores/useRoomStore';

const SingleRoomSettingPage = () => {
  const navigate = useNavigate();
  const {
    draft,
    validateDraft,
    buildCreatePayload,
    setRoomId,
    setCurrentQuestId,
  } = useRoomStore();

  useRoomSettingInit(fetchSingleSetting, '싱글');

  const handleStartGame = async () => {
    const validation = validateDraft();
    if (!validation.ok) {
      toast.warn(validation.errors.join('\n'), { containerId: 'global' });
      return;
    }

    const payload = buildCreatePayload();
    if (!payload) {
      toast.error('방 생성 정보가 올바르지 않습니다.', {
        containerId: 'global',
      });
      return;
    }

    const result = await createRoomAndStartQuest(payload, draft.themeId!);

    if (result.success) {
      setRoomId(result.roomId);
      setCurrentQuestId(result.questId);
      navigate('/story');
    } else {
      toast.error(result.error, { containerId: 'global' });
    }
  };

  return (
    <RoomSettingLayout
      title="싱글모드 설정"
      buttonLabel="싱글모드로 시작하기"
      onStart={handleStartGame}
    >
      <SingleRoomSettingForm />
    </RoomSettingLayout>
  );
};

export default SingleRoomSettingPage;
