import { gsap } from 'gsap';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../api/api';
import { joinMultiRoomByCode } from '../../api/roomApi';
import Envelope from '../../components/invitation-code/InvitationEnvelope';
import Letter from '../../components/invitation-code/InvitationLetter';
import { useRoomStore } from '../../stores/useRoomStore';
import { handleApiError } from '../../utils/errorUtils';

const InvitationPage: React.FC = () => {
  const navigate = useNavigate();
  const flapRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const setRoomId = useRoomStore((s) => s.setRoomId);
  const setThemeId = useRoomStore((s) => s.setThemeId);
  const setThemeName = useRoomStore((s) => s.setThemeName);
  const setThemeImageUrl = useRoomStore((s) => s.setThemeImageUrl);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.8 });

    tl.to(flapRef.current, {
      duration: 0.6,
      rotateX: 180,
      ease: 'power2.inOut',
    })
      .set(flapRef.current, { zIndex: 10 })
      .to(letterRef.current, {
        translateY: -370,
        duration: 0.9,
        ease: 'back.inOut(1.5)',
      })
      .set(letterRef.current, { zIndex: 40 })
      .to(letterRef.current, {
        duration: 0.8,
        ease: 'back.out(.4)',
        translateY: -10,
        translateZ: 180,
      });

    gsap.to(shadowRef.current, {
      delay: 1.6,
      width: 840,
      boxShadow: '-140px 280px 19px 9px #CCCBD5',
      ease: 'back.out(.2)',
      duration: 0.8,
    });
  }, []);

  const fetchThemeImageUrl = async (
    themeId: number,
  ): Promise<string | null> => {
    try {
      const { data } = await api.get('/themes');
      const themes = data.result?.result;
      if (Array.isArray(themes)) {
        const theme = themes.find(
          (t: { themeId: number }) => t.themeId === themeId,
        );
        return theme?.themeImageUrl ?? null;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleSubmitCode = useCallback(
    async (invitationCode: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const roomInfo = await joinMultiRoomByCode(invitationCode);
        if (!roomInfo?.roomId) {
          setError(
            '방 정보를 불러오는 데에 실패하였습니다. 다시 시도해주세요.',
          );
          return;
        }
        setRoomId(roomInfo.roomId);
        setThemeId(roomInfo.themeId);
        setThemeName(roomInfo.themeName);

        // GUEST는 ThemeSelectionPage를 거치지 않으므로 테마 이미지 URL을 별도로 가져옴
        const imageUrl = await fetchThemeImageUrl(roomInfo.themeId);
        setThemeImageUrl(imageUrl);

        navigate('/multi-room/lobby', {
          state: {
            roomId: roomInfo.roomId,
            invitationCode: roomInfo.invitationCode,
          },
        });
      } catch (err) {
        setError(
          handleApiError(err, {
            statusMessages: {
              404: '존재하지 않는 초대 코드입니다.',
              409: '이미 입장한 방 혹은 정원이 가득 찬 방입니다.',
              400: '잘못된 초대 코드 형식입니다.',
            },
            defaultMessage: '초대 코드 확인 중 오류가 발생하였습니다.',
          }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setRoomId, setThemeId, setThemeName, setThemeImageUrl],
  );

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative mt-32" style={{ perspective: '1500px' }}>
        {/* Shadow */}
        <div
          ref={shadowRef}
          className="absolute w-[370px] h-[1px] bg-transparent rounded-[30%] shadow-[93px 187px 19px 9px #CCCBD5]"
        />

        <Envelope>
          {/* Flap: 봉투의 덮개 부분 */}
          <div
            ref={flapRef}
            className="absolute top-0 left-0 w-full z-[30] origin-top"
            style={{
              borderTop: '215px solid #2b2949',
              borderLeft: '280px solid transparent',
              borderRight: '280px solid transparent',
            }}
          />

          {/* Letter: 내부 편지지 */}
          <Letter
            ref={letterRef}
            onSubmit={handleSubmitCode}
            isLoading={isLoading}
            error={error}
          />
        </Envelope>
      </div>
    </div>
  );
};

export default InvitationPage;
