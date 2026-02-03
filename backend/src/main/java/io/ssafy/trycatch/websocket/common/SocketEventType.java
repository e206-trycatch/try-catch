package io.ssafy.trycatch.websocket.common;

public enum SocketEventType {
    // 로비 이벤트
    PLAYER_JOINED,
    PLAYER_LEFT,
    READY_CHANGED,
    GAME_STARTED,

    // 퀘스트 이벤트
    QUEST_READY_STATUS,
    START_QUEST,

    // 게임 이벤트
    CODE_SAVED,
    SCREEN_CHANGE,
    TIMER_STARTED,
    TIMER_SYNC,
    TIME_OUT,
    SUBMISSION_STARTED,
    SUBMISSION_COMPLETED,
    RETRY_STARTED,

    // 힌트 채팅 이벤트
    HINT_MESSAGE
}