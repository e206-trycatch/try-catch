import { createRoom, fetchQuestList } from '../api/roomApi';
import type { CreateRoomRequest } from '../stores/useRoomStore';

export type StartGameResult =
  | {
      success: true;
      roomId: number;
      questId: number;
    }
  | {
      success: false;
      error: string;
    };

/**
 * 방 생성 후 첫 번째 퀘스트 ID를 조회하는 서비스 함수
 * - 방 생성 API 호출
 * - 퀘스트 목록 조회 후 첫 번째 퀘스트 선택
 * - 성공/실패 결과를 구조화하여 반환
 */
export async function createRoomAndStartQuest(
  payload: CreateRoomRequest,
  themeId: number,
): Promise<StartGameResult> {
  try {
    // 1. 방 생성
    const roomResponse = await createRoom(payload);

    // 2. 퀘스트 목록 조회
    const questResponse = await fetchQuestList(themeId);

    if (!questResponse.result || questResponse.result.length === 0) {
      return {
        success: false,
        error: '해당 테마에 퀘스트가 없습니다.',
      };
    }

    // 3. 첫 번째 퀘스트 선택 (questOrder 기준)
    const firstQuest =
      questResponse.result.find((q) => q.questOrder === 1) ||
      questResponse.result[0];

    return {
      success: true,
      roomId: roomResponse.roomId,
      questId: firstQuest.questId,
    };
  } catch (error) {
    console.error('방 생성 실패:', error);
    return {
      success: false,
      error: '방 생성에 실패했습니다. 다시 시도해주세요.',
    };
  }
}
