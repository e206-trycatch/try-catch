// src/stores/room/roomUtils.ts
import type { CreateMultiRoomRequest } from '../../api/roomApi';
import type { CreateRoomRequest, RoomDraft } from './types';

export type ValidationResult = { ok: true } | { ok: false; errors: string[] };

/**
 * RoomDraft 유효성 검증 순수 함수
 */
export function validateDraft(draft: RoomDraft): ValidationResult {
  const {
    mode,
    themeId,
    life,
    hints,
    position,
    selectedFrameworkId,
    frontendId,
    backendId,
    roomName,
    hostPosition,
    hostFrameworkId,
    guestPosition,
    guestFrameworkId,
  } = draft;

  const errors: string[] = [];

  if (!mode) errors.push('플레이 모드를 선택해주세요.');
  if (!themeId) errors.push('플레이할 테마를 선택해주세요.');
  if (life < 1) errors.push('목숨은 최소 1개 이상이어야 합니다.');
  if (hints < 0) errors.push('힌트 개수는 0개 이상이어야 합니다.');

  // 싱글모드 검증
  if (mode === 'SINGLE') {
    if (!position) errors.push('포지션을 선택해주세요.');

    // FULLSTACK인 경우 frontendId와 backendId 둘 다 필수
    if (position === 'FULLSTACK') {
      if (!frontendId) errors.push('프론트엔드 프레임워크를 선택해주세요.');
      if (!backendId) errors.push('백엔드 프레임워크를 선택해주세요.');
    } else {
      // FRONTEND 또는 BACKEND인 경우 selectedFrameworkId 필수
      if (!selectedFrameworkId) errors.push('프레임워크를 선택해주세요.');
    }
  }

  // 멀티모드 검증
  if (mode === 'MULTI') {
    if (!roomName || roomName.trim() === '')
      errors.push('방 제목을 입력해주세요.');
    if (!hostPosition) errors.push('나의 포지션을 선택해주세요.');
    if (!hostFrameworkId) errors.push('나의 프레임워크를 선택해주세요.');
    if (!guestPosition) errors.push('상대의 포지션을 선택해주세요.');
    if (!guestFrameworkId) errors.push('상대의 프레임워크를 선택해주세요.');
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}

/**
 * 싱글 모드 방 생성 payload 생성 순수 함수
 */
export function buildCreatePayload(draft: RoomDraft): CreateRoomRequest | null {
  const validation = validateDraft(draft);
  if (!validation.ok) return null;

  const { themeId, position, selectedFrameworkId, frontendId, backendId } =
    draft;

  // FULLSTACK인 경우 frontId와 backId 둘 다 전송
  if (position === 'FULLSTACK') {
    return {
      themeId: themeId!,
      position: position!,
      frontId: frontendId!,
      backId: backendId!,
    };
  }

  // FRONTEND 또는 BACKEND인 경우
  return {
    themeId: themeId!,
    position: position!,
    frontId: position === 'FRONTEND' ? selectedFrameworkId : null,
    backId: position === 'BACKEND' ? selectedFrameworkId : null,
  };
}

/**
 * 멀티 모드 방 생성 payload 생성 순수 함수
 */
export function buildMultiRoomPayload(
  draft: RoomDraft,
): CreateMultiRoomRequest | null {
  const validation = validateDraft(draft);
  if (!validation.ok) return null;

  const { themeId, roomName, hostFrameworkId, guestFrameworkId } = draft;

  return {
    themeId: themeId!,
    roomName: roomName.trim(),
    host: {
      frameworkId: hostFrameworkId!,
    },
    guest: {
      frameworkId: guestFrameworkId!,
    },
  };
}
