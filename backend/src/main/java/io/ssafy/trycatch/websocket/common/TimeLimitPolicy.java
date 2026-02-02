package io.ssafy.trycatch.websocket.common;

import io.ssafy.trycatch.domain.room.enums.RoomMode;
import io.ssafy.trycatch.domain.room.enums.RoomPosition;

import java.time.Duration;
import java.util.Arrays;

public enum TimeLimitPolicy {
    // ===== SINGLE =====
    SINGLE_FRONTEND(RoomMode.SINGLE, RoomPosition.FRONTEND, Duration.ofMinutes(20)),
    SINGLE_BACKEND(RoomMode.SINGLE, RoomPosition.BACKEND, Duration.ofMinutes(20)),
    SINGLE_FULLSTACK(RoomMode.SINGLE, RoomPosition.FULLSTACK, Duration.ofMinutes(30)),

    // ===== MULTI =====
    MULTI_FULLSTACK(RoomMode.MULTI, RoomPosition.FULLSTACK, Duration.ofMinutes(40));

    private final RoomMode mode;
    private final RoomPosition position;
    private final Duration limit;

    TimeLimitPolicy(RoomMode mode, RoomPosition position, Duration limit) {
        this.mode = mode;
        this.position = position;
        this.limit = limit;
    }

    public Duration getLimit() {
        return limit;
    }

    public static Duration resolve(RoomMode mode, RoomPosition position) {
        return Arrays.stream(values())
                .filter(p -> p.mode == mode && p.position == position)
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No time limit policy for mode=" + mode + ", position=" + position
                        )
                )
                .limit;
    }
}
